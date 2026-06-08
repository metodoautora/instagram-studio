import { BrandKit, Project } from "../types";

const PROJECTS_KEY = "mais_projects_v1";
const BRAND_KEY = "mais_brandkit_v1";

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const projects = JSON.parse(raw) as Project[];
    // Migração: garante campos novos (v2) em projetos antigos.
    return projects.map((p) => ({
      ...p,
      slides: p.slides.map((s) => ({
        ...s,
        listStyle: s.listStyle ?? "none",
        handNote: s.handNote ?? "",
        showHandle: s.showHandle ?? false,
        showSignature: s.showSignature ?? false,
      })),
    }));
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    /* storage cheio ou indisponível */
  }
}

export function loadBrandKit(): BrandKit | null {
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    return raw ? (JSON.parse(raw) as BrandKit) : null;
  } catch {
    return null;
  }
}

export function saveBrandKit(brand: BrandKit): void {
  try {
    localStorage.setItem(BRAND_KEY, JSON.stringify(brand));
  } catch {
    /* ignore */
  }
}
