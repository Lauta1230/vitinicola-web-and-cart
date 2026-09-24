import type { Wine } from "./catalog";

/**
 * FASE 3 — Facetas derivadas por evidencia explícita en nombre_completo_visible
 *
 * REGLAS (todas case-insensitive + acentos normalizados):
 * - Malbec: nombre contiene "malbec"
 * - Cabernet Sauvignon: nombre contiene frase exacta "cabernet sauvignon" (no incluye Cabernet Franc / Cabernet solo)
 * - Blancos & Rosados: nombre contiene señal explícita blanco/blanc/white/rose/rosado
 * - Espumantes: señales explícitas de espumante con control de falsos positivos
 *   Señales fuertes: espumante, champagne, sparkling, blanc de blancs, champenoise, charmat
 *   Señales con contexto: extra brut, brut nature, brut + rose (brut rosé)
 *   No se marca automáticamente "brut" o "nature" solos si contexto no es determinativo
 * - Vinos de Autor / Boutique: autor / boutique / winemaker (línea de autor) solo si explícito
 *
 * No se usa conocimiento externo de bodega, precio, premium, etc.
 * No se clasifica por cepa implícita (ej Chardonnay sin "blanco" no es blanco)
 */

export type WineFacets = {
  malbec: boolean;
  cabernetSauvignon: boolean;
  whiteOrRose: boolean;
  sparkling: boolean;
  authorBoutique: boolean;
};

export type FacetKey = "all" | keyof WineFacets;

export const FACET_ORDER: FacetKey[] = [
  "all",
  "malbec",
  "cabernetSauvignon",
  "whiteOrRose",
  "sparkling",
  "authorBoutique",
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isMalbec(wine: Wine): boolean {
  const n = normalize(wine.nombre_completo_visible);
  return n.includes("malbec");
}

export function isCabernetSauvignon(wine: Wine): boolean {
  const n = normalize(wine.nombre_completo_visible);
  // Frase exacta con espacio. Normalización ya convierte guiones a espacio.
  return n.includes("cabernet sauvignon");
}

export function isWhiteOrRose(wine: Wine): boolean {
  const n = normalize(wine.nombre_completo_visible);
  // Señales explícitas. "blanc" cubre "blanco" y "blanc de blancs", pero listamos ambos por claridad.
  // Usamos includes simple; todos son palabras bastante específicas y poco propensas a falsos positivos
  // en nombres de vinos (ver auditoría). No usamos \b para no perder "sauvignon blanc" sin delimitar.
  return (
    n.includes("blanco") ||
    n.includes("blanc") ||
    n.includes("white") ||
    n.includes("rose") ||
    n.includes("rosado")
  );
}

export function isSparkling(wine: Wine): boolean {
  const n = normalize(wine.nombre_completo_visible);

  // Señales inequívocas
  if (n.includes("espumante")) return true;
  if (n.includes("champagne")) return true;
  if (n.includes("sparkling")) return true;
  if (n.includes("blanc de blancs")) return true;
  if (n.includes("champenoise")) return true;
  if (n.includes("charmat")) return true;

  // Señales con contexto — requieren frase completa para evitar falsos positivos
  if (n.includes("extra brut")) return true;
  if (n.includes("brut nature")) return true;
  // brut + rose (rosé ya normalizado a rose) — ej: "brut rose", "brut rose pinot noir"
  if (/\bbrut\b/.test(n) && /\brose\b/.test(n)) return true;

  // No marcar automáticamente "brut" solo o "nature" solo
  // Casos como "DV Catena Nature" (still) quedarían fuera correctamente.
  // Si en el futuro la carta añade "Brut" sin contexto, quedará para revisión manual (ver lista dudosos).
  return false;
}

export function isAuthorBoutique(wine: Wine): boolean {
  const n = normalize(wine.nombre_completo_visible);
  // Solo evidencia explícita
  return n.includes("autor") || n.includes("boutique") || n.includes("winemaker");
}

export function getWineFacets(wine: Wine): WineFacets {
  return {
    malbec: isMalbec(wine),
    cabernetSauvignon: isCabernetSauvignon(wine),
    whiteOrRose: isWhiteOrRose(wine),
    sparkling: isSparkling(wine),
    authorBoutique: isAuthorBoutique(wine),
  };
}

// Mapa id -> facetas, calculado una vez (memoizado)
let _facetsCache: Map<string, WineFacets> | null = null;

export function getFacetsMap(wines: Wine[]): Map<string, WineFacets> {
  if (_facetsCache && _facetsCache.size === wines.length) {
    // Validar que los ids coinciden (por si cambia el catálogo en hot-reload)
    const first = wines[0];
    if (first && _facetsCache.has(first.id)) return _facetsCache;
  }
  const map = new Map<string, WineFacets>();
  for (const w of wines) {
    map.set(w.id, getWineFacets(w));
  }
  _facetsCache = map;
  return map;
}

// Helper para conteos (usado en auditoría y UI)
export function countFacets(wines: Wine[]) {
  const map = getFacetsMap(wines);
  let malbec = 0;
  let cabernetSauvignon = 0;
  let whiteOrRose = 0;
  let sparkling = 0;
  let authorBoutique = 0;
  for (const f of map.values()) {
    if (f.malbec) malbec++;
    if (f.cabernetSauvignon) cabernetSauvignon++;
    if (f.whiteOrRose) whiteOrRose++;
    if (f.sparkling) sparkling++;
    if (f.authorBoutique) authorBoutique++;
  }
  return { malbec, cabernetSauvignon, whiteOrRose, sparkling, authorBoutique };
}

// Casos dudosos para revisión manual (espumantes ambiguos)
export function getAmbiguousSparklingCandidates(wines: Wine[]): Wine[] {
  const out: Wine[] = [];
  for (const w of wines) {
    const n = normalize(w.nombre_completo_visible);
    const hasBrut = /\bbrut\b/.test(n);
    const hasNature = /\bnature\b/.test(n);
    const isSpark = isSparkling(w);
    // Si tiene brut o nature pero NO es sparkling según regla estricta → dudoso
    if ((hasBrut || hasNature) && !isSpark) {
      out.push(w);
    }
  }
  return out;
}

// Para validar que no hay falsos positivos evidentes, exportamos también helpers de auditoría
export const _internal = {
  normalize,
};
