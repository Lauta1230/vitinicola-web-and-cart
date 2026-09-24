# FASE 3 — Auditoría Filtros Rápidos por Cepa / Estilo

**Fecha:** 2026-09-24  
**Inventario:** 661 registros · 659 OK visibles · 2 DUDOSO fuera (VIN-053, VIN-145) · 113 bodegas  
**Base:** `data/inventario-carta.json` intacta, sin mutación

## 1. Cantidad de vinos por filtro (659 visibles)

| Filtro | Conteo | % |
|--------|--------|---|
| **Todos** | 659 | 100% |
| **Malbec** | 162 | 24.6% |
| **Cabernet Sauvignon** | 32 | 4.9% |
| **Blancos & Rosados** | 60 | 9.1% |
| **Espumantes** | 28 | 4.2% |
| **Vinos de Autor / Boutique** | 1 (mostrado como *Selección en preparación*) | 0.15% |

> *Autor/Boutique se muestra como preparación para no inventar. El único con evidencia explícita es `VIN-026 Winemaker's Selection Malbec Tannat`.*

## 2. Reglas utilizadas (derivadas solo de `nombre_completo_visible`)

Normalización: `lower + NFD sin acentos + reemplazo [^a-z0-9] → espacio + trim`.

- **Malbec:** `n.includes("malbec")`. Ej: “Malbec”, “Gran Malbec”, “Reserva Malbec”. No se asume por bodega.
- **Cabernet Sauvignon:** `n.includes("cabernet sauvignon")` frase exacta. No incluye “Cabernet Franc” ni “Cabernet” solo. Test: 32 Cab Sauv vs 46 Cab Franc con 0 solapamiento.
- **Blancos & Rosados:** `n.includes("blanco") || "blanc" || "white" || "rose" || "rosado"`. Captura `Sauvignon Blanc`, `Blanco`, `Rosé/Rosado`, `Blanc de Blancs`, `Blanc de Noir`. No asume por cepa (ej Chardonnay sin “blanco” no entra). Verificados 60, sin falsos por “Bianchi” (0/12).
- **Espumantes:** señales inequívocas + contexto para evitar falsos:
  - Fuertes: `espumante`, `champagne`, `sparkling`, `blanc de blancs`, `champenoise`, `charmat`
  - Con contexto: `extra brut`, `brut nature`, `brut`+`rose` (ej `Brut Rosé`).
  - **No** se marca `brut` solo ni `nature` solo (evita `DV Catena Nature` still).
  - Resultado: 28 espumantes, 5 dudosos dejados fuera (ver §3).
- **Autor / Boutique:** `n.includes("autor") || "boutique" || "winemaker"`. Solo evidencia explícita. 1 resultado (`Winemaker's Selection`) se considera insuficiente para categoría robusta → UI muestra *Selección en preparación*.

Todas las facetas en `src/data/styleFacets.ts` (tipo `WineFacets`, `getWineFacets`, `getFacetsMap` memoizado, `countFacets`). **Ninguna condición en `WineCard`.**

## 3. Casos ambiguos encontrados (5)

Dejados fuera de Espumantes para revisión manual:

- `VIN-103 DV Catena Nature` — “Nature” solo, sin Brut/Charmat/Champenoise → posible vino tranquilo “Nature” (orgánico), no espumante determinativo.
- `VIN-125 Saint Felicien Nature` — idem.
- `VIN-149 Cuveé Nature` — “Cuveé” sugiere espumante pero sin “Brut”, contexto ambiguo → no clasificado (conservador).
- `VIN-151 SV Orgánico Nature` — “Nature” orgánico, no espumante claro.
- `VIN-421 Veuve Clicquot Brut Est Eco` — “Brut” solo sin `extra`/`nature`/`rose`/`charmat`/`champenoise` → aunque Veuve es champagne, por regla no asumimos por bodega → dudoso.

> Lista generada por `getAmbiguousSparklingCandidates` (tiene `brut`/`nature` pero no es sparkling según regla).

## 4. Falsos positivos potenciales detectados y corregidos

