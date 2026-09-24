# Fase 5C — WineSheet → Agregar / quitar de "Mi selección"

**Fecha:** 2026-09-24 · Base: `8b4fdce` (Fase 5B)

## Punto de integración (auditoría previa → modificación quirúrgica)

`WineSheet` se modificó **solo** en: imports (2 líneas), hooks de feedback
antes del early return, handler + derivados después del early return, un
`<button>` como primera acción del grid existente (sobre el link WhatsApp) y
un icono local al final del archivo. El mecanismo de scroll-lock/restauración,
cierre, precio, acciones existentes y estética quedaron intactos (verificado
con `git diff`: cero referencias nuevas a `scrollIntoView/scrollTo/scrollY`).

## Consumo de contexto

- `const { isSelected, toggle } = useSelection()` — **sin estado paralelo**;
  la única fuente de verdad sigue siendo `SelectionContext`.
- ID usado: `wine.id` (el mismo del catálogo, ej. `VIN-001`), validado con
  `normalizeWineId` (export de 5B). ID inválido → botón `disabled`, sin estado
  inconsistente ni excepción.
- Deduplicación: responsabilidad exclusiva del reducer de 5B (idempotente);
  sin lógica paralela en WineSheet.
- **Sync en tiempo real (Bloque 8):** automática por contexto compartido — si
  el vino se quita desde `SelectionSheet`, el CTA re-renderiza a "Agregar".

## CTA

- No seleccionado: **"Agregar a mi selección"** — botón navy (primaria editorial).
- Seleccionado: **"Quitar de mi selección"** (`selection.removeCta`) — mismo
  botón con tratamiento secundario: icono bookmark relleno + texto cambiado +
  borde dorado + fondo paper-dark (no depende solo del color). `aria-pressed`.
- Feedback discreto local: "✓ Agregado a mi selección" / "Quitado de mi
  selección" por 1500ms (span `aria-live="polite"`, sin robar foco; timer con
  cleanup y reset al cambiar de ficha). Sin librerías de toast.
- Estados: default/hover/active/focus-visible/disabled/selected; 48px alto;
  label con ellipsis a 320px; transiciones 150ms ease-out bajo
  `prefers-reduced-motion: no-preference`.
- El foco permanece en el CTA tras el toggle (no hay remontaje). No abre
  SelectionSheet, no cierra WineSheet, no mueve scroll.

## Traducciones (solo claves nuevas ES/PT/EN)

`selection.add / addAria / added / removed / removeCta` (+ `removeAria` de 5B
reutilizada). Los aria-labels incluyen el nombre del vino: "Agregar Cabernet… a
mi selección". `selection.remove` corto queda para los ítems de SelectionSheet.
Verificado: 0 secciones con claves duplicadas internas; sección `selection`
idéntica en forma entre los 3 idiomas.

## Edge cases cubiertos

Nombre/bodega larga (clamps + ellipsis), sin imagen (no aplica, no hay),
ID desconocido (no-op + disabled), toggle repetido ×7/×8 (coherente),
cambio de idioma/moneda/service mode/mesa: la selección no se altera
(providers independientes; moneda solo re-renderiza precios).

## QA

- Integración lógica: 12/12 casos (inicial, agregar, +1 contador, repetir sin
  duplicar, quitar, −1, sync panel↔ficha, toggle ×7/×8, ID desconocido).
- Regresión catálogo: 659 · 113 · 162/32/60/28/1 · 375/194/90 ✅ (código real).
- Typecheck real (check + app + node): 0 errores · `npm run build` OK.
- Preview: HTTP 200; bundle con las 6 strings de CTA en 3 idiomas.
- Archivos intocados verificados: `SelectionContext/Sheet/Trigger`,
  `catalog.ts`, `search.ts`, `styleFacets.ts`, `priceBands.ts`,
  `useTableContext.ts`, `package.json`.

## Límites — fuera de 5C

**WhatsApp (el link existente de compartir sigue igual), acciones de mesa,
pedidos, cantidades, checkout y conversiones comerciales quedan fuera de 5C.**
La selección sigue siendo temporal, local a la sesión y sin operación comercial.
La siguiente fase evaluada será **5D — acciones contextuales de mesa**.
