# LA VINÍCOLA MENDOZA — Análisis Estructurado de Carta
## Demo Maestra BlackXProyect | Validación de Fuente de Verdad

**Fecha de análisis:** 2026-09-24 (UTC)  
**Establecimiento:** La Vinícola Mendoza  
**Instagram oficial:** https://www.instagram.com/lavinicola_mdz (@lavinicola_mdz)  
**Google Maps:** https://maps.app.goo.gl/ZWBNoPtNnWTM5qQu8  
**Dirección verificada:** Peatonal Sarmiento 110, Ciudad de Mendoza  
**Rama de trabajo:** `arena/01a0d0be-vitinicola-web-and-cart`  
**Estado del análisis:** ✅ **COMPLETO — PENDIENTE DE VALIDACIÓN HUMANA**  
**Fuente:** `Carta LV MDZ_OCTUBRE.pdf` — 14 páginas JPG (2 portadas + 12 páginas de vinos) — imágenes 0001 a 0014 proporcionadas en este chat  
**Fecha carta:** Octubre (referencia en nombre de archivo) — precios en ARS

---

## 0. RESUMEN EJECUTIVO

Se leyó **literalmente** cada página de la carta. No se inventó ni se normalizó ningún nombre.

- **Total vinos/productos detectados:** **661** (659 OK + 2 DUDOSO)
- **Páginas con vinos:** 12 (páginas 2 a 13; páginas 1 y 14 son portada/contraportada)
- **Categorías detectadas:** **113** — la carta está organizada alfabéticamente por **bodega/marca**, no por varietal. Cada encabezado azul es una categoría.
- **Precios:** 659 con precio visible, 1 sin precio (encabezado), 1 precio suelto sin nombre
- **Campos con datos:** nombre, bodega, categoría, precio, página, estado
- **Campos ausentes en carta:** descripción, presentación, añada (salvo 5 casos donde la añada está en el nombre), cepa en columna separada, puntajes
- **Dudosos:** 2 (maquetación)
- **Ilegibles:** 0
- **Inconsistencias:** 2 DUDOSO (no hay duplicados reales eliminados)

**Archivos entregados para validación:**
- `data/inventario-carta.json` — 661 registros normalizados (fuente de verdad)
- `data/inventario-carta.csv` — mismo inventario en CSV para revisión en Excel/Sheets
- `docs/INVENTARIO-PREVIEW.md` — preview de 50 filas
- `data/raw/carta_octubre/` — carpeta destinada al PDF original (imágenes ya procesadas; pendiente copiar PDF si se re-subió)

> **Regla cumplida:** Se mantuvieron **exactamente** los nombres y precios visibles, incluidos typos de la carta (`Cavernet` por Cabernet, `Rolana` por Rolland, `Premiu m` con espacio, `La Cayetena` vs `La Cayetana`). Los precios con salto de línea (`$11.50` + `0` en siguiente renglón) se unificaron a `$11.500` y se marcaron en `notas_validacion`.

---

## 1. CANTIDAD TOTAL DE VINOS/PRODUCTOS DETECTADOS

| Métrica | Cantidad |
|---------|----------|
| **Total registros extraídos** | **661** |
| **Estado OK** | 659 |
| **Estado DUDOSO** | 2 |
| **Estado ILEGIBLE** | 0 |
| **Con precio válido** | 660 (1 sin precio) |
| **Sin precio** | 1 (`Conscientemente` encabezado) |
| **Productos por página (promedio)** | ~55 |

**Distribución por página:**

