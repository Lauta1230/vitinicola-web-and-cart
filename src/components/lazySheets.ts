import { lazy } from "react";

/**
 * FASE 5.5 — Code-splitting de overlays secundarios (Bloques 7–10).
 *
 * Los sheets pesados salen del bundle inicial y se cargan bajo demanda.
 * El catálogo, búsqueda y filtros rápidos permanecen en el chunk inicial
 * (regla: nunca lazy del contenido visible inmediato).
 *
 * preloadWineSheet se dispara en hover/focus de WineCard (Bloque 9) para que
 * el primer open sea prácticamente inmediato, sin spinner: el fallback de
 * Suspense es un shell mínimo del propio sheet.
 *
 * Nota: importar este módulo NO arrastra el código de los sheets al bundle
 * inicial — lazy() solo ejecuta el import() dinámico al renderizar/preload.
 */

export const LazyWineSheet = lazy(() =>
  import("./WineSheet").then((m) => ({ default: m.WineSheet }))
);

export const LazySelectionSheet = lazy(() =>
  import("./SelectionSheet").then((m) => ({ default: m.SelectionSheet }))
);

export const LazyGiftExplorer = lazy(() =>
  import("./GiftExplorer").then((m) => ({ default: m.GiftExplorer }))
);

export const LazySommelier = lazy(() =>
  import("./SommelierExplorer").then((m) => ({ default: m.SommelierExplorer }))
);

export function preloadWineSheet(): void {
  void import("./WineSheet");
}
