import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ClipboardPaste,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Images,
  Layout,
  RefreshCw,
  Shuffle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Align, BrandKit, ListStyle, LayoutId, Project, Slide, SlideImage } from "../types";
import { SlideCanvas } from "./SlideCanvas";
import { SlideSidebar } from "./SlideSidebar";
import { templates } from "../data/templates";
import { regenerateSlideText } from "../utils/copyGenerator";
import { uid } from "../utils/storage";
import { downloadCaption, exportCarousel, exportSingle } from "../utils/exportSlides";
import { buildAIPrompt } from "../utils/aiPrompt";
import { PromptDialog } from "./PromptDialog";
import { applyAIResponse, ParsedAI } from "../utils/aiParser";
import { PasteAIDialog } from "./PasteAIDialog";

interface Props {
  project: Project;
  brand: BrandKit;
  onUpdate: (project: Project) => void;
  onBack: () => void;
}

const PREVIEW_SCALE = 0.42;

const defaultImage = (src: string): SlideImage => ({
  src,
  zoom: 1,
  posX: 50,
  posY: 50,
  saturate: 100,
  contrast: 100,
  warm: 35,
  blur: 0,
});

const blankSlide = (brand: BrandKit): Slide => ({
  id: uid(),
  templateId: "t6",
  title: "Novo slide",
  secondary: "",
  highlight: "",
  accent: brand.palette.orange,
  align: "left",
  titleSize: 84,
  grain: brand.grain,
  darken: brand.darken,
  image: null,
  listStyle: "none",
  handNote: "",
  showHandle: false,
  showSignature: false,
});

const listStyles: { v: ListStyle; label: string }[] = [
  { v: "none", label: "Texto" },
  { v: "brace", label: "Chaves" },
  { v: "arrow", label: "Setas" },
  { v: "dash", label: "Traços" },
  { v: "number", label: "Números" },
];

