import rawData from "../../data/inventario-carta.json";

export type Wine = {
  id: string;
  pagina_carta: number;
  categoria_carta: string;
  nombre_completo_visible: string;
  bodega: string | null;
  linea_etiqueta: string | null;
  cepa_varietal: string | null;
  anada: string | number | null;
  presentacion: string | null;
  precio_texto_original: string | null;
  precio: number | null;
  moneda: string | null;
  descripcion: string | null;
  otros_datos_explicitos: string | null;
  estado_lectura: "OK" | "DUDOSO" | "ILEGIBLE" | "POSIBLE_DUPLICADO";
  notas_validacion: string | null;
};

type RawInventory = typeof rawData;

const inventory = rawData as unknown as {
  metadata: RawInventory["metadata"];
  categorias_detectadas: RawInventory["categorias_detectadas"];
  productos: Wine[];
};

// Solo vinos vendibles: OK (659). Excluir DUDOSO hasta confirmación.
export const allWines: Wine[] = inventory.productos.filter(
  (p) => p.estado_lectura === "OK" && p.precio !== null && p.precio !== undefined
);

// Mantener referencia a DUDOSO por auditoría (no visible en catálogo)
export const dudosoWines: Wine[] = inventory.productos.filter(
  (p) => p.estado_lectura !== "OK"
);

export const metadata = inventory.metadata;
export const categorias = inventory.categorias_detectadas;

// Agrupado por bodega, orden alfabético
export const groupedByBodega = (() => {
  const map = new Map<string, Wine[]>();
  for (const w of allWines) {
    const key = w.bodega || w.categoria_carta || "Sin bodega";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(w);
  }
  // Ordenar bodegas alfabéticamente (case-insensitive)
  const sortedEntries = Array.from(map.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "es", { sensitivity: "base" })
  );
  // Dentro de cada bodega, ordenar por nombre
  for (const [, wines] of sortedEntries) {
    wines.sort((a, b) =>
      a.nombre_completo_visible.localeCompare(b.nombre_completo_visible, "es", {
        sensitivity: "base",
      })
    );
  }
  return sortedEntries;
})();

export const bodegaList = groupedByBodega.map(([name, wines]) => ({
  name,
  count: wines.length,
  // página donde aparece por primera vez esa bodega
  pagina: wines[0]?.pagina_carta ?? 0,
}));

// Para búsqueda rápida
export const totalVisibles = allWines.length;
export const totalRegistros = inventory.productos.length;
export const totalBodegas = bodegaList.length;
