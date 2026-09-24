# FASE 4 — Auditoría Previa de Precios (659 vinos visibles)

**Fecha:** 2026-09-24
**Fuente:** `data/inventario-carta.json` (precio ARS base, sin conversión)
**Muestra:** 659 vinos `estado_lectura === "OK"` y `precio != null` (2 DUDOSO fuera)

## Resumen estadístico

| Métrica | Valor ARS |
|---------|-----------|
| **Mínimo** | $ 4.500 |
| **Máximo** | $ 665.000 |
| **Media** | $ 45.562 |
| **Mediana (P50)** | $ 31.500 |
| **P60** | $ 38.100 |
| **P65** | $ 40.700 |
| **P70** | $ 47.000 |
| **P75** | $ 54.650 |
| **P80** | $ 62.500 |
| **P85** | $ 72.900 |
| **P90** | $ 93.700 |
| **P95** | $ 119.700 |
| **P98** | $ 189.900 |
| **P99** | $ 264.900 |
| **Precios únicos** | 321 / 659 |

## Distribución por rangos

| Rango ARS | Cantidad | % |
|-----------|----------|---|
| $ 0 – 20.000 | 181 | 27.5% |
| $ 20.001 – 40.000 | 240 | 36.4% |
| $ 40.001 – 60.000 | 102 | 15.5% |
| $ 60.001 – 80.000 | 48 | 7.3% |
| $ 80.001 – 100.000 | 42 | 6.4% |
| $ 100.001 – 150.000 | 24 | 3.6% |
| $ 150.001 – 200.000 | 10 | 1.5% |
| $ 200.001 – ∞ | 12 | 1.8% |

### Frecuencia por tramo de $10.000 (hasta $300.000)

| Tramo | Cantidad |
|-------|----------|
| 0 – 9.999 | 22 |
| 10.000 – 19.999 | 152 |
| 20.000 – 29.999 | 140 |
| 30.000 – 39.999 | 104 |
| 40.000 – 49.999 | 59 |
| 50.000 – 59.999 | 43 |
| 60.000 – 69.999 | 32 |
| 70.000 – 79.999 | 19 |
| 80.000 – 89.999 | 18 |
| 90.000 – 99.999 | 22 |
| 100.000 – 109.999 | 14 |
| 110.000 – 119.999 | 3 |
| 120.000 – 129.999 | 3 |
| ... | ... |
| 200.000 – 209.999 | 4 |
| 230.000+ | 4 (hasta 665.000) |

**Observación:** 63.9% bajo $40.000, 86.7% bajo $80.000, 93.1% bajo $100.000. El outlier $665.000 (1 vino) estira el máximo, pero el 95% está bajo $120.000. Distribución fuertemente concentrada en $10k–$40k (55.2% del catálogo).

## Definición de bandas por ocasión

Objetivo comercial: tres intenciones de compra, no valoración de calidad, solo precio.

Candidatos evaluados:

| Banda | Everyday | Gift | Collection |
|-------|----------|------|------------|
| A 0–30k / 30–70k / 70k+ | 48.3% | 35.7% | 16.1% |
| B 0–32k / 32–75k /75k+ | 52.5% | 33.8% | 13.7% |
| **C 0–35k / 35–75k /75k+** | **56.9%** | **29.4%** | **13.7%** |
| D 0–35k /35–80k /80k+ | 56.9% | 29.7% | 13.4% |
| E 0–40k /40–80k /80k+ | 63.9% | 22.8% | 13.4% |

**Umbrales finales elegidos (configuración central `src/data/priceBands.ts`):**

- **$ Para todos los días:** `ARS $0 – $35.000` → 375 vinos (56.9%, ≈ P0–P55). Cubre la mayoría bajo la mediana ($31.500), ideal para consumo diario.
- **$$ Para quedar bien / Regalo:** `ARS $35.001 – $75.000` → 194 vinos (29.4%, P55–P86). Banda media, entre mediana y P85 ($72.900), regalo sin escalar a colección.
- **$$$ Alta Gama / Colección:** `ARS $75.001+` → 90 vinos (13.7%, >P86). Exclusiva, top ~14%, incluye P90+ sin depender del outlier $665k.

**Por qué son razonables:**
- Usan cortes redondos ($35k/$75k) fáciles de comunicar.
- Respetan percentiles: everyday ≈ <P55, gift ≈ P55–P85, collection ≈ >P85 (cerca de P90 $93.700).
- Distribución comercial: ~57% everyday (descubrimiento), ~29% gift (curaduría), ~14% colección (exclusividad) — alta pero no dashboard, premium.
- No solapados, cubren 100%, todos los vinos visibles pertenecen a una sola ocasión.

## Ejemplos por banda (primeros 3)

- **Everyday $0–35k:** VIN-016 Terroir Malbec $13.400, VIN-003 Crux Cabernet franc $10.100, VIN-004 Crux Malbec $10.100
- **Gift $35k–75k:** VIN-001 Achaval Ferrer Quimera Blend Blanco $52.800, VIN-007 Beta Crux Malbec $42.800, VIN-009 Alfa Crux Malbec $38.200
- **Collection $75k+:** VIN-089 Nicasia Blanc de Blancs $98.500, VIN-131 Baron B Extra Brut $82.000, VIN-495000+ VIN-XXX $495.000 / $665.000 (top)

## Edge cases

- Precios `null` ya fuera del catálogo visible (659 filtrados).
- Mínimo $4.500 y máximo $665.000 extremos; slider usará `min:4500 max:665000` con fallback al rango total si inputs inválidos.
- 321 precios únicos → slider lineal, no log; 98% bajo $190k, pero se mantiene rango real para honestidad.

## Archivos

- Auditoría: `docs/fase4-price-audit.md` (este)
- Bandas: `src/data/priceBands.ts`
- Filtro: `src/utils/search.ts` (extendido)
- UI: nuevos controles de precio/ocasión cerca de buscador (ver Fase 4)
