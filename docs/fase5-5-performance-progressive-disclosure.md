# Fase 5.5 — Performance + Progressive Disclosure + reducción de densidad

**Fecha:** 2026-09-24 · Base: `f25a026` (5E) · Metodología: auditar → corregir mínimo → remedir.

## Baseline 5E

```text
JS inicial: 559.41 kB (gzip 110.28) · 1 chunk · warning >500 kB
CSS:        12.57 kB (gzip 3.12)
```

## Problemas encontrados

| Problema | Evidencia | Causa | Solución |
|---|---|---|---|
| Service mode/selección/sheets re-renderizaban el catálogo | `Catalog` sin memo; `clearAllFilters`/`handleExplore` recreadas por render | Sin frontera de memoización en App | `memo(Catalog)` + `useCallback` (P1) |
| Búsqueda normalizaba 659×4 campos por tecla | `matchesSearch` hacía NFD+regex+lowercase por vino en cada filtro | Sin índice | `SEARCH_INDEX` precomputado 1× a nivel módulo (P2) |
| Sheets de WineSheet/SelectionSheet en bundle inicial | 1 chunk con todo | Sin code-splitting | `lazy()` + Suspense + **preload en hover/focus de WineCard** (P3) |
| Precio/ocasión siempre visibles (~200px de controles) | `PriceOccasionFilters` inline | Sin disclosure Nivel 3 | Botón "Filtrar" (`aria-expanded`/`aria-controls`, contador visible, ESC, "Limpiar filtros" que SOLO limpia precio+ocasión) (P4) |
| 113 secciones de bodega renderizadas/pintadas al inicio | Grid completo en DOM visible | Sin `content-visibility` | `content-visibility: auto` + `contain-intrinsic-size` por `<section>` (P5) |
| Botones Header/locale de 32px (<44px) | Hallazgo 5E | Fase 1/2 | Maps/Instagram/locale trigger a 44px de alto (P6) |

## Performance

| Métrica | Baseline 5E | Post 5.5 |
|---|---|---|
| JS inicial | 559.41 kB / gzip 110.28 | **550.57 kB / gzip 109.45** (−8.8 kB) |
| WineSheet | en inicial | **chunk diferido 9.28 kB (gzip 2.75)**, preload en hover/focus |
| SelectionSheet | en inicial | **chunk diferido 3.60 kB (gzip 1.43)**, se carga solo al abrir |
| CSS | 12.57 kB | 14.27 kB (disclosure + cv) |
| Renders catálogo al cambiar modo/selección/sheets | árbol completo (659 cards) | **0 (memo con props estables)** |
| Normalizaciones por tecla de búsqueda | ~2.636 (659×4) | **1 lookup de Map + includes()** |
| Validación de equivalencia | — | 12 queries idénticas a la implementación previa (162 "malbec") |

**El warning >500 kB persiste y queda justificado:** el peso dominante es el
inventario de 661 vinos embebido (fuente de verdad de la carta). Sacarlo del
chunk inicial exigiría cargar el catálogo de forma asíncrona, prohibido por la
regla "el catálogo debe estar disponible inmediatamente". No se infla el número
de chunks para ocultar el warning.

## Progressive Disclosure (estado final)

- **Nivel 1:** identidad + búsqueda + contexto (Tomar acá / Llevar) — sin cambios.
- **Nivel 2:** quick filters (Malbec/Cabernet/Blancos/Espumantes/Autor) visibles — sin cambios.
- **Nivel 3:** precio/ocasión detrás de **"Filtrar"** — lógica de Fase 4 intacta; botón comunica estado con número visible + `aria-expanded`; "Limpiar filtros" del panel preserva búsqueda/facet/modo/idioma/selección.
- **Nivel 4:** WineSheet — conserva protagonismo; ahora con carga diferida instantánea (preload).
- **Nivel 5:** Mi selección (trigger secundario intacto) + acciones de mesa contextuales — intactos.
- WineryExplorer ya era disclosure (botón → sheet): sin cambios.

## Decisiones NO tomadas

- **No virtualizar:** el scroll editorial/anchors no garantiza las 7 condiciones del Bloque 11; `content-visibility` cubre el costo de pintado sin riesgo de scroll.
- **No debounce:** con índice precomputado la búsqueda es un includes() sobre 659 strings (<1ms); debounce degradaría la sensación.
- **No `visualViewport`:** sin bug demostrado (pendiente de investigación de 5E).
- **No lazy de WineryExplorer/LocaleSettingsSheet:** su botón es contenido inicial visible / requiere refactor del Header con ganancia baja.

## QA

- Suite 5.5: **18 PASS / 0 FAIL** (5A parser, 5B reducer, 5C toggle, 5D barra, búsqueda indexada, regresión 659/113 · 162/32/60/28/1 · 375/194/90).
- Code-splitting verificado en build: `ws-sel-btn-ico`/`Te recomiendo` solo en chunk WineSheet; `sel-empty-*` solo en chunk SelectionSheet; ambos HTTP 200 servidos.
- Typecheck real (check + app + node): 0 errores. Sin dependencias nuevas (`package.json` intacto). Sin `dangerouslySetInnerHTML`/`eval` nuevos. Cero APIs de scroll nuevas (el preload es `import()`).
- Preview: `/`, `/?mesa=4`, `/?mesa=12A`, `/?mesa=abc` → HTTP 200; bundle servido = build final.
