import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { BrandKit, Slide } from "../types";
import { ScaledSlide } from "./ScaledSlide";

interface Props {
  slides: Slide[];
  currentIndex: number;
  brand: BrandKit;
  onSelect: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onAdd: () => void;
}

export function SlideSidebar({ slides, currentIndex, brand, onSelect, onMove, onAdd }: Props) {
  return (
    <aside className="thumbs">
      {slides.map((s, i) => (
        <div key={s.id} className={`thumb-wrap ${i === currentIndex ? "is-active" : ""}`}>
          <button className={`thumb ${i === currentIndex ? "is-active" : ""}`} onClick={() => onSelect(i)} title={`Slide ${i + 1}`}>
            <span className="thumb__num">{i + 1}</span>
            <ScaledSlide slide={s} brand={brand} scale={0.12} />
          </button>
          {i === currentIndex && (
            <div className="thumb__move">
              <button disabled={i === 0} onClick={() => onMove(i, i - 1)} title="Mover para cima">
                <ChevronUp size={14} />
              </button>
              <button disabled={i === slides.length - 1} onClick={() => onMove(i, i + 1)} title="Mover para baixo">
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      ))}
      <button className="thumb-add" onClick={onAdd} title="Adicionar slide">
        <Plus size={18} />
      </button>
    </aside>
  );
}
