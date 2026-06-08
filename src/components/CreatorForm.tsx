import { useState } from "react";
import { ArrowLeft, ClipboardPaste, Sparkles, Wand2 } from "lucide-react";
import { BrandKit, CarrosselTipo, CTA, Objetivo, ProjectMeta, Tom } from "../types";
import { exampleMeta } from "../utils/copyGenerator";
import { buildAIPrompt } from "../utils/aiPrompt";
import { PromptDialog } from "./PromptDialog";
import { ParsedAI } from "../utils/aiParser";
import { PasteAIDialog } from "./PasteAIDialog";

interface Props {
  brand: BrandKit;
  onGenerate: (meta: ProjectMeta) => void;
  onGenerateFromAI: (meta: ProjectMeta, parsed: ParsedAI) => void;
  onBack: () => void;
}

const objetivos: { v: Objetivo; label: string }[] = [
  { v: "lead_quente", label: "Atrair lead quente" },
  { v: "educar", label: "Educar" },
  { v: "quebrar_objecao", label: "Quebrar objeção" },
  { v: "identificacao", label: "Gerar identificação" },
  { v: "preparar_venda", label: "Preparar para venda" },
  { v: "candidatura", label: "Chamar para candidatura" },
];

const tons: { v: Tom; label: string }[] = [
  { v: "provocativo", label: "Provocativo" },
  { v: "didatico", label: "Didático" },
  { v: "elegante", label: "Elegante" },
  { v: "direto", label: "Direto" },
  { v: "reflexivo", label: "Emocional/reflexivo" },
];

const tipos: { v: CarrosselTipo; label: string }[] = [
  { v: "manifesto", label: "Manifesto / opinião forte" },
  { v: "diagnostico", label: "Diagnóstico da dor" },
  { v: "objecao", label: "Quebra de objeção" },
  { v: "educativo", label: "Educativo elegante" },
  { v: "perguntas", label: "Carrossel de perguntas" },
  { v: "prevenda", label: "Pré-venda / qualificação" },
  { v: "lista", label: "Lista / itens (com chaves)" },
];

const ctas: { v: CTA; label: string }[] = [
  { v: "candidatura", label: "Candidate-se pelo link da bio" },
  { v: "conheca", label: "Conheça o Método Autora" },
  { v: "salve", label: "Salve para reler" },
  { v: "envie", label: "Envie para alguém que está travada" },
];

export function CreatorForm({ brand, onGenerate, onGenerateFromAI, onBack }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [meta, setMeta] = useState<ProjectMeta>({
    tema: "",
    tese: "",
    publico: "Mestrandas e doutorandas",
    objetivo: "lead_quente",
    tom: "provocativo",
    tipo: "diagnostico",
    slidesCount: 5,
    cta: "candidatura",
  });

  function set<K extends keyof ProjectMeta>(key: K, value: ProjectMeta[K]) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  return (
    <div className="page">
      <header className="topbar">
        <button className="btn btn--ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="brandmark">
          <span className="brandmark__serif">Novo carrossel</span>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => setMeta(exampleMeta)}>
          Preencher com exemplo
        </button>
      </header>

      <main className="container container--narrow">
        <div className="form">
          <label className="field">
            <span>Tema do post</span>
            <input value={meta.tema} onChange={(e) => set("tema", e.target.value)} placeholder="Ex.: Referencial teórico" />
          </label>

          <label className="field">
            <span>Ideia central / tese</span>
            <textarea
              rows={3}
              value={meta.tese}
              onChange={(e) => set("tese", e.target.value)}
              placeholder="A frase que sustenta o post. Ex.: Se seu referencial parece colcha de retalhos, o problema não é leitura — é articulação."
            />
          </label>

          <label className="field">
            <span>Público-alvo</span>
            <input value={meta.publico} onChange={(e) => set("publico", e.target.value)} placeholder="Ex.: Doutorandas em fase de qualificação" />
          </label>

          <div className="field">
            <span>Objetivo do post</span>
            <div className="chips">
              {objetivos.map((o) => (
                <button key={o.v} className={`chip ${meta.objetivo === o.v ? "is-active" : ""}`} onClick={() => set("objetivo", o.v)} type="button">
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Formato do carrossel</span>
            <div className="chips">
              {tipos.map((o) => (
                <button key={o.v} className={`chip ${meta.tipo === o.v ? "is-active" : ""}`} onClick={() => set("tipo", o.v)} type="button">
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Tom</span>
            <div className="chips">
              {tons.map((o) => (
                <button key={o.v} className={`chip ${meta.tom === o.v ? "is-active" : ""}`} onClick={() => set("tom", o.v)} type="button">
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Número de slides</span>
            <div className="chips">
              {[3, 5, 7, 9].map((n) => (
                <button key={n} className={`chip ${meta.slidesCount === n ? "is-active" : ""}`} onClick={() => set("slidesCount", n)} type="button">
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>CTA final</span>
            <div className="chips">
              {ctas.map((o) => (
                <button key={o.v} className={`chip ${meta.cta === o.v ? "is-active" : ""}`} onClick={() => set("cta", o.v)} type="button">
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="creator__cta">
            <button className="btn btn--lg" onClick={() => onGenerate(meta)}>
              <Wand2 size={18} /> Gerar carrossel
            </button>
            <button className="btn btn--ghost btn--lg" onClick={() => setShowPrompt(true)} type="button">
              <Sparkles size={18} /> Gerar prompt para IA
            </button>
            <button className="btn btn--ghost btn--lg" onClick={() => setShowPaste(true)} type="button">
              <ClipboardPaste size={18} /> Colar resposta da IA
            </button>
          </div>
          <p className="hint hint--center">
            O prompt pede formato fixo só para importar sem erro — a copy em si deve sair natural da IA. Fluxo: prompt → IA → colar resposta.
          </p>
        </div>
      </main>

      {showPrompt && <PromptDialog prompt={buildAIPrompt(meta, brand)} onClose={() => setShowPrompt(false)} />}
      {showPaste && (
        <PasteAIDialog
          onApply={(parsed) => {
            setShowPaste(false);
            onGenerateFromAI(meta, parsed);
          }}
          onClose={() => setShowPaste(false)}
        />
      )}
    </div>
  );
}