| Página (JPG) | Tipo | Vinos | Observación |
|--------------|------|-------|-------------|
| 1 (0001) | Portada | 0 | `CARTA de vinos - LA VINICOLA` |
| **2 (0002)** | Vinos | **81** | Achaval Ferrer → CARO |
| **3 (0003)** | Vinos | **85** | Casarena → COS DE CAL |
| **4 (0004)** | Vinos | **75** | Domaine Bousquet → Familia Falasco |
| **5 (0005)** | Vinos | **50** | Famiglia Bianchi → Fuego Blanco |
| **6 (0006)** | Vinos | **47** | Gen del Alma → Lagarde |
| **7 (0007)** | Vinos | **73** | Las Perdices → Marchiori & Barraud |
| **8 (0008)** | Vinos | **34** | Mendel → Navarro Correas |
| **9 (0009)** | Vinos | **44** | Niven → Pulenta |
| **10 (0010)** | Vinos | **38** | Relator → Rutini |
| **11 (0011)** | Vinos | **36** | Salentein → Sottano |
| **12 (0012)** | Vinos | **76** | Sposato → Viña Cobos |
| **13 (0013)** | Vinos | **22** | Vistalba → ZAHA |
| 14 (0014) | Contraportada | 0 | `CARTA de vinos - LA VINICOLA` |

**Nota:** 661 incluye 2 DUDOSO. Si se excluyen, son **659 vinos vendibles con precio**. No se eliminó ningún producto por parecer repetido; todos se reportan.

---

## 2. CATEGORÍAS DETECTADAS

La carta **no** está categorizada por tipo de vino (Tintos/Blancos/Rosados). Está categorizada por **bodega/marca en orden alfabético**. Se detectaron **113 categorías** (encabezados azules).

**Listado completo (alfabético, con página y cantidad):**

