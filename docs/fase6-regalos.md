# Fase 6 — Regalos: Gift Explorer + armado de selección

**Fecha:** 2026-09-24 · Base: `0ad2ea3` (fix service mode)

## Objetivo

Capa de descubrimiento **"Regalos"** para encontrar vinos para regalar y
armar una selección para regalar, sobre catálogo/precios/bandas/selección
reales. "Regalo" = **intención del visitante**, no producto comercial.

## Restricciones comerciales (críticas)

**No existen packs, cajas 3/6/12, packaging, envoltorio, tarjetas, envío,
descuentos, combos ni promociones confirmados por el negocio — y nada de eso
se afirma.** Sin precios tachados, sin "mejor precio", sin "pack x3". Copy
usado: "Explorar regalos", "Tu selección para regalar · N", "Agregar/Agregado".
Arquitectura preparada para el futuro: cuando el negocio confirme productos
reales, se incorporan como datos (nueva fuente), sin tocar el explorador.

## Arquitectura

- `src/components/GiftExplorer.tsx` (nuevo): sheet aislado que **reutiliza** el
  patrón de overlays existente (clases `sel-*`, animaciones, ESC, scroll-lock
  con restauración, foco inicial `preventScroll`). Helper puro testeable
  `isGiftExplorerAvailable()` + `GIFT_BUDGETS` derivado de `priceBands`.
- `lazySheets.ts`: `LazyGiftExplorer` — chunk diferido propio (5.9 kB), sin
  preload (no necesario: el trigger es visible y el chunk carga en el click).
- `App.tsx`: trigger discreto debajo de la fila de quick filters ("Explorar
  regalos", `aria-haspopup="dialog"`, solo en takeaway) + render condicional.
- Apertura de vinos: **WineSheet único** vía `onOpenWine={setSelected}` (sin
  GiftWineSheet). Selección: **mismo** `useSelection()` (sin estado nuevo).

## Datos y lógica (sin duplicar nada)

- Presupuesto = bandas **derivadas de `priceBands`** (labels computados desde
  los valores: "Hasta $ 35.000" / "$ 35.001 – $ 75.000" / "Más de $ 75.001"),
  aplicadas con el parámetro `occasion` de `filterWines`.
- Estilo = facets existentes de Fase 3 (claves `filters.*` reutilizadas).
- Filtros **locales** (`giftBudget`/`giftStyle`): abrir/cerrar no toca búsqueda,
  facet, precio/ocasión globales, idioma, moneda ni selección (Bloques 18/33).
- Resultados deterministas: orden estable del catálogo, sin `Math.random`.
  8 iniciales + "Ver más" paginado (+12). Nunca los 659.
- "Quitar filtros" del empty state limpia SOLO los filtros internos.

## Progressive Disclosure y disponibilidad

Jerarquía: búsqueda → modo → quick filters → **Explorar regalos** (secundario)
→ presupuesto/estilo → resultados → WineSheet → Mi selección.
Visible únicamente con `serviceMode === "takeaway"`; al pasar a "Tomar acá"
desaparece (y al volver reaparece con filtros locales limpios: el componente se
desmonta). La selección global persiste entre modos (Bloque 32 verificado).

## Overlay stacking

Nuevo token `--z-gift: 65` (sin z-index arbitrarios): trigger/barra 45 <
**Gift 65** < WineSheet 70 < SelectionSheet 80 < locale 100. Abrir un vino
desde regalos pone el WineSheet por encima; cerrar devuelve al explorador.

## Performance

- Baseline 5-fix: inicial 550.58 kB (gzip 109.45) → post-F6: **553.25 kB
  (gzip 110.12)** (+2.7 kB: trigger + wiring); **GiftExplorer 5.9 kB diferido**.
- 8 filas montadas inicialmente; `useMemo` sobre el filtro; sin índices nuevos;
  `getFacetsMap`/`SEARCH_INDEX` reutilizados. `memo(Catalog)` evita rerenders
  del listado al abrir/cerrar el explorador.

## Accesibilidad / Motion / Seguridad

`role="dialog"` + `aria-modal` + título accesible + cierre X/ESC/click-fuera;
`aria-pressed` en todos los chips y botones agregar (estados ≠ solo color:
fondo navy + icono relleno + texto); labels con nombre del vino; targets ≥44px;
focus-visible gold; entrada 210ms / salida 140ms bajo `prefers-reduced-motion`.
Sin `dangerouslySetInnerHTML`/`eval`; sin APIs de scroll nuevas; sin
dependencias nuevas.

## QA

- **43 PASS / 0 FAIL**: bandas 375/194/90 vía `filterWines` · Malbec 162 ·
  **18 combinaciones** presupuesto×estilo equivalentes a la intersección manual
  (4 vacías → empty state alcanzable) · bandas derivadas sin duplicar ·
  disponibilidad por modo · 18 claves i18n × 3 idiomas sin fallback ·
  **SSR del componente real** (título, subtítulo, montos derivados, chips,
  ≤8 filas, "Ver más", línea de selección oculta en 0, dialog a11y, sin copy
  de packs) · regresión 659/113 · 162/32/60/28/1 · 375/194/90 · búsqueda.
- Typecheck real (check + app + node): 0 errores. Build OK.
- Preview: `/`, `/?mesa=4`, `/?mesa=12A` → HTTP 200; trigger en inicial,
  componente en su chunk (verificado en los bundles servidos).

## Futuro (requiere input del negocio)

Para convertir esto en packs comerciales reales hará falta: confirmación de
packs/cajas y su composición, costos de packaging/tarjeta, políticas de envío,
y precios/promociones oficiales. Esa información entraría como **datos
estructurados**, manteniendo el explorador como capa de intención.
