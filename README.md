# Método Autora — Instagram Studio

App web para criar carrosséis editoriais do Instagram (1080×1350) para o [Método Autora](https://www.metodoautora.com.br).

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:5173/

## O que faz

- Gera carrosséis com copy no tom da marca (gerador interno ou via IA)
- 9 templates visuais, grão, filtros, upload de fundo
- Exporta PNG (slide ou ZIP) + legenda
- Salva projetos no navegador (localStorage)
- **Prompt para IA** e **Colar resposta da IA** para importar texto do ChatGPT/Claude

## Build

```bash
npm run build
npm run preview
```

## Online (GitHub Pages)

https://metodoautora.github.io/instagram-studio/

O deploy roda automaticamente a cada push na branch `main`.

## Stack

React + Vite + TypeScript, CSS puro, html-to-image, JSZip.