| # | Categoría (literal) | Pág | Cant |
|---|---------------------|-----|------|
| 1 | Achaval Ferrer | 2 | 2 |
| 2 | Alfa crux | 2 | 8 |
| 3 | Alma Negra | 2 | 3 |
| 4 | Alpamanta | 2 | 3 |
| 5 | Alpasion wines | 2 | 6 |
| 6 | Alta Yari | 2 | 3 |
| 7 | Altieri | 2 | 4 |
| 8 | Altocedro/Alandes/Abras | 2 | 9 |
| 9 | Altos las Hormigas | 2 | 3 |
| 10 | Antigal | 2 | 4 |
| 11 | Bemberg wine estate | 2 | 5 |
| 12 | Berlina | 2 | 3* |
| 13 | Bira wines | 2 | 4 |
| 14 | Bizzoto wines | 2 | 4 |
| 15 | BoBÓ | 2 | 4 |
| 16 | Bodega Argento | 2 | 3 |
| 17 | Bressia | 2 | 6 |
| 18 | Cadus | 2 | 1 |
| 19 | Carmelo Patti | 2 | 3 |
| 20 | CARO | 2 | 3 |
| 21 | Casarena | 3 | 4 |
| 22 | Casir Dos Santos | 3 | 3 |
| 23 | Catena Zapata | 3 | 39 |
| 24 | Chandon | 3 | 6 |
| 25 | Chañarmuyo | 3 | 8 |
| 26 | Colome | 3 | 5* |
| 27 | Cruzat | 3 | 5 |
| 28 | De Angeles | 3 | 5 |
| 29 | Decero | 3 | 5 |
| 30 | Desenlace | 3 | 3 |
| 31 | COS DE CAL | 3 | 1 |
| 32 | Domaine Bousquet | 4 | 7 |
| 33 | Domaine Nico | 4 | 6 |
| 34 | Doña Paula | 4 | 6 |
| 35 | Durigutti | 4 | 3 |
| 36 | EL ESTECO | 4 | 9 |
| 37 | El Porvenir | 4 | 4 |
| 38 | El Psicoanalista | 4 | 3 |
| 39 | Enemigo Wines | 4 | 20 |
| 40 | Escorihuela Gascon | 4 | 9 |
| 41 | Estela Perinetti Wines | 4 | 3 |
| 42 | Familia Falasco | 4 | 5 |
| 43 | Famiglia Bianchi | 5 | 12 |
| 44 | Familia Zuccardi | 5 | 16 |
| 45 | Finca la Escarcha | 5 | 3 |
| 46 | Finca las Moras | 5 | 5 |
| 47 | Finca Flichman | 5 | 3 |
| 48 | Finca Suarez | 5 | 3 |
| 49 | Foster Lorca | 5 | 4 |
| 50 | Fuego Blanco | 5 | 4 |
| 51 | Gen del Alma | 6 | 3 |
| 52 | Gimenez Riili | 6 | 8 |
| 53 | Huentala Wines | 6 | 2 |
| 54 | Humberto Canale | 6 | 6 |
| 55 | Lamadrid | 6 | 4 |
| 56 | La imaginacion al poder | 6 | 7 |
| 57 | Kaiken | 6 | 7 |
| 58 | La Posta | 6 | 4 |
| 59 | Lagarde | 6 | 6 |
| 60 | Las Perdices | 7 | 14 |
| 61 | Laureano Gomez | 7 | 5 |
| 62 | Lopez | 7 | 2 |
| 63 | Lorenzo de agrelo | 7 | 3 |
| 64 | Losance | 7 | 13 |
| 65 | Luigi Bosca | 7 | 9 |
| 66 | Luca Wines | 7 | 8 |
| 67 | Lupa | 7 | 2 |
| 68 | Manos negras | 7 | 10 |
| 69 | Marcelo Pelleriti | 7 | 4 |
| 70 | Marchiori & Barraud | 7 | 3 |
| 71 | Mendel Wines | 8 | 4 |
| 72 | Michel Rolland | 8 | 5 |
| 73 | Moet & Chandon | 8 | 2 |
| 74 | Montequieto | 8 | 5 |
| 75 | Monteviejo | 8 | 5 |
| 76 | Morelli & Ojeda | 8 | 5 |
| 77 | Mosquita Muerta | 8 | 5 |
| 78 | Navarro Correas | 8 | 3 |
| 79 | Niven Wines | 9 | 12 |
| 80 | Norton | 9 | 3 |
| 81 | ONOFRI | 9 | 1 |
| 82 | Otronia | 9 | 10 |
| 83 | Penedo Borges | 9 | 7 |
| 84 | Perdona y Olvida | 9 | 2 |
| 85 | Piatelli | 9 | 4 |
| 86 | Pulenta | 9 | 5 |
| 87 | Relator Wines | 10 | 4 |
| 88 | Renacer | 10 | 2 |
| 89 | Ribera Del Cuarzo | 10 | 1 |
| 90 | Riccitelli Wines | 10 | 14 |
| 91 | Rutini Wines | 10 | 17 |
| 92 | Salentein | 11 | 12 |
| 93 | San Pedro de Yacochuya | 11 | 3 |
| 94 | Sarapura | 11 | 5 |
| 95 | Septima | 11 | 7 |
| 96 | Siesta | 11 | 3 |
| 97 | Sin Reglas | 11 | 1 |
| 98 | Sottano | 11 | 5 |
| 99 | Sposato Vineyards | 12 | 2 |
| 100 | Susana Balbo | 12 | 6 |
| 101 | Tapiz | 12 | 4 |
| 102 | TEHO | 12 | 9 |
| 103 | Tikal | 12 | 3 |
| 104 | Trapiche | 12 | 8 |
| 105 | Traslapiedra | 12 | 3 |
| 106 | TRES 14 | 12 | 3 |
| 107 | Trivento | 12 | 7 |
| 108 | Ver Sacrum/La Cayetana | 12 | 9 |
| 109 | Vinyes Ocults | 12 | 6 |
| 110 | Viña Cobos | 12 | 16 |
| 111 | Vistalba | 13 | 4 |
| 112 | Weinert | 13 | 9 |
| 113 | ZAHA | 13 | 9 |

\* Berlina = 2 vinos + 1 precio suelto DUDOSO. Colome = 2 Malbec + 1 encabezado DUDOSO sin precio.

**No se detectaron categorías por color/tipo en la carta.** Todo está agrupado por bodega.

---

## 3. CAMPOS DISPONIBLES

