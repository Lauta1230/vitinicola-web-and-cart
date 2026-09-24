# Fase 5B — "Mi selección": estado + panel contextual

**Fecha:** 2026-09-24 · Base: `c9f6a08` (Fase 5A)

## Alcance

Infraestructura completa de "Mi selección" **sin conectar cada vino individual**
(eso es exclusividad de Fase 5C). NO es carrito: sin cantidades, sin subtotal,
sin checkout, sin stock, sin descuentos, sin WhatsApp, sin envíos automáticos.

## Arquitectura

```
src/context/SelectionContext.tsx   → provider + reducer puro + hook useSelection()
src/components/SelectionSheet.tsx  → panel contextual (patrón WineSheet)
src/components/SelectionTrigger.tsx→ contador/trigger (agnóstico de posición)
```

- Patrón de contexto global reutilizado (mismo enfoque que `LocaleContext`).
- **Cero dependencias nuevas**; `package.json` intacto.
- Reducer **puro y exportado** (`selectionReducer`) para QA sin DOM.
- Índices a nivel módulo (creados una vez): `CATALOG_IDS` (validación) y
  `WINE_BY_ID` (derivación id→vino en el sheet, memoizada).

## Estado y API

- Modelo: `SelectionState = { ids: string[] }` — array serializable, orden de
  guardado, sin duplicados, solo IDs existentes en el catálogo.
- API: `selectedIds, selectedCount, isSelected, add, remove, toggle, clear`
  + `isOpen/open/close` (estado del panel vive en el provider para que los
  toggles **nunca** re-rendereen App ni el catálogo de 659 vinos; los consumers
  son hojas pequeñas).
- `add` idempotente · `remove` inexistente = no-op · IDs inválidos/desconocidos
  (`""`, `VIN-999999`, tipos no-string) se ignoran en silencio, sin excepción.
- **Persistencia: ninguna** (intencional): sin localStorage/sessionStorage/
  cookies/backend. Se reinicia al recargar — no hay identidad de usuario.

## Panel (SelectionSheet)

- Misma estética que WineSheet: papel warm, navy/gold, radios, sombras,
  overlay blur, bottom-sheet 640px máx, `max-height: 86dvh`.
- Header: título accesible + `N vinos guardados` (singular/plural) + X 44px.
- Toolbar con `Vaciar selección` (solo con items). Lista con scroll interno y
  body bloqueado detrás (patrón exacto de WineSheet: lock + restauración).
- Ítem: bodega (eyebrow) + nombre (clamp 2 líneas) + precio en moneda actual
  (`formatPrice`/`useLocale`, mismo sistema) + `Quitar` con aria explícito
  ("Quitar {nombre} de mi selección"). Sin ficha técnica repetida.
- Empty state editorial: título, descripción y CTA `Explorar vinos` que cierra
  el panel y navega con la lógica existente de App (defierido ~120ms para que
  el sheet restaure el overflow antes del scroll suave). Sin `scrollIntoView`.
- Cierre: X, ESC, click fuera. Salida animada 140ms; entrada 200/180ms;
  contador con micro-pop. Todo guardado bajo `prefers-reduced-motion`.
- `role="dialog"` + `aria-modal` + `aria-labelledby` + foco inicial
  `preventScroll` + focus-visible gold + targets ≥44px.

## Trigger

`SelectionTrigger` (slot flotante `.sel-fab-slot` en App, posición decidida por
el contenedor): pill paper/gold con "Mi selección · N"; N compacto (`99+` para
grandes); debajo de 350px solo icono + contador; `aria-label` completo.

## Límites actuales / qué queda para 5C

- **Ningún vino es agregable desde la UI todavía** (WineSheet NO fue modificado,
  verificado con `git diff`): sin botón "Agregar a mi selección" en ficha ni card.
- El trigger abre el panel; con 0 items muestra el empty state.
- 5C: conectar WineSheet/WineCard (add/toggle/estado visual), y recién entonces
  evaluar persistencia y acciones de mesa/WhatsApp.

## QA

- Reducer: **18/18 casos** (inicial, add, duplicado, toggle×2, remove,
  remove-inexistente, clear, inválidos: vacío/espacios/desconocido/null/número/
  objeto, clear estable, normalize) usando IDs reales del catálogo.
- Regresión catálogo: 659 vinos · 113 bodegas · 162/32/60/28/1 · 375/194/90 ✅
  (ejecutado contra el código real, no contra copias).
- Typecheck real: `check` + `tsconfig.app` + `tsconfig.node` — 0 errores.
- `npm run build` OK. Warning preexistente de chunk >500 kB se mantiene
  documentado (pendiente para Fase 5.5 de performance).
- Sin scroll regression: único uso de scroll API nuevo es la restauración de
  posición del lock (mismo patrón preexistente de WineSheet).
- Preview producción: HTTP 200; bundle servido con strings ES/PT/EN y CSS 5B.
- Selección independiente de mesa/service mode/idioma/moneda: la selección vive
  en su propio provider; cambiar idioma/moneda re-renderiza precios por
  `useLocale` pero **no** muta la selección; cambiar service mode (5A) no toca
  este estado.
