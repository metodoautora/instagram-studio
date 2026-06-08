import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const W = 1080;
const H = 1350;

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

function waitFrames(n = 2): Promise<void> {
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

/** Rasteriza um nó 1080×1350 — precisa estar montado e visível (opacity 1). */
export async function captureElement(node: HTMLElement): Promise<Blob> {
  await preloadFonts();
  await waitFrames(3);

  const bg = node.dataset.exportBg || "#120D0A";

  const dataUrl = await toPng(node, {
    width: W,
    height: H,
    pixelRatio: 1,
    backgroundColor: bg,
    cacheBust: true,
    skipFonts: false,
    includeQueryParams: true,
    style: {
      transform: "none",
      transformOrigin: "top left",
      margin: "0",
      width: `${W}px`,
      height: `${H}px`,
    },
    filter: (domNode) => {
      if (domNode instanceof HTMLElement) {
        // mix-blend-mode quebra no clone do html-to-image
        if (domNode.style.mixBlendMode && domNode.style.mixBlendMode !== "normal") {
          domNode.style.mixBlendMode = "normal";
          const op = parseFloat(domNode.style.opacity || "1");
          if (!Number.isNaN(op)) domNode.style.opacity = String(Math.min(1, op * 1.35));
        }
      }
      return true;
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

export async function exportSingle(node: HTMLElement, baseName: string, index: number): Promise<void> {
  const blob = await captureElement(node);
  saveAs(blob, `${safeName(baseName)}-slide-${index + 1}.png`);
}

export async function exportCarousel(
  nodes: HTMLElement[],
  baseName: string,
  caption: string,
  hashtags: string
): Promise<void> {
  const zip = new JSZip();
  const base = safeName(baseName);
  for (let i = 0; i < nodes.length; i++) {
    const blob = await captureElement(nodes[i]);
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
