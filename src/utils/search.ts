import type { Wine } from "../data/catalog";
import { allWines } from "../data/catalog";
import type { FacetKey } from "../data/styleFacets";
import { getFacetsMap } from "../data/styleFacets";
import type { OccasionFilter } from "../data/priceBands";
import { isPriceInRange, isPriceInOccasion } from "../data/priceBands";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * FASE 5.5 — Índice de búsqueda precomputado UNA sola vez a nivel módulo.
 * Antes: cada tecla re-normalizaba nombre+bodega+categoría+añada de los 659
 * vinos (659 × 4 normalizaciones NFD/regex por keystroke). Ahora: 1 lookup de
 * Map + includes(). Construcción única, sin duplicar el catálogo.
 */
function searchableText(w: Wine): string {
  return normalize(
    `${w.nombre_completo_visible} ${w.bodega ?? ""} ${w.categoria_carta ?? ""} ${w.anada ?? ""}`
  );
}

const SEARCH_INDEX: ReadonlyMap<string, string> = new Map(
  allWines.map((w) => [w.id, searchableText(w)])
);

export function matchesSearch(wine: Wine, query: string): boolean {
  if (!query.trim()) return true;
  const q = normalize(query);
  // Índice precomputado; fallback defensivo para vinos fuera del catálogo.
  const haystack = SEARCH_INDEX.get(wine.id) ?? searchableText(wine);
  return haystack.includes(q);
}

export function filterWines(
  wines: Wine[],
  query: string,
  bodega: string | null,
  facet: FacetKey = "all",
  priceRange: [number, number] | null = null,
  occasion: OccasionFilter = "all"
): Wine[] {
  let result = wines;

  if (bodega) {
    result = result.filter((w) => (w.bodega || w.categoria_carta) === bodega);
  }

  if (facet && facet !== "all") {
    const facetsMap = getFacetsMap(wines);
    result = result.filter((w) => {
      const f = facetsMap.get(w.id);
      if (!f) return false;
      return f[facet] === true;
    });
  }

  // Ocasión: basada siempre en precio ARS original
  if (occasion && occasion !== "all") {
    result = result.filter((w) => isPriceInOccasion(w.precio, occasion));
  }

  // Rango de precio: también en ARS original
  if (priceRange) {
    const [min, max] = priceRange;
    // Si el rango es el total, no filtrar para performance
    result = result.filter((w) => isPriceInRange(w.precio, [min, max]));
  }

  if (query.trim()) {
    result = result.filter((w) => matchesSearch(w, query));
  }

  return result;
}
