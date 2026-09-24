import type { Wine } from "../data/catalog";
import type { FacetKey } from "../data/styleFacets";
import { getFacetsMap } from "../data/styleFacets";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function matchesSearch(wine: Wine, query: string): boolean {
  if (!query.trim()) return true;
  const q = normalize(query);
  const haystack = normalize(
    `${wine.nombre_completo_visible} ${wine.bodega ?? ""} ${wine.categoria_carta ?? ""} ${wine.anada ?? ""}`
  );
  return haystack.includes(q);
}

export function filterWines(
  wines: Wine[],
  query: string,
  bodega: string | null,
  facet: FacetKey = "all"
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

  if (query.trim()) {
    result = result.filter((w) => matchesSearch(w, query));
  }

  return result;
}
