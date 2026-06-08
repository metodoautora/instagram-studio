import { LayoutId } from "../types";

export type TemplateKind = "photo" | "solid" | "cream";

export interface TemplateDef {
  id: LayoutId;
  name: string;
  desc: string;
  kind: TemplateKind;
}

export const templates: TemplateDef[] = [
  { id: "t1", name: "Foto + título central", desc: "Imagem escurecida, título serifado creme", kind: "photo" },
  { id: "t2", name: "Terracota editorial", desc: "Fundo sólido, título grande e cards", kind: "solid" },
  { id: "t3", name: "Foto + caixa laranja", desc: "Texto creme e caixa de destaque", kind: "photo" },
  { id: "t4", name: "Perguntas", desc: "Lista de perguntas + título forte", kind: "photo" },
  { id: "t5", name: "Manifesto", desc: "Frase no canto + nota manual", kind: "photo" },
  { id: "t6", name: "Creme minimalista", desc: "Fundo claro, texto marrom, educativo", kind: "cream" },
  { id: "t7", name: "Citação editorial", desc: "Aspas grandes e assinatura", kind: "photo" },
  { id: "t8", name: "CTA final", desc: "Chamada + botão + rodapé do site", kind: "solid" },
  { id: "t9", name: "Lista editorial", desc: "Título grande + lista com chaves laranja", kind: "photo" },
];

export function templateKind(id: LayoutId): TemplateKind {
  return templates.find((t) => t.id === id)?.kind ?? "photo";
}
