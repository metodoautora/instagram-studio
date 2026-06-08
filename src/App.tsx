import { useEffect, useState } from "react";
import { BrandKit, Project, ProjectMeta } from "./types";
import { defaultBrandKit } from "./data/brandKit";
import { loadBrandKit, loadProjects, saveBrandKit, saveProjects, uid } from "./utils/storage";
import { createProject, exampleMeta } from "./utils/copyGenerator";
import { applyAIResponse, ParsedAI } from "./utils/aiParser";
import { Dashboard } from "./components/Dashboard";
import { CreatorForm } from "./components/CreatorForm";
import { Editor } from "./components/Editor";
import { BrandKitPanel } from "./components/BrandKitPanel";

type View = "dashboard" | "creator" | "editor" | "brand";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [brand, setBrand] = useState<BrandKit>(() => loadBrandKit() ?? defaultBrandKit);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => saveProjects(projects), [projects]);
  useEffect(() => saveBrandKit(brand), [brand]);

  const current = projects.find((p) => p.id === currentId) ?? null;

  function upsert(p: Project) {
    setProjects((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i < 0) return [p, ...prev];
      const copy = [...prev];
      copy[i] = p;
      return copy;
    });
  }

  function handleGenerate(meta: ProjectMeta) {
    const p = createProject(meta, brand);
    upsert(p);
    setCurrentId(p.id);
    setView("editor");
  }

  function handleGenerateFromAI(meta: ProjectMeta, parsed: ParsedAI) {
    const base = createProject(meta, brand);
    const p = applyAIResponse(base, parsed);
    upsert(p);
    setCurrentId(p.id);
    setView("editor");
  }

  function handleOpen(id: string) {
    setCurrentId(id);
    setView("editor");
  }

  function handleDuplicate(id: string) {
    const src = projects.find((p) => p.id === id);
    if (!src) return;
    const copy: Project = {
      ...src,
      id: uid(),
      name: `${src.name} (cópia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: src.slides.map((s) => ({ ...s, id: uid() })),
    };
    upsert(copy);
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir este projeto? Esta ação não pode ser desfeita.")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function handleLoadExample() {
    const p = createProject(exampleMeta, brand);
    p.name = `${p.name} (exemplo)`;
    upsert(p);
    setCurrentId(p.id);
    setView("editor");
  }

  if (view === "creator") {
    return (
      <CreatorForm
        brand={brand}
        onGenerate={handleGenerate}
        onGenerateFromAI={handleGenerateFromAI}
        onBack={() => setView("dashboard")}
      />
    );
  }

  if (view === "brand") {
    return <BrandKitPanel brand={brand} onChange={setBrand} onBack={() => setView("dashboard")} />;
  }

  if (view === "editor" && current) {
    return <Editor project={current} brand={brand} onUpdate={upsert} onBack={() => setView("dashboard")} />;
  }

  return (
    <Dashboard
      projects={projects}
      brand={brand}
      onNew={() => setView("creator")}
      onOpen={handleOpen}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onLoadExample={handleLoadExample}
      onOpenBrand={() => setView("brand")}
    />
  );
}
