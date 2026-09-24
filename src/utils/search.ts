import type { Wine } from "../data/catalog";

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

export function filterWines(wines: Wine[], query: string, bodega: string | null): Wine[] {
  let result = wines;
  if (bodega) {
    result = result.filter((w) => (w.bodega || w.categoria_carta) === bodega);
  }
  if (query.trim()) {
    result = result.filter((w) => matchesSearch(w, query));
  }
  return result;
}
