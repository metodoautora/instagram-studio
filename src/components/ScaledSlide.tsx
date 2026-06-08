import { BrandKit, Slide } from "../types";
import { CANVAS_H, CANVAS_W, SlideCanvas } from "./SlideCanvas";

interface Props {
  slide: Slide;
  brand: BrandKit;
  scale: number;
}

export function ScaledSlide({ slide, brand, scale }: Props) {
  return (
    <div
      style={{
        width: CANVAS_W * scale,
        height: CANVAS_H * scale,
        overflow: "hidden",
        borderRadius: 8,
        flex: "none",
      }}
    >
      <div style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <SlideCanvas slide={slide} brand={brand} />
      </div>
    </div>
  );
}
