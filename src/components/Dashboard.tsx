import { Copy, Plus, Sparkles, Trash2, PenTool } from "lucide-react";
import { BrandKit, Project } from "../types";
import { ScaledSlide } from "./ScaledSlide";

interface Props {
  projects: Project[];
  brand: BrandKit;
  onNew: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadExample: () => void;
  onOpenBrand: () => void;
}

export function Dashboard({ projects, brand, onNew, onOpen, onDuplicate, onDelete, onLoadExample, onOpenBrand }: Props) {
  return (
    <div className="page">
      <header className="topbar">
        <div className="brandmark">
          <span className="brandmark__serif">Método Autora</span>
          <span className="brandmark__tag">Instagram Studio</span>
        </div>
        <div className="topbar__actions">
          <button className="btn btn--ghost" onClick={onOpenBrand}>
            <PenTool size={16} /> Brand Kit
          </button>
          <button className="btn" onClick={onNew}>
            <Plus size={16} /> Novo carrossel
          </button>
        </div>
      </header>

      <main className="container">
        {projects.length === 0 ? (
          <div className="empty">
            <Sparkles size={40} className="empty__icon" />
            <h2>Nenhum carrossel ainda</h2>
            <p>Crie posts e carrosséis editoriais para o Instagram do Método Autora — com copy no tom da marca e exportação em 1080×1350.</p>
            <div className="empty__actions">
              <button className="btn" onClick={onNew}>
                <Plus size={16} /> Criar meu primeiro carrossel
              </button>
              <button className="btn btn--ghost" onClick={onLoadExample}>
                <Sparkles size={16} /> Carregar exemplo
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="section-head">
              <h2>Seus projetos</h2>
              <button className="btn btn--ghost btn--sm" onClick={onLoadExample}>
                <Sparkles size={15} /> Carregar exemplo
              </button>
            </div>
            <div className="grid">
              {projects.map((p) => (
                <article key={p.id} className="card">
                  <button className="card__preview" onClick={() => onOpen(p.id)} title="Abrir projeto">
                    {p.slides[0] && <ScaledSlide slide={p.slides[0]} brand={brand} scale={0.2} />}
                  </button>
                  <div className="card__body">
                    <h3 className="card__title">{p.name}</h3>
                    <p className="card__meta">{p.slides.length} slides · {new Date(p.updatedAt).toLocaleDateString("pt-BR")}</p>
                    <div className="card__actions">
                      <button className="btn btn--sm" onClick={() => onOpen(p.id)}>Abrir</button>
                      <button className="iconbtn" title="Duplicar" onClick={() => onDuplicate(p.id)}>
                        <Copy size={16} />
                      </button>
                      <button className="iconbtn iconbtn--danger" title="Excluir" onClick={() => onDelete(p.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
