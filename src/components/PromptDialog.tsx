import { useState } from "react";
import { Check, Copy, X } from "lucide-react";

interface Props {
  prompt: string;
  onClose: () => void;
}

export function PromptDialog({ prompt, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const ta = document.getElementById("prompt-text") as HTMLTextAreaElement | null;
      ta?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>Prompt para IA</h3>
          <button className="iconbtn" onClick={onClose} title="Fechar">
            <X size={16} />
          </button>
        </div>
        <p className="modal__sub">
          Copie e cole no ChatGPT, Claude ou outra IA. A <strong>estrutura</strong> (Slide 1, Título, Destaque…) é fixa para o app importar automaticamente — mas o <strong>texto dentro</strong> deve soar humano. Depois use &quot;Colar resposta da IA&quot;.
        </p>
        <textarea id="prompt-text" className="modal__text" readOnly value={prompt} />
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onClose}>
            Fechar
          </button>
          <button className="btn" onClick={copy}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copiado!" : "Copiar prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
