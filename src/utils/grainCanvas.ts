/** Textura de grão em raster — compatível com screenshot (sem filtros SVG). */
export function paintGrain(canvas: HTMLCanvasElement, width: number, height: number, tile = 200): void {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const tileCanvas = document.createElement("canvas");
  tileCanvas.width = tile;
  tileCanvas.height = tile;
  const tctx = tileCanvas.getContext("2d");
  if (!tctx) return;

  const img = tctx.createImageData(tile, tile);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);

  const pattern = ctx.createPattern(tileCanvas, "repeat");
  if (!pattern) return;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
}
