# Fase 5E — QA integral de Fase 5

**Fecha:** 2026-09-24 · Base: `584fc4f` (5A+5B+5C+5D) · Resultado: **PASS CON CORRECCIONES**

## Estado inicial auditado

Todas las piezas de Fase 5 (`useTableContext`, `SelectionContext`,
`ServiceModeSwitch`, `TableContextBadge`, `SelectionSheet`, `SelectionTrigger`,
`TableActionBar`, `WineSheet`, `App`, `translations`, `global/tokens.css`):
fuentes de verdad (parser 5A / contexto selección 5B / locale Fase 2),
dependencias entre contextos, listeners y timers con cleanup, scroll-locks,
focus management, z-index (40 Header < 45 barra/trigger < 70 WineSheet <
80 SelectionSheet < 100/101 locale) y condiciones de montaje.

### Matriz crítica de estados (mesa × modo × sheets)

| Mesa | Modo | Barra | Badge | Nota |
|---|---|---|---|---|
| none | takeaway | ausente | ausente | caso `/` |
| 4 / 12A | bar | visible | visible | caso mesa |
| 4 / 12A | takeaway | ausente | visible | mesa es metadata |
| invalid ×5 | cualquiera | ausente | ausente | parser → null, sin excepción |

WineSheet (z70) cubre barra y trigger; SelectionSheet (z80) cubre WineSheet.
WineSheet y SelectionSheet no pueden coexistir (el overlay de la ficha cubre el
trigger), por lo que no existe escenario de ESC doble.

## Problemas encontrados

| Problema | Causa | Corrección | Estado |
|---|---|---|---|
| Trigger leía "1 vinos guardados" en aria-label | `countMany` sin caso singular | Usar `countOne` cuando n===1 (`SelectionTrigger.tsx`, 1 línea) | **CORREGIDO** + typecheck + bundle |
| Suite marcaba 5 fallos de sanitización | Bug del harness de test (loop `.entries()`), no del producto | Harness corregido | Resuelto (69 PASS) |
| `dangerouslySetInnerHTML` en `Catalog.tsx:96` | Fase 1: `noResultsDesc` con `<strong>` estáticos | Ninguna: contenido first-party de traducciones, sin input de usuario ni path desde URL/mesa/IDs | Aceptado, documentado |
| Botones del Header de 32px (<44px touch) | Preexistente Fase 1/2 | Fuera de alcance de 5E (no es regresión de Fase 5) | Pendiente 5.5 |
| Cambiar service mode re-renderiza el catálogo completo | Estado del modo en `AppInner` re-renderea children | No es bug: mismo patrón que filtros/búsqueda; optimización estructural corresponde a 5.5 | Pendiente 5.5 |
| ESC doble WineSheet+SelectionSheet (teórico) | — | No alcanzable en la UI actual | No reproducible |

## Tests

- **Suite integral: 69 PASS / 0 FAIL** — 5A (26: sanitización + lectura), 5B
  (22: reducer completo + inválidos + rapid-toggle ×7/×8), 5C (6: toggle,
  contador, sync bidireccional), 5D (11: visibilidad + exclusividad + reset),
  regresión (4: 659/113, facets, occasions).
- **Traducciones:** 127 paths usados × ES/PT/EN — completos; placeholders
  verificados; 0 secciones con claves duplicadas internas.
- Typecheck real: `check` + `app` + `node` — 0 errores.

## Regresión

659 vinos · 113 bodegas · 162/32/60/28/1 · 375/194/90 — intactos (ejecutado
contra el código real). Locale popover, WineSheet, búsqueda, filtros, moneda y
mesa: sin cambios funcionales en 5E (una línea aria-label en trigger).

## Responsive

Validación por análisis estático del CSS compilado (sin navegador real en el
entorno): 320px — sin overflow del body (scroll interno de barra con fade
`mask-image` ≤480px, trigger sin label <350px, labels con clamp/ellipsis),
targets ≥44px; 430px — cuatro acciones visibles sin reducir touch; desktop —
barra centrada max-width 860px, sheets 640px; safe-area respetada en barra y
trigger; landscape/teclado — fixed bottom estable, sin hallazgos bloqueantes.

## Accessibility

`role="dialog"`+`aria-modal` en sheets; `aria-pressed` en selector de modo,
CTA de ficha y acciones de mesa; `nav aria-label` en barra; aria-labels con
nombre de vino; live regions para feedback y conteo; focus-visible gold;
ESC en los tres overlays; estados no-dependientes-de-color (icono ✓/relleno +
peso + borde).

## Performance (hallazgos reales)

- Toggle de selección: aislado (consumers hoja; catálogo no re-renderiza) ✓
- `activeAction` de barra: 100% local ✓
- Listeners/timers: todos con cleanup (ESC, resize, scroll, timers de
  feedback/cierre) ✓
- Bundle: base 544.49 kB (gzip 106.40) → 559.41 kB (gzip 110.28) JS; CSS
  1.51 → 12.57 kB. Delta Fase 5 ≈ +15 kB JS / +11 kB CSS por 4 features.
- Único bottleneck real: cambio de service mode re-renderiza el listado
  (mismo mecanismo que filtros) — **se registra, no se optimiza** (5.5).

## Pendientes para 5.5

1. Code-splitting del bundle >500 kB (warning preexistente).
2. Memoizar catálogo (`React.memo`/separación de estado de modo) para evitar
   re-render del listado al cambiar contexto de servicio.
3. Progressive Disclosure niveles 1/3/5 (Tomar acá-Llevar ya existe como
   selector; disclosure "Filtrar"; Mi selección contextual).
4. Touch targets del Header a 44px.
5. Observación teclado móvil: posición de barra fija bajo `visualViewport`.

## Preview final

Producción en :4173 — `/`, `/?mesa=4`, `/?mesa=12A`, `/?mesa=abc` → HTTP 200;
bundle servido idéntico al build final (`index-D70zng7W.js`).

**Commit:** `qa: harden fase 5 wine bar flow` (ver git log).