- **Cabernet Franc → Cab Sauv:** Evitado con frase exacta `cabernet sauvignon`. Test: 0 de 46 Cab Franc en Cab Sauv.
- **Brut/Nature solos → Espumante:** Corregido no marcando `brut`/`nature` sin contexto. Test: `VIN-103`/`125` no en espumantes (0).
- **Blanc substring:** Verificado que “Bianchi” (12 vinos) no da falso blanco (0/12). “Blanc” cubre “Blanco” sin falsos en “Barbera” etc.
- **Rosé acento:** Normalización `rosé→rose`, evita perder `Saint Felicien Rosé`.
- **Malbec por bodega:** Verificado `Chandon` (bodega sin malbec en nombre) 0 malbec.
- **White/Rosado por cepa:** No se asume Chardonnay/Gewurztraminer sin “blanco/white” → correcto (ej `Fuego Blanco Gewurztraminer` sí entra por “Blanco”, pero `Chardonnay` solo no).

## 5. Ejemplos de coincidencias (primeros 5 por filtro)

- **Malbec:** VIN-004 `Crux Malbec`, VIN-007 `Beta Crux Malbec`, VIN-009 `Alfa Crux Malbec`, VIN-016 `Terroir Malbec`, VIN-017 `Grand Malbec`
- **Cab Sauv:** VIN-047 `La Linterna Cabernet Sauvignon Cafayate`, VIN-077 `Cabernet Sauvignon`, VIN-083 `DNA Cabernet Sauvignon`, VIN-092 `Saint Felicien Cabernet Sauvignon`, VIN-107 `Angélica Cabernet Sauvignon`
- **Blancos & Rosados:** VIN-001 `Quimera Blend Blanco`, VIN-011 `Alma Negra Blanco`, VIN-015 `Terroir Sauvignon Blanc`, VIN-032 `Año Cero Rose`, VIN-035 `Paradoux Blend Blanco`
- **Espumantes:** VIN-089 `Nicasia Blanc de Blancs`, VIN-131 `Baron B Extra Brut`, VIN-132 `Baron B Brut Nature`, VIN-133 `Baron B Brut Rose`, VIN-148 `Cuveé Extra Brut`
- **Autor/Boutique:** VIN-026 `Winemaker's Selection Malbec Tannat` (mostrado como preparación)

## 6. Comportamiento combinado

- `filterWines(query,bodega,facet)` en `utils/search.ts` (memoiza facetas, no duplica catálogo).
- Ej: `facet Malbec + query Catena` → 10 resultados (all `Nicasia Red Blend Malbec` etc.).
- Ej: `facet Malbec + bodega Catena Zapata` → 10.
- Ej: `Blancos & Rosados + Quimera` → 1 (`Quimera Blend Blanco`).
- Idioma/moneda/tipo cambio ortogonales, se preservan.
- `Bodega Explorer` + faceta coexisten: `Catena Zapata + Malbec` filtra intersección.

## 7. Archivos creados / modificados

- **Creados:** `src/data/styleFacets.ts`, `src/components/QuickFilters.tsx`, `docs/fase3-auditoria.md`
- **Modificados:** `src/data/translations.ts` (+ filtros ES/PT/EN), `src/utils/search.ts` (facet param), `src/components/Catalog.tsx` (facet + empty/preparación), `src/App.tsx` (estado facet, counts, QuickFilters), `src/components/QuickFilters.tsx` estilo carta

## 8. Validación

- `npm run check` → `tsc --noEmit` 0 errores
- `npm run build` → `tsc -b && vite build` 37 módulos `534kB gz103kB` ✓
- Inventario 659 OK / 2 DUDOSO / 113 bodegas intacto
- Búsqueda + faceta + bodega OK
- Limpiar filtros (facet+query+bodega) y Todos (solo facet) OK
- WineSheet / WineryExplorer / scroll sin cambios (Header único sticky, sin `scrollIntoView`, `window.scrollTo` solo CTA, `scrollLeft` para chips)
- Mobile 320/375/390/430: QuickFilters `overflowX auto` + `onWheel scrollLeft`, sin `scrollIntoView`, sin overflow horizontal
- Diseño: chips `rounded 999`, `navy` activo con `shadow`, `line-strong` inactivo, tipografía sobria, barra `paper-warm` integrada a carta

No avanzar a Fase 4.
