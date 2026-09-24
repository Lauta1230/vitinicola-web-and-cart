# FASE 4 — Filtro por Precio + Ocasión — Reporte Final

**Fecha:** 2026-09-24
**Base:** 659 visibles / 661 total / 2 DUDOSO fuera / 113 bodegas

## 1. Distribución de precios (auditoría previa)

Ver `docs/fase4-price-audit.md` para detalle completo. Resumen:

- Min $4.500, Max $665.000, Media $45.562, Mediana $31.500
- P75 $54.650, P85 $72.900, P90 $93.700, P95 $119.700
- 321 precios únicos
- 63.9% bajo $40.000, 86.7% bajo $80.000, 93.1% bajo $100.000

## 2. Umbrales finales (src/data/priceBands.ts)

```ts
everyday:   { min: 0,      max: 35000 }  // ARS $0 – $35.000
gift:       { min: 35001,  max: 75000 }  // ARS $35.001 – $75.000
collection:{ min: 75001,  max: Infinity } // ARS $75.001+
MIN_PRICE = 4500, MAX_PRICE = 665000
```

**Por qué son razonables:**
- Cortes redondos ($35k/$75k) fáciles de comunicar, cubren 100% sin solapamiento (`everyday.max+1===gift.min`).
- Respetan percentiles: everyday ≈ P0–P55 (mediana $31.500), gift ≈ P55–P85 ($72.900), collection ≈ >P85 (cerca de P90 $93.700).
- Balance comercial 56.9% / 29.4% / 13.7% — mayoría everyday para descubrimiento, gift sustancial, colección exclusiva (~14%) sin ser dashboard. Editorial premium.
- Documentado en código: thresholds siempre en ARS original, moneda solo visualiza.

## 3. Cantidad por ocasión

- **$ Para todos los días:** 375 vinos (56.9%)
- **$$ Para quedar bien / Regalo:** 194 vinos (29.4%)
- **$$$ Alta Gama / Colección:** 90 vinos (13.7%)
- **Todos:** 659

## 4. Ejemplos por banda

- **Everyday $0–35k:** VIN-003 Crux Cabernet franc $10.100, VIN-004 Crux Malbec $10.100, VIN-016 Terroir Malbec $13.400
- **Gift $35k–75k:** VIN-001 Achaval Ferrer Quimera Blend Blanco $52.800, VIN-007 Beta Crux Malbec $42.800, VIN-089 Nicasia Blanc de Blancs $98.500 (no, es collection) — mejor VIN-009 Alfa Crux Malbec $38.200
- **Collection $75k+:** VIN-022 Old School $98.000, VIN-038 Altocedro Finca Los Turcos Malbec $94.000, VIN-665k outlier $665.000

## 5. Archivos creados/modificados

- **Creados:** `src/data/priceBands.ts`, `src/components/PriceOccasionFilters.tsx`, `docs/fase4-price-audit.md`, `docs/fase4-report.md`
- **Modificados:** `src/data/translations.ts` (+ `price.*` ES/PT/EN), `src/utils/search.ts` (filterWines con priceRange+occasion), `src/components/Catalog.tsx` (priceRange/occasion + empty `price.noResults`), `src/App.tsx` (estados priceRange/occasion, PriceOccasionFilters, resumen Filtros activos, intersección con búsqueda/bodega/facet)

No se tocó: inventario, nombres, bodegas, DUDOSO, styleFacets, QuickFilters, búsqueda, WineryExplorer, WineSheet, LocaleSettingsSheet, scroll.

## 6. npm run build

`tsc -b && vite build` 39 módulos `544kB gz106kB` ✓

## 7. npm run check

`tsc --noEmit` 0 errores ✓

## 8. Edge cases encontrados

- Precios `null` ya fuera del catálogo visible (659 filtrados), no participan.
- Rango inicial `[4500,665000]` con outlier $665k: slider lineal mantiene rango real para honestidad, pero 98% bajo $190k; fallback a rango total si inputs inválidos (`parseInt` NaN → restaura).
- Inputs numéricos permiten valores fuera de rango → clamped `max(4500, min(v, max-1000))`.
- Moneda BRL/USD no cambia clasificación: thresholds siempre ARS, verificado gift 194 igual en ARS y USD view.
- Nombres largos y bodegas largas probados en 320px: grid 1fr, flexWrap, sin overflow.

## 9. Clasificación fuera por datos incompletos

Ninguna. Todos los 659 visibles pertenecen a una sola ocasión (validado `c===1` para cada vino). No se excluye por datos incompletos.

## Validación técnica (extracto)

- 659 visibles ✓, 113 bodegas ✓, 2 DUDOSO fuera ✓, bandas no solapadas ✓, todos en una sola ocasión ✓, ausencia null ✓
- Filtros combinados: Malbec+gift 50, Catena+Malbec+gift 1, Blancos+gift 14, $20k–$50k 305, Malbec+$20k–$50k 67
- Búsqueda+filtros: Quimera+blancos+gift 1 (VIN-001)
- Limpiar filtros → 659 ✓
- Idioma/moneda ortogonales, WineSheet/scroll/responsive sin regresión
