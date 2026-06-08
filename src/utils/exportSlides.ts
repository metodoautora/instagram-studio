import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { CANVAS_H, CANVAS_W } from "../components/SlideCanvas";
import type { BrandKit } from "../types";

/** Carrega tamanhos reais usados nos slides (crítico no site, onde Google Fonts demora). */
async function preloadFonts(brand: BrandKit): Promise<void> {
  if (!document.fonts?.load) return;
  const titleFamily = brand.fonts.title.match(/'([^']+)'/)?.[1] ?? "Playfair Display";
  const bodyFamily = brand.fonts.body.match(/'([^']+)'/)?.[1] ?? "Inter";
  const handFamily = brand.fonts.hand.match(/'([^']+)'/)?.[1] ?? "Caveat";
  const loads = [
    document.fonts.load(`700 140px "${titleFamily}"`),
    document.fonts.load(`400 36px "${bodyFamily}"`),
    document.fonts.load(`400 56px "${handFamily}"`),
    document.fonts.load(`700 36px "${bodyFamily}"`),
  ];
  await Promise.all(loads.map((p) => p.catch(() => undefined)));
}

/** Aguarda fontes + layout estável antes de rasterizar. */
export async function waitForRender(brand?: BrandKit): Promise<void> {
  if (brand) await preloadFonts(brand);
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  // Rede mais lenta no GitHub Pages — espera extra para o layout flex estabilizar.
  await new Promise((r) => setTimeout(r, 200));
}

async function nodeToBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, {
    width: CANVAS_W,
    height: CANVAS_H,
    pixelRatio: 1,
    cacheBust: true,
    skipAutoScale: true,
    skipFonts: false,
    includeQueryParams: true,
    style: {
      transform: "none",
      transformOrigin: "top left",
      margin: "0",
      padding: "0",
    },
  });

  const res = await fetch(dataUrl);
  return await res.blob();
}

function safeName(s: string): string {
  return (s || "metodo-autora")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);
}

export function saveSlideBlob(blob: Blob, baseName: string, index: number): void {
  saveAs(blob, `${safeName(baseName)}-slide-${index + 1}.png`);
}

export async function captureSlideBlob(node: HTMLElement, brand: BrandKit): Promise<Blob> {
  await waitForRender(brand);
  return nodeToBlob(node);
}

export async function exportCarousel(
  captureSlide: (index: number) => Promise<Blob>,
  slideCount: number,
  baseName: string,
  caption: string,
  hashtags: string
): Promise<void> {
  const zip = new JSZip();
  const base = safeName(baseName);
  for (let i = 0; i < slideCount; i++) {
    const blob = await captureSlide(i);
    zip.file(`${base}-slide-${String(i + 1).padStart(2, "0")}.png`, blob);
  }
  zip.file(`${base}-legenda.txt`, `${caption}\n\n${hashtags}\n`);
  saveAs(await zip.generateAsync({ type: "blob" }), `${base}.zip`);
}

export function downloadCaption(baseName: string, caption: string, hashtags: string): void {
  saveAs(new Blob([`${caption}\n\n${hashtags}\n`], { type: "text/plain;charset=utf-8" }), `${safeName(baseName)}-legenda.txt`);
}

export { CANVAS_W, CANVAS_H };
