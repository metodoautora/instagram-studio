export type Objetivo =
  | "lead_quente"
  | "educar"
  | "quebrar_objecao"
  | "identificacao"
  | "preparar_venda"
  | "candidatura";

export type Tom = "provocativo" | "didatico" | "elegante" | "direto" | "reflexivo";

export type CarrosselTipo =
  | "manifesto"
  | "diagnostico"
  | "objecao"
  | "educativo"
  | "perguntas"
  | "prevenda"
  | "lista";

export type CTA = "candidatura" | "conheca" | "salve" | "envie";

export type Align = "left" | "center" | "right";

export type LayoutId = "t1" | "t2" | "t3" | "t4" | "t5" | "t6" | "t7" | "t8" | "t9";

export type ListStyle = "none" | "brace" | "arrow" | "dash" | "number";

export interface SlideImage {
  src: string; // dataURL
  zoom: number; // 0.5 - 2.5
  posX: number; // 0 - 100
  posY: number; // 0 - 100
  saturate: number; // 0 - 200 (%)
  contrast: number; // 50 - 150 (%)
  warm: number; // 0 - 100 (intensidade do overlay quente)
  blur: number; // 0 - 12 (px)
}

export interface Slide {
  id: string;
  templateId: LayoutId;
  title: string;
  secondary: string;
  highlight: string;
  accent: string;
  align: Align;
  titleSize: number; // px (no canvas 1080)
  grain: number; // 0 - 100
  darken: number; // 0 - 100
  image: SlideImage | null;
  listStyle: ListStyle; // marcador do texto secundário quando vira lista
  handNote: string; // anotação manuscrita (laranja) opcional
  showHandle: boolean; // @ no topo
  showSignature: boolean; // etiqueta de assinatura embaixo
}

export interface ProjectMeta {
  tema: string;
  tese: string;
  publico: string;
  objetivo: Objetivo;
  tom: Tom;
  tipo: CarrosselTipo;
  slidesCount: number;
  cta: CTA;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  meta: ProjectMeta;
  slides: Slide[];
  caption: string;
  hashtags: string;
}

export interface Palette {
  cream: string;
  orange: string;
  terracotta: string;
  brown: string;
  deepGreen: string;
  blackSoft: string;
}

export interface BrandKit {
  brand: string;
  site: string;
  instagram: string;
  palette: Palette;
  fonts: {
    title: string;
    body: string;
    hand: string;
  };
  grain: number;
  darken: number;
}