| Campo | Disponible en carta | % | Ejemplo | Notas |
|-------|-------------------|---|---------|-------|
| **nombre del vino** | ✅ Sí | 100% (661/661) | `Achaval Ferrer Quimera Blend Blanco` | Texto exacto, mayúsculas/acentos preservados |
| **bodega** | ✅ Sí | 100% | `Achaval Ferrer` | Encabezado azul literal |
| **línea / etiqueta** | ⚠️ Embebida | 100% en nombre | `Quimera Blend Blanco` | No hay columna separada; está dentro del nombre |
| **cepa / varietal** | ⚠️ Embebida | ~85% en nombre | `Cabernet franc`, `Malbec` | No hay columna separada; si aparece en nombre, se valida contra nombre. Se deja `cepa_varietal: null` para no inferir, pero varietal está visible en nombre cuando aplica. |
| **añada** | ⚠️ Solo 5 casos | 0.7% (5/661) | `Dom Perignon 2013`, `Estiba Reservada 2017`, `Gran Enemigo Gualtallary 2020/2019`, `Trivento Don Melchor 2020` | Solo cuando está en el nombre. Resto `null`. |
| **presentación** | ❌ No | 0% | — | No indica 750ml, Copa, Magnum salvo 2 casos `MAGNUM` en nombre (`Luca Old Vine Malbec MAGNUM`) — se deja `null` salvo esos. |
| **precio** | ✅ Sí | 99.8% (660/661) | `$52.800` | Texto original + `precio` numérico. 1 registro sin precio (DUDOSO). |
| **categoría** | ✅ Sí | 100% | `Catena Zapata` | Es la bodega misma. |
| **descripción** | ❌ No | 0% | — | Carta es solo listado, sin descripciones, puntajes ni notas de cata. |
| **cualquier otro dato explícito** | ❌ No | 0% | — | No hay % alcohol, origen, puntajes Parker, etc. impresos. |

**Campos que sí están en JSON pero vienen de la estética de la carta:**
- `pagina_carta` (2-13)
- `estado_lectura` (OK/DUDOSO)
- `notas_validacion` (para precios con salto de línea)

---

## 4. CAMPOS FALTANTES

| Campo | Faltante | Acción tomada |
|-------|----------|---------------|
| **descripción** | 100% faltante | `descripcion: null` en todos. La carta no tiene textos descriptivos. |
| **presentación / volumen** | 99.7% faltante | `presentacion: null`. Solo 2 vinos dicen `MAGNUM` en el nombre; no se asume 750ml. |
| **añada** | 99.2% faltante | `anada: null` salvo 5 vinos donde el año está en el nombre. No se inventa. |
| **cepa en columna separada** | 100% faltante como columna | `cepa_varietal: null`. La cepa está embebida en el nombre (`Malbec`, `Cabernet Franc`, `Torrontés`, `Pinot Noir`, `Bonarda`, `Chardonnay`, `Sauvignon Blanc`, `Syrah`, `Tannat`, `Semillón`, `Riesling`, `Gewurztraminer`, `Merlot`, `Viognier`, `Chenin`, etc.) — se valida leyendo el nombre. |
| **precio** | 1 faltante | VIN-145 `Conscientemente` sin precio → `precio: null`, `precio_texto_original: null`, `estado: DUDOSO`. |
| **otros datos (puntajes, alcohol, origen)** | 100% faltante | `otros_datos_explicitos: null`. |

**No se completó ningún faltante con inferencia.** Todo queda `null` para validación.

---

## 5. TEXTOS O PRECIOS DUDOSOS / ILEGIBLES

| ID | Pág | Categoría | Valor transcripto | Motivo | Estado |
|----|-----|-----------|-------------------|--------|--------|
| **VIN-053** | 2 | Berlina | `[PRECIO SUELTO SIN NOMBRE VISIBLE] | $22.200` | Precio $22.200 aparece solo, sin vino asociado, entre `Petit Verdot - Tannat $8.600` y `Bira wines`. Posible error de maquetación: vino faltante o precio desplazado. No se inventó nombre. | **DUDOSO** |
| **VIN-145** | 3 | Colome | `Conscientemente | null` | La palabra `Conscientemente` aparece como línea sola sin precio, seguida de `Conscientemente Cabernet Franc $12.100` y `Conscientemente Malbec $18.700`. Parece ser un encabezado/título de línea o vino sin precio. Se marcó como DUDOSO sin precio. | **DUDOSO** |

**Textos con salto de línea (NO se consideran DUDOSO, se unificaron y documentaron):**

