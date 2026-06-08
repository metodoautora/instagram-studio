import { BrandKit, Project } from "../types";
import { defaultBrandKit } from "../data/brandKit";

const PROJECTS_KEY = "mais_projects_v1";
const BRAND_KEY = "mais_brandkit_v1";
/** Granulado padrão antigo — migra para o valor atual do brand kit. */
const LEGACY_GRAIN_DEFAULT = 38;

function migrateGrain(value: number | undefined): number {
  if (value === LEGACY_GRAIN_DEFAULT) return defaultBrandKit.grain;
  return value ?? defaultBrandKit.grain;
}

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
        grain: migrateGrain(s.grain),
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
    if (!raw) return null;
    const stored = JSON.parse(raw) as BrandKit;
    return {
      ...defaultBrandKit,
      ...stored,
      grain: migrateGrain(stored.grain),
    };
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
