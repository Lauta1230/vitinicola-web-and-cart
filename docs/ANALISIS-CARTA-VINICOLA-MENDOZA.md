# LA VINÍCOLA MENDOZA — Análisis Estructurado de Carta
## Demo Maestra BlackXProyect | Validación de Fuente de Verdad

**Fecha de análisis:** 2026-09-24 (UTC)  
**Establecimiento:** La Vinícola Mendoza  
**Instagram oficial:** https://www.instagram.com/lavinicola_mdz (@lavinicola_mdz)  
**Google Maps:** https://maps.app.goo.gl/ZWBNoPtNnWTM5qQu8  
**Dirección verificada:** Peatonal Sarmiento 110, Ciudad de Mendoza  
**Rama de trabajo:** `arena/01a0d0be-vitinicola-web-and-cart`  
**Estado del análisis:** ⏳ **CARTA NO LOCALIZADA EN WORKSPACE — ESTRUCTURA PREPARADA, PENDIENTE DE VALIDACIÓN**

---

## ⚠️ ACLARACIÓN CRÍTICA — CUMPLIMIENTO DE REGLAS

> **La carta adjunta mencionada por el usuario NO fue encontrada en el repositorio ni en el workspace del sandbox.**

**Búsqueda exhaustiva realizada:**
- `find /home/user -type f` → solo `README.md`
- `find / -name "*.pdf" / "*.jpg" / "*.png" / "*.jpeg" / "*.webp" / "*.docx" / "*.xlsx"` → sin carta
- Revisión de `git log`, `gh api repos/.../contents`, issues y pulls → sin archivos
- Revisión de `/tmp/arena-workspace` y variables de entorno → vacío
- Búsqueda web de carta pública de La Vinícola → no hay PDF/carta pública indexada

**Decisión metodológica (para respetar tus reglas):**
- ❌ **NO se inventó ningún vino**
- ❌ **NO se inventó ninguna bodega, cepa, añada ni precio**
- ❌ **NO se usó IA para "completar" información**
- ✅ Se preparó **toda la estructura, schema y plantillas** para que en cuanto la carta sea re-subida se pueda extraer con fidelidad 100% y validar contigo.
- ✅ Se documenta **qué se espera encontrar** y **cómo se va a validar**, sin mezclar datos contextuales públicos con datos de la carta.

**Si acabas de adjuntar la carta en la interfaz de Arena y no aparece, por favor re-envíala como PDF o imágenes (JPG/PNG) en el próximo mensaje. En cuanto llegue, ejecuto OCR + lectura visual y completo este mismo documento con inventario real.**

---

## 1. CONTEXTO VERIFICADO (NO ES LA CARTA — SOLO CONTEXTO PÚBLICO)

Esta sección **NO reemplaza la carta**. Son datos públicos verificados para encuadrar la Demo Maestra. Ninguno de estos datos se usará como inventario de vinos.

