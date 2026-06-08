import { BrandKit, CarrosselTipo, CTA, Objetivo, ProjectMeta, Tom } from "../types";

const objetivoLabel: Record<Objetivo, string> = {
  lead_quente: "atrair um lead quente (pessoa com dor real e intenção de resolver)",
  educar: "educar sobre o tema com elegância",
  quebrar_objecao: "quebrar uma objeção comum",
  identificacao: "gerar identificação ('isso sou eu')",
  preparar_venda: "preparar a pessoa para a venda",
  candidatura: "levar a pessoa a se candidatar pelo formulário/link da bio",
};

const tomLabel: Record<Tom, string> = {
  provocativo: "provocativo",
  didatico: "didático",
  elegante: "elegante",
  direto: "direto",
  reflexivo: "emocional e reflexivo",
};

const ctaLabel: Record<CTA, string> = {
  candidatura: "Candidate-se pelo link da bio",
  conheca: "Conheça o Método Autora",
  salve: "Salve este post para reler",
  envie: "Envie para alguém que está travada na escrita",
};

const estruturaLabel: Record<CarrosselTipo, string> = {
  manifesto:
    "Manifesto / opinião forte. Slide 1: frase de impacto. Slides do meio: quebra de crença, explicação e consequência. Último: nova perspectiva + CTA.",
  diagnostico:
    "Diagnóstico da dor. Slide 1: 'Talvez o problema não seja X'. Slides do meio: sintomas, causa real e o que muda ao entender isso. Último: CTA.",
  objecao:
    "Quebra de objeção. Slide 1: a objeção comum (entre aspas). Slides do meio: por que ela parece fazer sentido, onde ela falha e um novo enquadramento. Último: convite/CTA.",
  educativo:
    "Conteúdo educativo elegante. Slide 1: a tese. Slides do meio: conceito, exemplo e aplicação prática. Último: resumo + CTA.",
  perguntas:
    "Carrossel de perguntas. Slide 1: chamada forte. Slides do meio: uma pergunta profunda por slide. Último: 'Se essas perguntas te incomodaram, talvez seja hora de levar sua escrita a sério.' + CTA.",
  prevenda:
    "Pré-venda / qualificação. Slide 1: 'Nem toda pessoa precisa disso agora.' Slides do meio: 'mas algumas precisam com urgência', sinais de prontidão e sinais de que ainda não é o momento. Último: CTA para candidatura.",
  lista:
    "Lista / itens. Slide 1: chamada que apresenta a lista. Slides do meio: um item ou ponto por slide, em formato de tópicos curtos. Último: fechamento + CTA.",
};

export function buildAIPrompt(meta: ProjectMeta, brand: BrandKit): string {
  const tema = meta.tema.trim() || "(defina o tema)";
  const tese = meta.tese.trim() || "(sem tese definida — proponha uma forte)";
  const publico = meta.publico.trim() || "mulheres acadêmicas, pesquisadoras, mestrandas e doutorandas";

  return `Você é uma copywriter editorial escrevendo para "${brand.brand}" (${brand.site}).

O QUE IMPORTA MAIS
Escreva como uma autora inteligente pensando em voz alta — firme, elegante, provocativa, nunca com cara de robô ou de coach genérico. O texto precisa soar humano e autoral.

Só a ESTRUTURA da resposta é fixa (os rótulos abaixo). O conteúdo dentro de cada campo deve ser criativo, variado e natural.

CONTEXTO
${brand.brand} é para ${publico} que precisam destravar escrita acadêmica: referencial teórico, autoria, discussão de dados e rotina de escrita. Queremos atrair quem tem dor real e intenção de resolver — não só curiosas.

VOZ (siga com rigor no conteúdo, não no formato)
- Sofisticada, autoral, provocativa, inteligente.
- Autoridade acadêmica + clareza comercial.
- Frases curtas e fortes; ritmo variado.
- Prefira: "talvez", "quando", "não é sobre", "o problema não é...".
- Evite clichês, emojis e venda agressiva.
- Exemplos de tom:
  • "Não, escrever mais não resolve quando você ainda não sabe o que está tentando sustentar."
  • "Se seu referencial parece uma colcha de retalhos, talvez o problema não seja leitura. É articulação."

BRIEFING
- Tema: ${tema}
- Tese: ${tese}
- Público: ${publico}
- Objetivo: ${objetivoLabel[meta.objetivo]}
- Tom: ${tomLabel[meta.tom]}
- Slides: exatamente ${meta.slidesCount}
- CTA final: "${ctaLabel[meta.cta]}"
- Arco narrativo: ${estruturaLabel[meta.tipo]}

COMO PREENCHER CADA CAMPO (conteúdo criativo — varie de slide para slide)

Título: a frase principal do slide. Curta, forte, editorial. Pode ser uma pergunta, uma afirmação ou uma quebra de crença.

Destaque: a segunda linha do headline — uma continuação que vira destaque visual (cor laranja). Não repita o título; complete ou contraste. Ex.: Título "Talvez não falte leitura." / Destaque "Falte articulação." Se não fizer sentido num slide, deixe vazio.

Secundário: só quando precisar de apoio. Frases curtas, uma ideia por linha (sem marcadores - ou •). Pode ter 0 a 4 linhas. No último slide, pode incluir o CTA aqui.

Balão: anotação manuscrita opcional, bem curta e informal (máx. 1–2 slides do carrossel). Se não tiver, deixe "Balão:" vazio.

FORMATO TÉCNICO (obrigatório — não mude os rótulos, para importação automática)
Responda só com o carrossel, sem introdução nem explicações. Use exatamente estes rótulos:

Slide 1
Título: ...
Destaque: ...
Secundário: ...
Balão: ...

Slide 2
Título: ...
Destaque: ...
Secundário: ...
Balão: ...

(continue até Slide ${meta.slidesCount})

Legenda: ...
Hashtags: ...

Regras do formato:
- Mantenha "Slide N", "Título:", "Destaque:", "Secundário:", "Balão:", "Legenda:", "Hashtags:" exatamente assim.
- Não use markdown (sem **, sem #, sem listas numeradas no rótulo).
- Campos vazios são ok (ex.: Balão: ).
- Legenda: gancho forte na 1ª linha, 1–2 parágrafos curtos, fechamento com pergunta ou CTA.
- Hashtags: 5 a 7, discretas.

Agora escreva o carrossel completo.`;
}
