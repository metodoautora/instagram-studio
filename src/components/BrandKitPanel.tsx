import { ArrowLeft, RotateCcw } from "lucide-react";
import { BrandKit, Palette } from "../types";
import { defaultBrandKit } from "../data/brandKit";

interface Props {
  brand: BrandKit;
  onChange: (brand: BrandKit) => void;
  onBack: () => void;
}

const paletteLabels: { key: keyof Palette; label: string }[] = [
  { key: "cream", label: "Creme" },
  { key: "orange", label: "Laranja queimado" },
  { key: "terracotta", label: "Terracota" },
  { key: "brown", label: "Marrom escuro" },
  { key: "deepGreen", label: "Verde profundo" },
  { key: "blackSoft", label: "Preto suave" },
];

export function BrandKitPanel({ brand, onChange, onBack }: Props) {
  function setPalette(key: keyof Palette, value: string) {
    onChange({ ...brand, palette: { ...brand.palette, [key]: value } });
  }

  return (
    <div className="page">
      <header className="topbar">
        <button className="btn btn--ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="brandmark">
          <span className="brandmark__serif">Brand Kit</span>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => onChange(defaultBrandKit)}>
          <RotateCcw size={15} /> Restaurar padrão
        </button>
      </header>

      <main className="container container--narrow">
        <div className="form">
          <label className="field">
            <span>Nome da marca</span>
            <input value={brand.brand} onChange={(e) => onChange({ ...brand, brand: e.target.value })} />
          </label>
          <label className="field">
            <span>Site</span>
            <input value={brand.site} onChange={(e) => onChange({ ...brand, site: e.target.value })} />
          </label>
          <label className="field">
            <span>Instagram</span>
            <input value={brand.instagram} onChange={(e) => onChange({ ...brand, instagram: e.target.value })} />
          </label>

          <div className="field">
            <span>Paleta</span>
            <div className="palette">
              {paletteLabels.map(({ key, label }) => (
                <label key={key} className="swatch">
                  <input type="color" value={brand.palette[key]} onChange={(e) => setPalette(key, e.target.value)} />
                  <span>{label}</span>
                  <code>{brand.palette[key]}</code>
                </label>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Granulado padrão: {brand.grain}</span>
            <input type="range" min={0} max={100} value={brand.grain} onChange={(e) => onChange({ ...brand, grain: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Escurecimento padrão: {brand.darken}</span>
            <input type="range" min={0} max={100} value={brand.darken} onChange={(e) => onChange({ ...brand, darken: Number(e.target.value) })} />
          </label>
        </div>
      </main>
    </div>
  );
}
