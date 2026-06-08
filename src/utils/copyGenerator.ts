import {
  BrandKit,
  CarrosselTipo,
  CTA,
  LayoutId,
  ListStyle,
  Project,
  ProjectMeta,
  Slide,
} from "../types";
import { uid } from "./storage";

interface Spec {
  title: string;
  secondary?: string;
  highlight?: string;
  templateId: LayoutId;
  listStyle?: ListStyle;
  handNote?: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Frases-âncora no tom da marca, usadas como reforço/preenchimento. */
const sharpLines = [
  "Não, ler mais artigos não vai resolver tudo.",
  "Às vezes a escrita trava porque a ideia ainda não tem coluna vertebral.",
  "Você não precisa de mais uma aba aberta. Precisa de direção.",
  "Referencial teórico não é coleção de autores.",
  "Escrever com autoria não é escrever bonito. É sustentar uma posição.",
  "Se tudo parece importante, talvez você ainda não tenha escolhido o argumento.",
  "O texto não melhora quando você empilha referências. Melhora quando organiza pensamento.",
  "Nem toda trava é falta de disciplina. Algumas são falta de método.",
  "Toda escrita travada está tentando dizer alguma coisa.",
  "O problema não é falta de leitura. É falta de articulação.",
];

const ctaText: Record<CTA, string> = {
  candidatura: "Candidate-se pelo link da bio",
  conheca: "Conheça o Método Autora",
  salve: "Salve este post para reler",
  envie: "Envie para alguém que está travada na escrita",
};

const ctaTitle: Record<CTA, string> = {
  candidatura: "Se você se reconheceu, talvez seja hora de levar sua escrita a sério.",
  conheca: "Existe um caminho para escrever com método — e com autoria.",
  salve: "Releia isto na próxima vez que a escrita travar.",
  envie: "Você conhece alguém que precisa ler isto hoje?",
};

function clampLine(s: string): string {
  return s.trim();
}

/** Estruturas por tipo de carrossel. Retorna intro, corpo (vários) e o slide de CTA. */
function blueprint(tipo: CarrosselTipo, meta: ProjectMeta) {
  const tema = clampLine(meta.tema) || "a escrita acadêmica";
  const tese = clampLine(meta.tese);
  const temaLow = tema.toLowerCase();

  let intro: Spec;
  let body: Spec[];

  switch (tipo) {
    case "manifesto":
      intro = { title: tese || `Sobre ${temaLow}, ninguém te conta isto:`, highlight: "", templateId: "t5" };
      body = [
        { title: "Você acredita que precisa de mais conteúdo.", secondary: "Mais um curso. Mais um livro. Mais uma aba aberta.", templateId: "t6" },
        { title: "Mas o acúmulo não é o caminho.", highlight: "acúmulo", templateId: "t2" },
        { title: `O que falta em ${temaLow} raramente é informação.`, secondary: "É direção. É articulação. É método.", highlight: "método", templateId: "t6" },
        { title: "Sem isso, cada texto vira um recomeço cansado.", templateId: "t3" },
        { title: "Com isso, a escrita deixa de ser sofrimento e vira processo.", highlight: "processo", templateId: "t1" },
      ];
      break;

    case "diagnostico":
      intro = { title: `Talvez o problema não seja ${temaLow}.`, highlight: temaLow, templateId: "t1" };
      body = [
        {
          title: "Os sintomas você conhece bem:",
          secondary: "Texto confuso, sem fio condutor\nReferencial que não conversa\nA discussão que ==não sai==",
          templateId: "t9",
          listStyle: "brace",
        },
        { title: "Mas sintoma não é causa.", highlight: "causa", templateId: "t2" },
        { title: tese || "A causa real costuma ser a passagem entre ler e escrever.", highlight: "passagem", templateId: "t6" },
        { title: "Quando você entende isso, a escrita muda de lugar.", templateId: "t3" },
        { title: "Deixa de ser talento e vira algo que se aprende.", highlight: "se aprende", templateId: "t6" },
      ];
      break;

    case "objecao":
      intro = { title: `"Eu só preciso ler mais sobre ${temaLow}."`, templateId: "t7" };
      body = [
        { title: "Faz sentido — leitura parece sempre o próximo passo.", templateId: "t6" },
        { title: "Mas é aí que mora a armadilha.", highlight: "armadilha", templateId: "t2" },
        { title: "Ler mais sem método só aumenta a pilha, não o texto.", highlight: "método", templateId: "t3" },
        { title: tese || "O ponto não é quanto você lê. É como você articula.", highlight: "articula", templateId: "t6" },
        { title: "Talvez não falte leitura. Falte um sistema.", highlight: "sistema", templateId: "t1" },
      ];
      break;

    case "educativo":
      intro = { title: tese || `Como destravar ${temaLow}, na prática.`, highlight: temaLow, templateId: "t6" };
      body = [
        { title: "Primeiro, um conceito simples:", secondary: "Escrever é organizar pensamento — não decorar autores.", templateId: "t6" },
        { title: "Um exemplo:", secondary: "Três citações soltas não fazem um argumento. Uma pergunta bem feita, sim.", templateId: "t3" },
        {
          title: "Na prática:",
          secondary: "Defina a ==posição== que vai sustentar\nEscolha quem te ajuda a sustentá-la\nEscreva a serviço da tese",
          templateId: "t9",
          listStyle: "brace",
        },
        { title: "É isso que muda o jogo.", highlight: "muda o jogo", templateId: "t2" },
        { title: "Menos acúmulo. Mais autoria.", highlight: "autoria", templateId: "t1" },
      ];
      break;

    case "perguntas":
      intro = { title: `Algumas perguntas sobre ${temaLow} que talvez você evite:`, templateId: "t5", handNote: "respira e responde" };
      body = [
        { title: "Você escreve a partir de uma pergunta — ou só reúne o que leu?", templateId: "t1" },
        { title: "Seu referencial sustenta um argumento — ou enfileira autores?", templateId: "t1" },
        { title: "Quando trava, você revisa o texto — ou o pensamento?", templateId: "t1" },
        { title: "Você está sem tempo — ou sem ==método==?", templateId: "t1" },
        { title: tese || "O que muda se você tratar a escrita como processo, não talento?", templateId: "t6" },
      ];
      break;

    case "lista":
      intro = {
        title: `O que sustenta ${temaLow}, em ==poucos pontos==:`,
        templateId: "t9",
        handNote: "salva isto pra não esquecer",
      };
      body = [
        {
          title: "Comece pela base:",
          secondary:
            "**Posição:** o que você quer sustentar\nLeitura: só depois de saber o argumento\nEstrutura: o texto serve à tese, não o contrário",
          templateId: "t9",
          listStyle: "brace",
        },
        {
          title: "Onde a maioria erra:",
          secondary:
            "Empilha autores → ==não vira argumento==\nRevisa o texto → quando o problema é o pensamento\nEscreve mais → sem direção",
          templateId: "t9",
          listStyle: "arrow",
        },
        {
          title: "O que muda com método:",
          secondary:
            "Menos *retrabalho*\nMais ==autoria==\nUma rotina de escrita que se sustenta",
          templateId: "t9",
          listStyle: "brace",
        },
        { title: tese || "No fim, não é sobre ler mais. É sobre articular melhor.", highlight: "articular", templateId: "t1" },
      ];
      break;

    case "prevenda":
    default:
      intro = { title: "Nem toda pessoa precisa do Método Autora agora.", highlight: "agora", templateId: "t2" };
      body = [
        { title: "Mas algumas precisam — com ==urgência==.", highlight: "", templateId: "t1" },
        {
          title: "Sinais de que é o seu momento:",
          secondary: "Você tem **prazo chegando**\nA escrita trava com frequência\nResolver isso virou ==prioridade==",
          templateId: "t9",
          listStyle: "brace",
        },
        {
          title: "Sinais de que ainda não é:",
          secondary: "Você só está curiosa\nSem pressa real\nSem disposição para mudar a rotina",
          templateId: "t9",
          listStyle: "dash",
        },
        { title: tese || "O método não é para todo mundo. É para quem decidiu destravar.", highlight: "decidiu", templateId: "t3" },
        { title: "Se esse é o seu momento, dá o próximo passo.", templateId: "t6", handNote: "é com você" },
      ];
      break;
  }

  const cta: Spec = {
    title: ctaTitle[meta.cta],
    secondary: ctaText[meta.cta],
    templateId: "t8",
  };

  return { intro, body, cta };
}

function specToSlide(spec: Spec, brand: BrandKit, fallbackSize: number): Slide {
  return {
    id: uid(),
    templateId: spec.templateId,
    title: spec.title,
    secondary: spec.secondary ?? "",
    highlight: spec.highlight ?? "",
    accent: brand.palette.orange,
    align: spec.templateId === "t8" || spec.templateId === "t7" ? "center" : "left",
    titleSize: fallbackSize,
    grain: brand.grain,
    darken: brand.darken,
    image: null,
    listStyle: spec.listStyle ?? "none",
    handNote: spec.handNote ?? "",
    showHandle: false,
    showSignature: false,
  };
}

function sizeFor(templateId: LayoutId): number {
  switch (templateId) {
    case "t1":
    case "t5":
      return 96;
    case "t2":
      return 104;
    case "t7":
      return 84;
    case "t8":
      return 80;
    case "t9":
      return 100;
    case "t4":
      return 72;
    default:
      return 78;
  }
}

export function generateSlides(meta: ProjectMeta, brand: BrandKit): Slide[] {
  const { intro, body, cta } = blueprint(meta.tipo, meta);
  const middleNeeded = Math.max(1, meta.slidesCount - 2);

  const middle: Spec[] = [];
  for (let i = 0; i < middleNeeded; i++) {
    if (i < body.length) {
      middle.push(body[i]);
    } else {
      middle.push({ title: pick(sharpLines), templateId: "t6" });
    }
  }

  const specs = [intro, ...middle, cta];
  const slides = specs.map((s) => specToSlide(s, brand, sizeFor(s.templateId)));
  if (slides.length) {
    slides[0].showHandle = true;
    slides[slides.length - 1].showSignature = true;
  }
  return slides;
}

export function generateCaption(meta: ProjectMeta): { caption: string; hashtags: string } {
  const tema = clampLine(meta.tema) || "a escrita acadêmica";
  const gancho = clampLine(meta.tese) || pick(sharpLines);
  const fecho: Record<CTA, string> = {
    candidatura: "Se isso fala com você, candidate-se pelo link da bio.",
    conheca: "Conheça o Método Autora no link da bio.",
    salve: "Salve este post para reler quando a escrita travar.",
    envie: "Marque ou envie para alguém que precisa ler isto.",
  };

  const caption = [
    gancho,
    "",
    `A maioria das pesquisadoras trava em ${tema.toLowerCase()} achando que falta leitura.`,
    "Quase nunca é isso. Falta método para transformar leitura em texto autoral.",
    "",
    "E se o problema não fosse esforço — mas direção?",
    "",
    fecho[meta.cta],
  ].join("\n");

  const hashtags =
    "#escritaacademica #pesquisaacademica #mestrado #doutorado #vidaacademica #referencialteorico #metodoautora";

  return { caption, hashtags };
}

const nomesTipo: Record<CarrosselTipo, string> = {
  manifesto: "Manifesto",
  diagnostico: "Diagnóstico da dor",
  objecao: "Quebra de objeção",
  educativo: "Educativo",
  perguntas: "Perguntas",
  prevenda: "Pré-venda",
  lista: "Lista / itens",
};

export function createProject(meta: ProjectMeta, brand: BrandKit): Project {
  const slides = generateSlides(meta, brand);
  const { caption, hashtags } = generateCaption(meta);
  const tema = clampLine(meta.tema) || "Novo carrossel";
  const now = Date.now();
  return {
    id: uid(),
    name: `${nomesTipo[meta.tipo]} · ${tema}`,
    createdAt: now,
    updatedAt: now,
    meta,
    slides,
    caption,
    hashtags,
  };
}

/** Regera o texto de um slide específico (mantendo posição/papel). */
export function regenerateSlideText(meta: ProjectMeta, brand: BrandKit, index: number): Partial<Slide> {
  const fresh = generateSlides(meta, brand);
  const ref = fresh[Math.min(index, fresh.length - 1)];
  return { title: ref.title, secondary: ref.secondary, highlight: ref.highlight, listStyle: ref.listStyle, handNote: ref.handNote };
}

export const exampleMeta: ProjectMeta = {
  tema: "Referencial teórico",
  tese: "Se seu referencial parece uma colcha de retalhos, o problema não é leitura — é articulação.",
  publico: "Mestrandas e doutorandas",
  objetivo: "lead_quente",
  tom: "provocativo",
  tipo: "diagnostico",
  slidesCount: 5,
  cta: "candidatura",
};
