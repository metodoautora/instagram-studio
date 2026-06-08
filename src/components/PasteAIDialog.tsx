import { useMemo, useState } from "react";
import { ClipboardPaste, X } from "lucide-react";
import { parseAIResponse, ParsedAI } from "../utils/aiParser";

interface Props {
  onApply: (parsed: ParsedAI) => void;
  onClose: () => void;
}

export function PasteAIDialog({ onApply, onClose }: Props) {
  const [text, setText] = useState("");
  const parsed = useMemo(() => parseAIResponse(text), [text]);
  const count = parsed.slides.length;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>Colar resposta da IA</h3>
          <button className="iconbtn" onClick={onClose} title="Fechar">
            <X size={16} />
          </button>
        </div>
        <p className="modal__sub">
          Cole a resposta da IA. O <strong>conteúdo</strong> pode ser natural e variado — o app só precisa dos <strong>rótulos</strong> (<code>Slide 1</code>, <code>Título:</code>, <code>Destaque:</code>, etc.) para importar sem erro.
        </p>
        <textarea
          className="modal__text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Slide 1\nTítulo: ...\nDestaque: ...\nSecundário: ...\nBalão: ...\n\nSlide 2\n..."}
          autoFocus
        />
        <div className="modal__foot">
          <span className={`detect ${count ? "detect--ok" : text.trim() ? "detect--warn" : ""}`}>
            {count
              ? `${count} slide${count > 1 ? "s" : ""} detectado${count > 1 ? "s" : ""}${parsed.caption ? " · legenda ✓" : ""}`
              : text.trim()
              ? "Formato não reconhecido — confira se tem Slide 1, Título:, Destaque:, etc."
              : "Nenhum slide detectado ainda"}
          </span>
          <div className="modal__actions">
            <button className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn" disabled={!count} onClick={() => onApply(parsed)}>
              <ClipboardPaste size={16} /> Preencher carrossel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