- **Precios partidos:** En páginas 5, 6, 7, 8, 10, 11 (y otras) muchos precios aparecen partidos por ancho de columna, ej:
  - `$11.50` (línea 1) + `0` (línea 2) → unificado a `$11.500`
  - `$119.7` + `00` → `$119.700`
  - `$14.000,` + `00` (Losance) → `$14.000`
  - `$285.00` + `0` → `$285.000`
  - Se unificaron y se dejó nota `Precio con salto de línea unificado` en `notas_validacion`. No son ilegibles, son artefactos de maquetación.

**Ilegibles:** **0**. Todo el texto es legible en las 14 imágenes.

**Typos preservados (no corregidos):**
- `Cavernet` por Cabernet (Casir Dos Santos Reserva Cavernet Sauvignon)
- `Rolana` por Rolland (Michel Rolana Mariflor...)
- `Premiu m` con espacio (Nude Premiu m Rosé)
- `La Cayetena` vs `La Cayetana` (header es La Cayetana, vinos aparecen como `La Cayetena Syrah/Pinot noir`)
- `Rva`, `SV`, etc. abreviaturas preservadas

---

## 6. PÁGINAS DE LA CARTA DONDE APARECEN LOS DATOS

| Página JPG | Página PDF (si 1=portada) | Contenido | Rango IDs |
|------------|---------------------------|-----------|-----------|
| 0001 | 1 | Portada `CARTA de vinos` | — |
| 0002 | 2 | Vinos Achaval → CARO | VIN-001 a VIN-081 |
| 0003 | 3 | Casarena → COS DE CAL | VIN-082 a VIN-166 |
| 0004 | 4 | Domaine Bousquet → Familia Falasco | VIN-167 a VIN-241 |
| 0005 | 5 | Famiglia Bianchi → Fuego Blanco | VIN-242 a VIN-291 |
| 0006 | 6 | Gen del Alma → Lagarde | VIN-292 a VIN-338 |
| 0007 | 7 | Las Perdices → Marchiori | VIN-339 a VIN-411 |
| 0008 | 8 | Mendel → Navarro | VIN-412 a VIN-445 |
| 0009 | 9 | Niven → Pulenta | VIN-446 a VIN-489 |
| 0010 | 10 | Relator → Rutini | VIN-490 a VIN-527 |
| 0011 | 11 | Salentein → Sottano | VIN-528 a VIN-563 |
| 0012 | 12 | Sposato → Viña Cobos | VIN-564 a VIN-639 |
| 0013 | 13 | Vistalba → ZAHA | VIN-640 a VIN-661 |
| 0014 | 14 | Contraportada | — |

**Total páginas con datos:** 12. **Total páginas del documento:** 14.

Cada registro en `inventario-carta.json` lleva `pagina_carta` exacta.

---

## 7. INCONSISTENCIAS ENCONTRADAS

| Tipo | Descripción | Productos afectados | Acción |
|------|-------------|---------------------|--------|
| **DUDOSO - Precio suelto** | Precio $22.200 sin nombre entre Berlina y Bira | VIN-053 | Reportado, no eliminado, no inventado nombre |
| **DUDOSO - Encabezado sin precio** | `Conscientemente` sin precio bajo Colome | VIN-145 | Reportado, `precio: null`, no eliminado |

**No se encontraron:**
- ❌ Duplicados reales (mismo vino + misma bodega con dos precios). Se verificó con normalización lower-case; solo hay nombres genéricos repetidos entre bodegas distintas (`Malbec`, `Cabernet Sauvignon`) que **no** son duplicados: son vinos distintos de bodegas distintas con nombre varietal simple (Carmelo Patti Malbec vs El Psicoanalista Malbec vs Weinert Malbec). No se marcan como error; es correcto que la carta tenga `Malbec` corto bajo varias bodegas.
- ❌ Precios con dos valores distintos para mismo vino.
- ❌ Productos sin precio salvo el DUDOSO mencionado.
- ❌ Inconsistencias de formato corregidas silenciosamente: todas documentadas.

