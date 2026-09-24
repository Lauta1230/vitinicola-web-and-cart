# Fase 8 — Wine Flight Builder ("Armá tu trío")

**Fecha:** 2026-09-24 · Base: `3ffaca5` (Fase 7)

## Objetivo

Comparar hasta **3 vinos reales** del catálogo como experiencia de
descubrimiento. **NO es un producto comercial:** no se afirma que La Vinícola
venda flights/deglustaciones — sin precio del trío, sin total, sin descuento,
sin packaging, sin reserva, sin checkout/WhatsApp. "Trío" = lo que el
visitante arma, no una oferta de la casa. Copy: "Armá tu trío", "Compará hasta
3 vinos", "Trío completo · 3/3" (nunca "flight listo/pedido preparado").

## Diferencia respecto a las otras herramientas

- **Mi selección:** lista abierta de guardados (persistencia de la sesión).
- **Sommelier:** descubrimiento guiado por preferencias con scoring.
- **Gift Explorer:** presupuesto+estilo orientado a regalar.
- **Flight Builder:** comparación objetiva lado a lado de un trío efímero.

## Modelo (Bloques 6/7 — decisión documentada)

**Estado LOCAL `flightIds: string[]`** (máx 3, orden de agregado). Se eligió
local y no reutilizar SelectionContext porque restringir la selección global a
un subconjunto de 3 crea estados ambiguos (¿cuáles 3 de 8?). Con local: al
cerrar el trío se pierde, **Mi selección nunca se modifica** (Bloques 8/42/43
— con 8 guardados, el builder sigue manejando solo 3). Sin segundo store
global. Puente con lo explorado: candidatos **"Desde mi selección"** dentro
del builder (Bloques 9/32) + sugerencias deterministas + "Explorar vinos"
(navegación existente, diferida para restaurar overflow antes del scroll).

## Límite y contador

`addFlight()` idempotente con tope 3 (4º y duplicados = no-op, sin excepción).
Contador accesible "Trío · N/3" con `aria-live` + texto "N de 3 vinos
seleccionados". Al completar: "Trío completo · 3/3", nota `limitReached`, CTA
"Comparar trío" → vista comparativa (quitar uno reemplaza el flujo, simple).

## Comparación (solo datos reales)

Desktop: 3 columnas; móvil: **scroll horizontal interno** con scroll-snap
(nunca overflow del body). Filas: bodega, estilo (facets F3), ocasión (bandas
F4), **precio individual** en moneda actual, añada (si existe), Ficha de cata
(si `tasting` existe; si no → "Información de cata todavía no cargada"). Cada
columna abre el **WineSheet único** y tiene "Agregar" al SelectionContext
existente ("En mi selección" si ya está). **Total NO se muestra** (Bloque 28).

## "En tu trío" (diferencias explícitas)

Solo matemática real: `flightDifferences()` cuenta bodegas/estilos/ocasiones
únicos; se muestran chips solo si >1. Sin afinidad sensorial, sin "mejor
trío", sin score de calidad (Bloques 18/44). Misma bodega permitida (Bloque 17).

## Sugerencias (deterministas, Bloques 19/20/45)

`suggestNext()`: +1 estilo distinto a los del trío, +1 bodega distinta, +1
ocasión distinta; máx 3; empate → orden estable del catálogo; máx 6
candidatos. Microcopy "Podés sumar otro estilo" — nunca "te recomiendo porque
combina mejor". Verificado: sin `Math.random` en el código.

## Performance / Seguridad

Chunk lazy propio `WineFlightBuilder` (10.10 kB / gzip 2.77) — verificado
físicamente: componente SOLO en su chunk, trigger (traducción) en el inicial.
Inicial 557.40 → 561.51 kB (gzip 112.27, +4.1). Sin índices nuevos (helpers
O(1) por vino con predicados F3/F4 existentes), sin dependencias, sin
`dangerouslySetInnerHTML` (nombres del catálogo siempre como texto), sin APIs
de scroll nuevas. Token `--z-flight: 65` (misma capa que Gift/Sommelier).

## QA

- **30 PASS / 0 FAIL**: límite 0→3→4º rechazado · duplicados no-op · orden de
  agregado · remove inexistente no-op · sugerencias deterministas (mismo
  input → mismo output, máx 6, excluye trío, vacías con trío completo) ·
  diferencias = conteos reales · misma bodega permitida · 30 claves i18n ×3 ·
  SSR (título, 0/3, aria accesible, empty state, sin copy de venta) ·
  cata undefined (0 vinos con tasting inventado) · regresión 659/113 ·
  162/32/60/28/1 · 375/194/90.
- Typecheck real (check + app + node): 0 errores. Build OK. Sin warning nuevo.
- Preview: `/`, `/?mesa=4`, `/?mesa=12A`, `/?mesa=abc` → HTTP 200.
- Ambos service modes (trigger en la fila de descubrimiento); la mesa NO es
  criterio (Bloque 30).

## Futuro

Si el negocio confirma flights reales (copas incluidas, precio,
acompañamientos, disponibilidad), esta arquitectura evoluciona a producto
comercial incorporando esos datos como fuente estructurada — el comparador y
su selección local ya están preparados.
