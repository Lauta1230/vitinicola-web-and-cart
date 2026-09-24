# Fase 7 — Sommelier Digital + Ficha de Cata

**Fecha:** 2026-09-24 · Base: `7fee968` (Fase 6)

## Sommelier — concepto y arquitectura

**Buscador guiado de vinos** (NO chatbot, NO generativo, NO recomendaciones
opinionadas): convierte selecciones **explícitas** del visitante en
coincidencias reales del catálogo, explicadas por los criterios elegidos.

- `src/components/SommelierExplorer.tsx` (nuevo): sheet aislado sobre el patrón
  de overlays existente; **chunk lazy propio** (`LazySommelier`); disponible en
  **ambos** service modes (trigger secundario junto a "Explorar regalos").
- Tres preguntas **opcionales**: Ocasión (F4) · Estilo (facets F3) ·
  Presupuesto (bandas **derivadas de `priceBands`**, sin duplicar límites).
- Estado 100% local (`sommelierOccasion/Style/Budget`): cerrar no toca
  búsqueda, filtros, selección, moneda, idioma ni service mode.
- Motor: `filterWines` (estilo + ocasión) + `isPriceInRange` (presupuesto,
  para poder combinarse con la ocasión que usa el mismo parámetro del motor).
  Sin IA, sin `Math.random`, sin rankings externos, sin índices nuevos.

## Scoring (determinista y documentado)

`matchScore(wine, criteria)`: **+1** por cada criterio activo cumplido
(estilo / ocasión / presupuesto), máximo 3. En coincidencias exactas todos los
resultados empatan → **se conserva el orden estable del catálogo**. Sin rating,
calidad, popularidad ni "mejor opción". La explicación por fila lista los
criterios activos ("Coincide por ocasión + estilo"). Verificado O(1) por vino
(predicados de facet existentes, sin reconstruir caches).

## Resultados

6 iniciales (nunca los 659) + "Ver más" (+6). Empty state real cuando la
combinación no tiene coincidencias (p.ej. criterios contradictorios
ocasión-gift + presupuesto-everyday → 0): permite quitar cada criterio
individualmente o reiniciar el sommelier — nunca filtros globales.

## Ficha de Cata (WineSheet)

- Sección nueva en el **WineSheet único** (sin SommelierWineSheet), dentro de
  su chunk lazy (cero costo para el inicial).
- **Render condicional por disponibilidad real**: aromas/paladar/acidez/
  taninos/cuerpo/final/temperatura/maridajes se muestran SOLO si el dato
  existe; sin datos → estado vacío discreto "La información de cata de este
  vino todavía no está cargada."
- Modelo preparado para futuro (Bloque 21/22): `Wine.tasting?` con `source?:
  "official" | "business-approved" | "unknown"` + `pairings?` — **undefined
  para todos los vinos actuales** (verificado: 0 vinos con tasting). La fuente
  se muestra solo si existe; `unknown` no afirma verificación.
- **No se generó ninguna nota de cata ni maridaje automáticamente** — ni por
  IA, ni por inferencia del nombre, ni por búsqueda externa (Bloque 23:
  sin scraping en runtime).

## Tests

**110 PASS / 0 FAIL**:
- Sin criterios → 659 en orden estable · Malbec → 162 · ocasiones 375/194/90
- Presupuesto+estilo ≡ `filterWines` · 3 criterios ≡ intersección manual
- **72 combinaciones** estilo×ocasión×banda ≡ intersección manual (44 vacías →
  empty state alcanzable y correcto)
- Score: 3>2>1 · empate preserva orden · sin criterios → 0
- Bandas derivadas sin duplicar valores · 29 claves i18n × 3 idiomas sin fallback
- SSR del Sommelier (título, preguntas, 6 filas, Ver más, a11y, sin copy
  prohibido "mejor/perfecto/#1")
- Cata: vino real → vacío sin campos ficticios; fixture (sin tocar inventario)
  → aromas/paladar/finish/pairings/fuente; `source: unknown` → dato visible
  sin label de verificación
- Regresión: 659 · 113 · 162/32/60/28/1 · 375/194/90 · **0 vinos con tasting
  inventado en el inventario**

## Bundle (BASE 6 → POST 7)

| Métrica | Fase 6 | Fase 7 |
|---|---|---|
| JS inicial | 553.25 kB (110.12) | **557.40 kB (111.18)** +4.2 (trigger+wiring) |
| Sommelier | — | **chunk diferido** (trigger en inicial, componente en chunk) |
| WineSheet | 9.28 kB | 11.63 kB (ficha de cata en su chunk) |

Typecheck real (check + app + node): 0 errores. Preview: `/`, `/?mesa=4`,
`/?mesa=12A`, `/?mesa=abc` → HTTP 200; división de chunks verificada en los
bundles servidos. Sin dependencias nuevas, sin `dangerouslySetInnerHTML`, sin
APIs de scroll nuevas.

## Accesibilidad / Responsive

`role="dialog"` + `aria-modal` + título + ESC + click-fuera + focus inicial
`preventScroll`; `aria-pressed` en chips y agregar; quitables de criterio con
labels; targets ≥44px; focus-visible gold; animaciones existentes bajo
`prefers-reduced-motion`. Responsive heredado del patrón (chips scrollables
320px, sheet ≤640px desktop).

## Decisiones explícitas

1. **No se generaron notas de cata ni maridajes automáticamente.**
2. La mesa NO es criterio de recomendación (solo contexto/barra).
3. Sommelier ≠ Gift Explorer: descubrimiento por preferencias explícitas y
   explicado vs presupuesto+estilo para regalar; UIs similares en patrón pero
   con copy y motor diferenciados.
4. Resultados exactos únicamente (coincidencia parcial queda para el futuro
   usando el mismo `matchScore`).