**Si hay un vino repetido real (ej: mismo vino en 2 categorías) no se detectó; si aparece en el futuro, se marcará como `POSIBLE_DUPLICADO` sin borrar.**

---

## 8. ARCHIVOS ENTREGADOS

```
data/
  inventario-carta.json  661 registros, 113 categorías, con metadata, resumen, dudosos, inconsistencias. Es la FUENTE DE VERDAD.
  inventario-carta.csv   Mismo inventario en CSV (id, pagina, categoria, bodega, nombre, precio_texto, precio, moneda, estado, notas) — ideal para validar en Google Sheets.
  schema-carta.json      JSON Schema para validar estructura.
  raw/carta_octubre/     Carpeta para el PDF/JPG original (las 14 imágenes ya fueron procesadas; si re-subís el PDF, se guarda intacto aquí).

docs/
  ANALISIS-CARTA-VINICOLA-MENDOZA.md  Este informe.
  INVENTARIO-PREVIEW.md               Preview de 50 filas.

```

**Cómo validar:**
1. Abrí `data/inventario-carta.csv` en Sheets/Excel.
2. Filtrá por `estado_lectura = DUDOSO` para ver los 2 casos.
3. Filtrá por `bodega` para ver cada marca.
4. Verificá que `nombre_completo_visible` y `precio_texto_original` coincidan con la imagen de la página indicada.
5. Marcá ✅/❌ y comentá. Una vez validado, cambiamos `metadata.estado` a `COMPLETO_VALIDADO` y recién ahí diseñamos la Demo.

---

## 9. METODOLOGÍA DE EXTRACCIÓN

1. **Ingesta:** 14 JPG (0001-0014) a máxima resolución, lectura visual directa + OCR mental.
2. **Transcripción literal:** Cada línea con precio se copió exacta, preservando typos, mayúsculas, acentos, guiones. No se normalizó `DV` a `D.V.`, ni `Cabernet franc` a `Cabernet Franc`.
3. **Precios:** Se copió texto exacto (`$52.800`, `$10.100`, `$8.600`, etc.). Cuando el precio estaba partido en dos renglones por ancho de columna, se unificó (`$11.50` + `0` → `$11.500`) y se dejó `notas_validacion: "Precio con salto de línea unificado"`. Moneda siempre `$` ARS; se parseó a `precio: 11500` (entero sin separadores).
4. **Paginación:** Se respetó numeración JPG (1=portada). Cada vino lleva `pagina_carta` 2-13.
5. **Dudosos:** Se marcó `DUDOSO` sin inventar datos, con nota explicativa.
6. **Sin invención:** Campos no visibles → `null`. No se infirió cepa, añada, presentación ni descripciones.

---

## 10. PRÓXIMOS PASOS — VALIDACIÓN REQUERIDA

**No se diseñará interfaz, ni traducción, ni conversión de moneda, ni sommelier, ni packs hasta tu OK.**

Por favor, revisá y confirmá:

- [ ] ¿Los 661 nombres están 100% literales a la carta?
- [ ] ¿Los precios unificados con salto de línea son correctos?
- [ ] ¿Qué hacemos con los 2 DUDOSO? ¿Los dejamos fuera de la demo, los corregimos con dato de la vinoteca, o se mantienen como están?
- [ ] ¿Querés que mantenga las 113 categorías por bodega o que además agregue una capa de filtros por varietal (Malbec, Cabernet Franc, etc.) inferida del nombre para la demo (sin modificar la fuente)?
- [ ] ¿Confirmás que la moneda es ARS y que no hay precios en USD?

Una vez me des el **OK o correcciones puntuales (ej: VIN-053 debería ser X)**, actualizo el JSON, lo marco como `COMPLETO_VALIDADO` y recién ahí paso a diseñar la Demo Maestra BlackXProyect.

---

**Preparado por:** Agent Mode Arena — Demo Maestra BlackXProyect  
**Para:** La Vinícola Mendoza — Peatonal Sarmiento 110  
**Fuente de verdad:** Carta LV MDZ_OCTUBRE.pdf (14 páginas) — extracción literal  
**Estado:** ✅ Inventario completo listo para tu validación

