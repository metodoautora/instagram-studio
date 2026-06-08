import { domToPng } from "modern-screenshot";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export const EXPORT_W = 1080;
export const EXPORT_H = 1350;

/** Render interno em 2× para nitidez, depois reduz para 1080×1350. */
const CAPTURE_SCALE = 2;

async function preloadFonts(): Promise<void> {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load('700 96px "Playfair Display"'),
      document.fonts.load('400 36px "Inter"'),
      document.fonts.load('400 56px "Caveat"'),
    ]);
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}

function waitFrames(n = 3): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      i += 1;
      if (i >= n) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/** Reduz PNG 2× para tamanho final exato (1080×1350). */
async function downscale(dataUrl: string, w: number, h: number): Promise<Blob> {
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não disponível");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar PNG"))), "image/png");
  });
}

/**
 * Captura exatamente o nó visível do preview (WYSIWYG).
 * O elemento deve ser o SlideCanvas 1080×1350 que o browser já renderizou.
 */
export async function captureElement(node: HTMLElement): Promise<Blob> {
  await preloadFonts();
  await waitFrames(4);

  const bg = node.dataset.exportBg || "#120D0A";

  const dataUrl = await domToPng(node, {
    width: EXPORT_W,
    height: EXPORT_H,
    scale: CAPTURE_SCALE,
    backgroundColor: bg,
    quality: 1,
  });

  return downscale(dataUrl, EXPORT_W, EXPORT_H);
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

export async function exportSingle(node: HTMLElement, baseName: string, index: number): Promise<void> {
  const blob = await captureElement(node);
  saveAs(blob, `${safeName(baseName)}-slide-${index + 1}.png`);
}

export async function exportCarousel(
  captureFns: (() => Promise<HTMLElement>)[], 
  baseName: string,
  caption: string,
  hashtags: string
): Promise<void> {
  const zip = new JSZip();
  const base = safeName(baseName);
  for (let i = 0; i < captureFns.length; i++) {
    const node = await captureFns[i]();
    const blob = await captureElement(node);
    zip.file(`${base}-slide-${String(i + 1).padStart(2, "0")}.png`, blob);
  }
  const legenda = `${caption}\n\n${hashtags}\n`;
  zip.file(`${base}-legenda.txt`, legenda);
  const out = await zip.generateAsync({ type: "blob" });
  saveAs(out, `${base}.zip`);
}

export function downloadCaption(baseName: string, caption: string, hashtags: string): void {
  const blob = new Blob([`${caption}\n\n${hashtags}\n`], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${safeName(baseName)}-legenda.txt`);
}
