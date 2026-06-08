import { Project, Slide } from "../types";
import { uid } from "./storage";

export interface ParsedSlide {
  titulo: string;
  destaque: string;
  secondary: string;
  balao: string;
}

export interface ParsedAI {
  slides: ParsedSlide[];
  caption: string;
  hashtags: string;
}

function deaccent(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalizeInput(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\uFEFF/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\uFF1A]/g, ":"); // colon fullwidth
}

/** Remove markdown leve que a IA às vezes coloca nos rótulos ou no texto. */
function stripMd(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#+\s*/, "")
    .trim();
}

const LABEL_RE =
  /^(?:#{1,3}\s*)?(?:\*\*)?(slide\s*\d+|t[ií]tulo|destaque|secund[aá]rio|bal[aã]o|legenda|hashtags?)(?:\*\*)?\s*:?\s*(.*)$/i;

/**
 * Lê a resposta de uma IA no formato:
 *   Slide 1
 *   Título: ...
 *   Destaque: ...
 *   Secundário: ... (pode ter várias linhas)
 *   Balão: ...
 */
export function parseAIResponse(text: string): ParsedAI {
  const lines = normalizeInput(text).split("\n");
  const slides: ParsedSlide[] = [];
  let cur: ParsedSlide | null = null;
  let mode: "secondary" | "caption" | "hashtags" | null = null;
  const secondaryBuf: string[] = [];
  const captionBuf: string[] = [];
  let hashtags = "";

  function flushSecondary() {
    if (cur) cur.secondary = secondaryBuf.join("\n").trim();
    secondaryBuf.length = 0;
  }

  function startSlide(): ParsedSlide {
    const slide: ParsedSlide = { titulo: "", destaque: "", secondary: "", balao: "" };
    slides.push(slide);
    cur = slide;
    mode = null;
    return slide;
  }

  function ensureSlide(): ParsedSlide {
    return cur ?? startSlide();
  }

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || /^[-—]{3,}$/.test(trimmed)) {
      if (mode === "caption") captionBuf.push("");
      continue;
    }

    const line = stripMd(trimmed);
    const m = line.match(LABEL_RE);

    if (m) {
      const label = deaccent(m[1]);
      const rest = stripMd((m[2] ?? "").trim());

      if (mode === "secondary") flushSecondary();

      if (label.startsWith("slide")) {
        startSlide();
        continue;
      }
      if (label.startsWith("titulo")) {
        const prev = slides[slides.length - 1];
        if (prev?.titulo) startSlide();
        ensureSlide().titulo = rest;
        mode = null;
        continue;
      }
      if (label.startsWith("destaque")) {
        ensureSlide().destaque = rest;
        mode = null;
        continue;
      }
      if (label.startsWith("secund")) {
        ensureSlide();
        if (rest) secondaryBuf.push(rest.replace(/^[-•]\s*/, ""));
        mode = "secondary";
        continue;
      }
      if (label.startsWith("balao")) {
        ensureSlide().balao = rest;
        mode = null;
        continue;
      }
      if (label.startsWith("legenda")) {
        if (rest) captionBuf.push(rest);
        mode = "caption";
        continue;
      }
      if (label.startsWith("hashtag")) {
        hashtags = rest;
        mode = "hashtags";
        continue;
      }
    }

    const numSlide = line.match(/^(\d+)[.)]\s*$/);
    if (numSlide) {
      if (mode === "secondary") flushSecondary();
      startSlide();
      continue;
    }

    if (mode === "secondary") secondaryBuf.push(line.replace(/^[-•]\s*/, ""));
    else if (mode === "caption") captionBuf.push(line);
    else if (mode === "hashtags") hashtags += (hashtags ? " " : "") + line;
  }

  if (mode === "secondary") flushSecondary();

  return {
    slides: slides
      .map((s) => ({
        titulo: s.titulo.trim(),
        destaque: s.destaque.trim(),
        secondary: s.secondary.trim(),
        balao: s.balao.trim(),
      }))
      .filter((s) => s.titulo || s.secondary || s.destaque),
    caption: captionBuf.join("\n").trim(),
    hashtags: hashtags.trim(),
  };
}

function pickTemplate(ps: ParsedSlide, tmpl: Slide, index: number, total: number): Slide["templateId"] {
  const lines = ps.secondary.split("\n").filter((l) => l.trim()).length;
  if (index === total - 1) return "t8";
  if (index === 0) return lines >= 2 ? "t1" : "t5";
  if (lines >= 3) return "t9";
  if (lines >= 1) return "t6";
  return tmpl.templateId;
}

/** Aplica o conteúdo da IA sobre um projeto base, preservando o design dos slides. */
export function applyAIResponse(base: Project, parsed: ParsedAI): Project {
  if (!parsed.slides.length) return base;

  const total = parsed.slides.length;
  const slides = parsed.slides.map((ps, i) => {
    const tmpl = base.slides[i] ?? base.slides[base.slides.length - 1];
    let title = ps.titulo;
    const destaque = ps.destaque;
    if (destaque && title && !title.includes(destaque)) {
      title = `${title}\n${destaque}`;
    }
    const secLines = ps.secondary.split("\n").filter((l) => l.trim()).length;
    const templateId = pickTemplate(ps, tmpl, i, total);
    return {
      ...tmpl,
      id: uid(),
      templateId,
      title: title || tmpl.title,
      secondary: ps.secondary,
      highlight: destaque,
      handNote: ps.balao,
      listStyle: templateId === "t9" && secLines >= 2 ? ("brace" as const) : ("none" as const),
      showHandle: i === 0,
      showSignature: i === total - 1,
    };
  });

  return {
    ...base,
    meta: { ...base.meta, slidesCount: slides.length },
    slides,
    caption: parsed.caption || base.caption,
    hashtags: parsed.hashtags || base.hashtags,
    updatedAt: Date.now(),
  };
}