export function Editor({ project, brand, onUpdate, onBack }: Props) {
  const [proj, setProj] = useState<Project>(project);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);

  function applyAI(parsed: ParsedAI) {
    setProj((p) => applyAIResponse(p, parsed));
    setIdx(0);
    setShowPaste(false);
  }

  useEffect(() => {
    onUpdate({ ...proj, updatedAt: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proj]);

  const current = proj.slides[Math.min(idx, proj.slides.length - 1)];

  function patchSlide(patch: Partial<Slide>) {
    setProj((p) => {
      const slides = [...p.slides];
      slides[idx] = { ...slides[idx], ...patch };
      return { ...p, slides };
    });
  }

  function patchImage(patch: Partial<SlideImage>) {
    if (!current.image) return;
    patchSlide({ image: { ...current.image, ...patch } });
  }

  function onUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patchSlide({ image: defaultImage(String(reader.result)) });
    reader.readAsDataURL(file);
  }

  function regenText() {
    patchSlide(regenerateSlideText(proj.meta, brand, idx));
  }

  function regenDesign() {
    const others = templates.map((t) => t.id).filter((id) => id !== current.templateId);
    const next = others[Math.floor(Math.random() * others.length)] as LayoutId;
    patchSlide({ templateId: next });
  }

  function duplicateSlide() {
    setProj((p) => {
      const slides = [...p.slides];
      slides.splice(idx + 1, 0, { ...slides[idx], id: uid() });
      return { ...p, slides };
    });
    setIdx((i) => i + 1);
  }

  function deleteSlide() {
    if (proj.slides.length <= 1) return;
    setProj((p) => {
      const slides = p.slides.filter((_, i) => i !== idx);
      return { ...p, slides };
    });
    setIdx((i) => Math.max(0, i - 1));
  }

  function moveSlide(from: number, to: number) {
    if (to < 0 || to >= proj.slides.length) return;
    setProj((p) => {
      const slides = [...p.slides];
      const [m] = slides.splice(from, 1);
      slides.splice(to, 0, m);
      return { ...p, slides };
    });
    setIdx(to);
  }

  function addSlide() {
    setProj((p) => {
      const slides = [...p.slides];
      slides.splice(idx + 1, 0, blankSlide(brand));
      return { ...p, slides };
    });
    setIdx((i) => i + 1);
  }

  async function doExportSingle() {
    const node = canvasRefs.current[idx];
    if (!node) return;
    setBusy(true);
    try {
      await exportSingle(node, proj.name, idx);
    } finally {
      setBusy(false);
    }
  }

  async function doExportCarousel() {
    const nodes = canvasRefs.current.filter((n): n is HTMLDivElement => !!n);
    if (!nodes.length) return;
    setBusy(true);
    try {
      await exportCarousel(nodes, proj.name, proj.caption, proj.hashtags);
    } finally {
      setBusy(false);
    }
  }

  const overflow = current.title.length > 150 || current.secondary.length > 280;

  return (
    <div className="page">
      <header className="topbar">
        <button className="btn btn--ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Projetos
        </button>
        <div className="brandmark">
          <span className="brandmark__serif">{proj.name}</span>
        </div>
        <div className="topbar__actions">
          <button className="btn btn--ghost" onClick={() => setShowPrompt(true)} title="Gerar prompt para IA">
            <Sparkles size={16} /> Prompt IA
          </button>
          <button className="btn btn--ghost" onClick={() => setShowPaste(true)} title="Colar resposta da IA">
            <ClipboardPaste size={16} /> Colar IA
          </button>
          <button className="btn btn--ghost" disabled={busy} onClick={doExportSingle}>
            <Download size={16} /> Slide
          </button>
          <button className="btn" disabled={busy} onClick={doExportCarousel}>
            <Images size={16} /> {busy ? "Exportando..." : "Exportar carrossel"}
          </button>
        </div>
      </header>

      <div className="editor">
        <SlideSidebar slides={proj.slides} currentIndex={idx} brand={brand} onSelect={setIdx} onMove={moveSlide} onAdd={addSlide} />

        <div className="stage">
          <div className="stage__frame">
            <div style={{ width: 1080 * PREVIEW_SCALE, height: 1350 * PREVIEW_SCALE, overflow: "hidden", boxShadow: "0 30px 80px -30px rgba(0,0,0,.5)", borderRadius: 10 }}>
              <div style={{ width: 1080, height: 1350, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left" }}>
                <SlideCanvas slide={current} brand={brand} />
              </div>
            </div>
          </div>
          {overflow && <div className="warn">Texto longo demais para este layout — reduza o texto ou o tamanho do título.</div>}
          <div className="stage__nav">
            <button className="iconbtn" onClick={regenText} title="Regenerar texto">
              <RefreshCw size={16} /> Texto
            </button>
            <button className="iconbtn" onClick={regenDesign} title="Regenerar design">
              <Shuffle size={16} /> Design
            </button>
            <button className="iconbtn" onClick={duplicateSlide} title="Duplicar slide">
              <Copy size={16} /> Duplicar
            </button>
            <button className="iconbtn iconbtn--danger" onClick={deleteSlide} title="Excluir slide">
              <Trash2 size={16} /> Excluir
            </button>
          </div>
        </div>

        <aside className="panel">
          <div className="panel__group">
            <h4>Conteúdo</h4>
            <label className="field field--sm">
              <span>Texto principal</span>
              <textarea rows={3} value={current.title} onChange={(e) => patchSlide({ title: e.target.value })} />
            </label>
            <label className="field field--sm">
              <span>Texto secundário</span>
              <textarea rows={2} value={current.secondary} onChange={(e) => patchSlide({ secondary: e.target.value })} placeholder="Uma frase por linha (vira lista no template de perguntas)" />
            </label>
            <label className="field field--sm">
              <span>Palavra/frase em destaque</span>
              <input value={current.highlight} onChange={(e) => patchSlide({ highlight: e.target.value })} placeholder="Trecho que aparece na cor de destaque" />
            </label>
            <p className="hint">
              Dica de formatação: <code>**negrito**</code>, <code>*itálico*</code>, <code>==destaque==</code>. No secundário, cada linha vira um item da lista.
            </p>
          </div>

          <div className="panel__group">
            <h4>Marcadores & balões</h4>
            <div className="row">
              <span className="row__label">Estilo da lista</span>
              <div className="seg">
                {listStyles.map((s) => (
                  <button key={s.v} className={current.listStyle === s.v ? "is-active" : ""} onClick={() => patchSlide({ listStyle: s.v })}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="field field--sm">
              <span>Balão manuscrito (laranja)</span>
              <input value={current.handNote} onChange={(e) => patchSlide({ handNote: e.target.value })} placeholder="Ex.: salva isto pra não esquecer" />
            </label>
            <div className="toggles">
              <button className={`toggle ${current.showHandle ? "is-on" : ""}`} onClick={() => patchSlide({ showHandle: !current.showHandle })}>
                @ no topo
              </button>
              <button className={`toggle ${current.showSignature ? "is-on" : ""}`} onClick={() => patchSlide({ showSignature: !current.showSignature })}>
                Assinatura embaixo
              </button>
            </div>
          </div>

          <div className="panel__group">
            <h4><Layout size={14} /> Layout</h4>
            <div className="layouts">
              {templates.map((t) => (
                <button key={t.id} className={`layout ${current.templateId === t.id ? "is-active" : ""}`} onClick={() => patchSlide({ templateId: t.id })} title={t.desc}>
                  {t.name}
                </button>
              ))}
            </div>
            <div className="row">
              <span className="row__label">Alinhamento</span>
              <div className="seg">
                {(["left", "center", "right"] as Align[]).map((a) => (
                  <button key={a} className={current.align === a ? "is-active" : ""} onClick={() => patchSlide({ align: a })}>
                    {a === "left" ? "Esq" : a === "center" ? "Centro" : "Dir"}
                  </button>
                ))}
              </div>
            </div>
            <label className="field field--sm">
              <span>Tamanho do título: {current.titleSize}px</span>
              <input type="range" min={48} max={140} value={current.titleSize} onChange={(e) => patchSlide({ titleSize: Number(e.target.value) })} />
            </label>
            <label className="field field--sm">
              <span>Cor de destaque</span>
              <input className="colorpick" type="color" value={current.accent} onChange={(e) => patchSlide({ accent: e.target.value })} />
            </label>
          </div>

          <div className="panel__group">
            <h4><ImageIcon size={14} /> Imagem de fundo</h4>
            <label className="filebtn">
              <input type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} />
              {current.image ? "Trocar imagem" : "Enviar imagem"}
            </label>
            {current.image && (
              <>
                <button className="iconbtn iconbtn--danger iconbtn--full" onClick={() => patchSlide({ image: null })}>
                  <X size={14} /> Remover imagem
                </button>
                <label className="field field--sm"><span>Zoom: {current.image.zoom.toFixed(2)}x</span>
                  <input type="range" min={0.5} max={2.5} step={0.05} value={current.image.zoom} onChange={(e) => patchImage({ zoom: Number(e.target.value) })} />
                </label>
                <label className="field field--sm"><span>Posição X: {current.image.posX}%</span>
                  <input type="range" min={0} max={100} value={current.image.posX} onChange={(e) => patchImage({ posX: Number(e.target.value) })} />
                </label>
                <label className="field field--sm"><span>Posição Y: {current.image.posY}%</span>
                  <input type="range" min={0} max={100} value={current.image.posY} onChange={(e) => patchImage({ posY: Number(e.target.value) })} />
                </label>
                <label className="field field--sm"><span>Saturação: {current.image.saturate}%</span>
                  <input type="range" min={0} max={200} value={current.image.saturate} onChange={(e) => patchImage({ saturate: Number(e.target.value) })} />
                </label>
                <label className="field field--sm"><span>Contraste: {current.image.contrast}%</span>
                  <input type="range" min={50} max={150} value={current.image.contrast} onChange={(e) => patchImage({ contrast: Number(e.target.value) })} />
                </label>
                <label className="field field--sm"><span>Temperatura quente: {current.image.warm}</span>
                  <input type="range" min={0} max={100} value={current.image.warm} onChange={(e) => patchImage({ warm: Number(e.target.value) })} />
                </label>
                <label className="field field--sm"><span>Desfoque: {current.image.blur}px</span>
                  <input type="range" min={0} max={12} value={current.image.blur} onChange={(e) => patchImage({ blur: Number(e.target.value) })} />
                </label>
              </>
            )}
          </div>

          <div className="panel__group">
            <h4>Atmosfera</h4>
            <label className="field field--sm"><span>Escurecimento: {current.darken}</span>
              <input type="range" min={0} max={100} value={current.darken} onChange={(e) => patchSlide({ darken: Number(e.target.value) })} />
            </label>
            <label className="field field--sm"><span>Granulado: {current.grain}</span>
              <input type="range" min={0} max={100} value={current.grain} onChange={(e) => patchSlide({ grain: Number(e.target.value) })} />
            </label>
          </div>

          <div className="panel__group">
            <h4><FileText size={14} /> Legenda</h4>
            <label className="field field--sm">
              <span>Legenda do post</span>
              <textarea rows={6} value={proj.caption} onChange={(e) => setProj((p) => ({ ...p, caption: e.target.value }))} />
            </label>
            <label className="field field--sm">
              <span>Hashtags</span>
              <textarea rows={2} value={proj.hashtags} onChange={(e) => setProj((p) => ({ ...p, hashtags: e.target.value }))} />
            </label>
            <button className="iconbtn iconbtn--full" onClick={() => downloadCaption(proj.name, proj.caption, proj.hashtags)}>
              <Download size={14} /> Baixar legenda (.txt)
            </button>
          </div>
        </aside>
      </div>

      {/* Cópias em tamanho real (1080x1350) usadas só para exportação — fora da tela. */}
      <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }} aria-hidden>
        {proj.slides.map((s, i) => (
          <div key={s.id} ref={(el) => (canvasRefs.current[i] = el)}>
            <SlideCanvas slide={s} brand={brand} />
          </div>
        ))}
      </div>

      {showPrompt && <PromptDialog prompt={buildAIPrompt(proj.meta, brand)} onClose={() => setShowPrompt(false)} />}
      {showPaste && <PasteAIDialog onApply={applyAI} onClose={() => setShowPaste(false)} />}
    </div>
  );
}
