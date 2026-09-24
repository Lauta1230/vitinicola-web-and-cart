# REDISEÑO LOCALE SETTINGS — POPOVER CONTEXTUAL

**Fecha:** 2026-09-24
**Componente:** src/components/LocaleSettingsSheet.tsx
**Referencia:** Demo 1 — El Asadito (selector idioma popover)

## Qué se modificó

- Antes: Bottom sheet fullscreen con position:fixed inset:0 width:100vw height:100dvh background:rgba(...) backdropFilter blur + body.overflow=hidden + scrollY save/restore. Ocupaba gran parte de la pantalla, oscurecía y bloqueaba scroll.
- Ahora: Popover contextual compacto anclado al botón del Header.

Cambios:
- Eliminado overlay fullscreen y bloqueo de scroll (body.overflow, scrollY, window.scrollTo).
- Mantenido createPortal(..., document.body) para evitar stacking context de Header.backdropFilter.
- Nuevo popover: position:fixed top: rect.bottom+8 left: rect.right-width width:min(92vw,320px) maxHeight:84dvh zIndex:100 background:paper-warm border:1px solid line borderRadius:16 shadow suave — sin overlay oscuro, sin inset:0.
- Estructura compacta 220-280px: IDIOMA (vertical con check), divider, MONEDA (3 cols), divider, CAMBIO (2 cols), nota sutil. Padding 12, gaps 12, tipografía editorial navy/gold/paper.
- Posicionamiento dinámico: mide button.getBoundingClientRect(), calcula width = min(92vw,320), left = clamp(8, rect.right-width, viewportW-width-8), top = rect.bottom+8 con flip arriba si top+popH > viewportH.
- Cierre: toggle botón, Esc, click fuera (mousedown/touchstart fuera de popover+botón). Selección de idioma/moneda/rate no cierra (permite configurar varias opciones).
- Scroll: no se altera body, popover flota sobre contenido, página sigue visible y scrolleable.
- Focus: focus({preventScroll:true}) en primer botón, sin mover viewport.
- Animación: opacity 0->1, translateY(-4px)->0 150ms ease, respeta prefers-reduced-motion: reduce.
- Accesibilidad: aria-expanded, aria-haspopup="dialog", role="dialog" aria-modal=false, aria-pressed en opciones, keyboard.

## Cómo se resolvió posicionamiento

- Anchor: buttonRef.getBoundingClientRect() en useLayoutEffect tras abrir.
- Horizontal: left = right - width alineado al borde derecho del botón, clamp 8 ↔ viewportW-width-8 para no salir por laterales.
- Vertical: top = bottom+8; si top+popH+8 > viewportH -> top = top - popH - gap (arriba), else max(8, viewportH-popH-8).
- Resize/scroll: listeners resize + scroll (pasivo) recalculan.
- Portal: createPortal(popover, document.body) garantiza fixed relativo a viewport, no a Header con backdrop-filter (containing block). Se mantiene fix previo.

## Portal mantenido

Sí. createPortal se mantiene, pero ahora solo renderiza popover contextual, no overlay fullscreen.

## CSS cambiado

- Eliminado: inset:0, 100vw/dvh overlay, background:rgba(...) fullscreen, alignItems:flex-end, body.overflow.
- Añadido: position:fixed contextual, width:min(92vw,320px), maxHeight:84dvh, boxShadow suave, borderRadius:16, transition 150ms, prefers-reduced-motion.
- Tokens z-index ya existentes --z-locale-overlay:100 usados para popover (100).

## Validación

- npm run check -> 0
- npm run build -> 37 módulos 535kB gz104kB
- Responsive 320/375/390/430: width 294 (320*0.92) a 320, left clamp 8, no desborde, no corte, no tapa Header, altura ~272 dentro 220-280.
- Funcional: abrir -> cambiar ES/PT/EN -> cambiar ARS/BRL/USD -> cambiar Oficial/Blue -> click fuera -> ESC -> reabrir -> scroll -> WineSheet -> vuelve -> filtros QuickFilters (162/32/60/28) + búsqueda + WineryExplorer + 659/113 intactos, sin reset facet/query/bodega, sin salto vertical, sin overlay.