| Dato | Valor verificado | Fuente |
|------|------------------|--------|
| **Nombre comercial** | La Vinícola Mendoza | Instagram bio + The Wine Time + Google Maps |
| **Ubicación** | Peatonal Sarmiento 110, Ciudad de Mendoza, Mendoza, Argentina | Google Maps + The Wine Time [4](https://thewinetime.com.ar/tres-lugares-en-mendoza-para-probar-vinos-fuera-de-bodegas/) |
| **Instagram** | @lavinicola_mdz — 915 seguidores, 48 seguidos, 100 posts. Bio: “Tienda de vinos 🍷⛰️ 📍Peatonal Sarmiento 110, Ciudad de Mendoza.” | Búsqueda web [1](https://www.instagram.com/lavinicola_mdz/) |
| **Creador / Enólogo asociado** | Alejandro Vigil (mencionado como creador) | The Wine Time [7](https://thewinetime.com.ar/tres-lugares-en-mendoza-para-probar-vinos-fuera-de-bodegas/) |
| **Propuesta** | Tienda de vinos con **más de 1.100 etiquetas**, productos gourmet y aceites de oliva de alta calidad. Enfoque en vinos mendocinos. Degustaciones. Terraza para degustar. | The Wine Time [7](https://thewinetime.com.ar/tres-lugares-en-mendoza-para-probar-vinos-fuera-de-bodegas/) |
| **Horario público** | Mar-Dom 8:30 a 22:00 (Tripadvisor y The Wine Time coinciden; Lunes también figura abierto según Tripadvisor) | Tripadvisor [2](https://www.tripadvisor.com/Attraction_Review-g312781-d28149881-Reviews-La_Vinicola-Mendoza_Province_of_Mendoza_Cuyo.html) y The Wine Time |
| **Beneficio mencionado en reseñas** | 20% descuento por compra de más de 6 botellas (surtidas) | Reseña citada en The Wine Time |
| **Tipo de establecimiento** | Vinoteca / Tienda de vinos (NO bodega), con venta por botella y por copa, destilados y cócteles según The Wine Time | The Wine Time |

> **Importante:** Que tenga 1.100 etiquetas en tienda NO significa que la carta tenga 1.100 vinos. La carta adjunta es la que define el inventario real para la demo. No asumimos nada.

---

## 2. METODOLOGÍA DE EXTRACCIÓN (CÓMO SE LEERÁ LA CARTA)

Cuando la carta sea re-subida, se aplicará este protocolo estricto:

### Paso 1 — Ingesta
- Aceptar PDF nativo (texto seleccionable) o PDF escaneado / JPG / PNG.
- Si es escaneado/imagen → OCR de alta resolución + lectura visual humana asistida.
- Preservar **paginación original**: `Página 1, 2, 3...` tal como aparece en el PDF.

### Paso 2 — Extracción literal
Para cada producto visible se extraerá:

```json
{
  "id": "VIN-001",
  "pagina_carta": 1,
  "categoria_carta": "texto literal del encabezado",
  "nombre_completo_visible": "texto exacto como aparece",
  "bodega": "solo si está explícita",
  "linea_etiqueta": "solo si está explícita",
  "cepa_varietal": "solo si está explícita",
  "anada": "solo si está visible (ej: 2022, 2023)",
  "presentacion": "750ml / 375ml / Copa / Botella — solo si está explícita",
  "precio": "valor numérico exacto + moneda visible ($ ARS)",
  "precio_texto_original": "$ 12.500",
  "descripcion": "texto exacto si existe",
  "estado_lectura": "OK | DUDOSO | ILEGIBLE",
  "notas_validacion": "ej: precio tapado por sombra, texto borroso"
}
```

### Paso 3 — Reglas de fidelidad
- Mantener **exactamente** mayúsculas, acentos y guiones como en la carta.
- No normalizar nombres (ej: “D.V. Catena” no se convierte en “DV Catena”).
- No inferir cepa por nombre (ej: “Malbec” solo si dice Malbec).
- Si un vino aparece 2 veces (ej: en promoción y en lista general) → se registra 2 veces y se marca como `POSIBLE_DUPLICADO` sin eliminar.
- Todo lo no legible → `estado_lectura: "ILEGIBLE"` + foto recorte.

### Paso 4 — Validación contigo
Se te entregará tabla + JSON para que marques ✅ / ❌ fila por fila antes de construir la app.

---

## 3. SCHEMA DE CAMPOS (DEFINICIÓN OFICIAL PARA LA DEMO)

### Campos solicitados y su disponibilidad futura

| Campo | Tipo | ¿Se extrae de la carta? | ¿Obligatorio en carta? | Estado actual |
|-------|------|--------------------------|------------------------|---------------|
| **nombre del vino** | string | Sí, literal | Sí | ⏳ Pendiente carta |
| **bodega** | string | Sí, si está explícita | No siempre está | ⏳ Pendiente |
| **línea / etiqueta** | string | Sí (ej: Reserva, Gran Enemigo, Altos) | A veces | ⏳ Pendiente |
| **cepa / varietal** | string | Sí, solo si está escrita | No siempre | ⏳ Pendiente |
| **añada** | integer/string | Sí, si figura (2021, 2022, NV) | Muchas cartas no la ponen | ⏳ Pendiente |
| **presentación** | string | Sí (Botella 750ml, Copa, etc.) | A veces | ⏳ Pendiente |
| **precio** | number + moneda | Sí, exacto | Sí | ⏳ Pendiente |
| **categoría** | string | Sí, del encabezado de sección | Sí | ⏳ Pendiente |
| **descripción** | string | Sí, si existe texto descriptivo | Ocasional | ⏳ Pendiente |
| **cualquier otro dato explícito** | string | Sí (ej: puntaje Parker, origen, % alcohol, maridaje) | Ocasional | ⏳ Pendiente |

**Campos que NO se inventarán aunque falten:** añada, cepa, bodega, precio, descripción.
Si falta → se deja `null` y se lista en "Campos faltantes".

---

## 4. INVENTARIO ESTRUCTURADO — ESTADO ACTUAL

### 4.1 Tabla vacía normalizada (plantilla lista para llenar)

> **0 productos pueden validarse sin la carta.** Esta tabla es la plantilla que se llenará fila por fila. Se deja con ejemplo ficticio TACHADO para mostrar formato, pero **no cuenta como inventario**.

| ID | Pág. | Categoría (literal) | Nombre completo visible | Bodega | Línea / Etiqueta | Cepa / Varietal | Añada | Presentación | Precio (texto original) | Precio (ARS) | Descripción | Estado lectura |
|----|------|---------------------|-------------------------|--------|------------------|-----------------|-------|--------------|-------------------------|--------------|-------------|----------------|
| *EJEMPLO-FORMATO-NO-REAL* | *1* | *Tintos* | *~~Ejemplo Malbec Reserva~~* | *~~Bodega Ejemplo~~* | *~~Reserva~~* | *~~Malbec~~* | *~~2022~~* | *~~750ml~~* | *~~$ 15.000~~* | *~~15000~~* | *~~Texto de ejemplo~~* | *EJEMPLO* |
| — | — | — | **(pendiente carta)** | — | — | — | — | — | — | — | — | — |

**Archivo JSON vacío preparado:** `data/inventario-carta.json` (ver sección 8)

### 4.2 Categorías detectadas

**En la carta real: ⏳ NO DETECTABLE SIN ARCHIVO**

Categorías **esperables** para una vinoteca mendocina de 1.100 etiquetas (NO se asumen como reales, solo como checklist para cuando se lea la carta):

- [ ] Tintos
- [ ] Blancos
- [ ] Rosados
- [ ] Espumantes / Sparkling
- [ ] Dulces / Cosecha Tardía
- [ ] Naranjos / Criollas (si aplica, tendencia en Mendoza)
- [ ] Vinos por Copa
- [ ] Degustaciones / Flights
- [ ] Destilados / Cócteles (mencionados en The Wine Time pero verificar si están en carta)
- [ ] Productos Gourmet / Aceites (si la carta los incluye)

> Cuando la carta llegue, aquí se listarán **solo las categorías con encabezado literal**. Ej: si dice “MALBECS” y “CABERNETS” separados, se respetan separados, no se agrupan.

---

## 5. RESUMEN EJECUTIVO (LOS 7 PUNTOS SOLICITADOS)

### 1️⃣ Cantidad total de vinos/productos detectados
- **Detectados en carta:** **0 (carta no localizada)**
- **Total verificable:** **Pendiente**
- **Nota:** No se puede estimar por “1100 etiquetas en tienda” — la carta puede ser una selección curada.

### 2️⃣ Categorías detectadas
- **En carta:** ⏳ **No disponible — pendiente de archivo**
- **Contexto público:** Vinoteca generalista mendocina; esperable foco en Tintos Malbec, pero sin carta no se categoriza.

### 3️⃣ Campos disponibles
- **En carta:** ⏳ **Pendiente**
- **Estructura preparada para capturar:** nombre, bodega, línea/etiqueta, cepa, añada, presentación, precio, categoría, descripción, datos extra explícitos, página, estado de lectura.

### 4️⃣ Campos faltantes
- **En carta:** ⏳ **Pendiente — se reportará por producto una vez leída**
- **Patrón habitual en cartas mendocinas (informativo, no predictivo):**
  - Muchas cartas NO incluyen añada impresa (se deja null, no se inventa)
  - Cepa a veces está solo en el nombre (si no está escrita, null)
  - Presentación a veces se asume 750ml sin escribirlo (se deja null si no está explícita)
  - Descripciones solo en cartas premium

### 5️⃣ Textos o precios dudosos/ilegibles
- **En carta:** ⏳ **Pendiente — se marcará con `DUDOSO` o `ILEGIBLE` + recorte de imagen**
- **Protocolo:** Si un precio está borroso (ej: `$ 1?.500`), se transcribe como `"$ 1?.500 [DUDOSO]"` y no se normaliza a número hasta tu validación.

### 6️⃣ Páginas de la carta donde aparecen los datos
- **En carta:** ⏳ **Pendiente — se numerará Pág. 1, 2, 3 según PDF/imagen original**
- **Estructura lista:** Cada fila del inventario llevará `pagina_carta`.

### 7️⃣ Inconsistencias encontradas
- **En carta:** ⏳ **Pendiente**
- **Inconsistencias PREVENTIVAS a vigilar (checklist):**
  - [ ] Mismo vino con dos precios diferentes en páginas distintas
  - [ ] Mismo vino listado en dos categorías (ej: Tintos y Por Copa)
  - [ ] Precios con y sin separador de miles (`12500` vs `12.500`)
  - [ ] Añadas mezcladas para mismo vino sin aclarar
  - [ ] Nombres con typos (ej: “Kaiken” vs “Kaikén”)
  - [ ] Productos sin precio o con “Consultar”
  - Todas se reportarán sin corregir, solo marcadas.

---

## 6. CAMPOS DISPONIBLES vs FALTANTES (DETALLE TÉCNICO)

Una vez leída la carta, este cuadro se llenará con porcentajes reales:

| Campo | % disponible (estimado a completar) | Acción si falta |
|-------|--------------------------------------|-----------------|
| nombre del vino | 100% esperado | — |
| bodega | ? | null + nota |
| línea/etiqueta | ? | null |
| cepa/varietal | ? | null (no inferir) |
| añada | ? | null |
| presentación | ? | null |
| precio | 100% esperado | si falta → `CONSULTAR` + flag |
| categoría | 100% esperado | — |
| descripción | ? | null |
| otros (puntajes, origen) | ? | null |

---

## 7. TEXTOS O PRECIOS DUDOSOS/ILEGIBLES — PROTOCOLO

Cada caso se documentará así (ejemplo de formato):

```markdown
- ID: VIN-042 | Pág. 3 | Nombre: "Luigi Bosca [...] Reserva" [ILEGIBLE: apellido tapado por doblez]
- ID: VIN-089 | Pág. 5 | Precio: "$ 18.?00" [DUDOSO: último dígito borroso, sombra]
```

**Actual:** Sin casos porque no hay carta. El registro quedará vacío hasta la lectura.

---

## 8. ARCHIVOS ENTREGADOS EN ESTE REPOSITORIO

```
docs/
  ANALISIS-CARTA-VINICOLA-MENDOZA.md  ← este informe (fuente de verdad)
data/
  inventario-carta.json               ← inventario normalizado (vacío, listo)
  schema-carta.json                   ← JSON Schema para validación
  raw/                                ← carpeta donde se guardará el PDF/imagen original sin modificar
```

### `data/inventario-carta.json` (vacío validable)
```json
{
  "metadata": {
    "establecimiento": "La Vinícola Mendoza",
    "direccion": "Peatonal Sarmiento 110, Ciudad de Mendoza",
    "instagram": "https://www.instagram.com/lavinicola_mdz",
    "google_maps": "https://maps.app.goo.gl/ZWBNoPtNnWTM5qQu8",
    "fecha_analisis": "2026-09-24",
    "estado": "PENDIENTE_CARTA_NO_LOCALIZADA",
    "total_productos": 0,
    "total_paginas": 0,
    "reglas": "No inventar vinos/bodegas/cepas/precios/añadas. Mantener nombres y precios literales."
  },
  "categorias_detectadas": [],
  "productos": [],
  "campos_disponibles": ["nombre", "bodega", "linea_etiqueta", "cepa_varietal", "anada", "presentacion", "precio", "categoria", "descripcion", "otros_datos_explicitos", "pagina_carta", "estado_lectura"],
  "campos_faltantes_por_producto": [],
  "dudosos_ilegibles": [],
  "inconsistencias": [],
  "paginas": []
}
```

### `data/schema-carta.json` — ver archivo dedicado

---

## 9. PRÓXIMOS PASOS — QUÉ NECESITO DE VOS

1. **Re-subí la carta** en este chat como:
   - PDF (ideal, si es texto seleccionable mejor)
   - o fotos nítidas página por página (JPG/PNG, buena luz, sin flash, que se lea el precio)
2. En cuanto llegue, en **el mismo turno**:
   - Guardo el original intacto en `data/raw/`
   - Ejecuto lectura + OCR + validación visual
   - Completo `inventario-carta.json` con **todos** los vinos literales
   - Actualizo este `ANALISIS-CARTA...md` con las 7 secciones con datos reales
   - Te presento tabla + JSON para tu validación ✅/❌ antes de diseñar nada
3. **Recién después de tu OK** avanzamos a interfaz, traducción, monedas, sommelier, packs (como pediste).

---

## 10. COMPROMISO BLACKXPROYECT

- No se diseñará interfaz hasta validar inventario.
- No se traducirá, no se convertirá moneda, no se agregará sommelier ni packs.
- La carta será tratada como **fuente de verdad inmutable**: si hay un error de tipeo en la carta, se replica y se marca, no se corrige silenciosamente.

---

**Preparado por:** Agent Mode Arena — Demo Maestra BlackXProyect  
**Para:** La Vinícola Mendoza — Validación de Carta  
**Estado:** Estructura 100% lista | Inventario real pendiente de archivo
