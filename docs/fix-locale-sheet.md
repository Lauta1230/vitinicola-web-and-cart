# FIX CRÍTICO — LocaleSettingsSheet stacking context

**Fecha:** 2026-09-24
**Componente:** `src/components/LocaleSettingsSheet.tsx`
**Ancestro:** `src/components/Header.tsx` → `App.tsx` → `LocaleProvider`

## Causa raíz

`LocaleSettingsSheet` se renderizaba **dentro** de `Header`, cuyo estilo contiene:

```tsx
// Header.tsx:8-12
position: "sticky",
zIndex: 40,
background: "rgba(248, 245, 239, 0.96)",
backdropFilter: "blur(10px)",
```

`backdrop-filter` (y `filter`) **crea un nuevo containing block** para descendientes `position: fixed` según spec CSS (transform/perspective/filter/backdrop-filter/contain). El overlay del sheet (`position: fixed; inset: 0; zIndex: 65`) quedaba **atrapado** por el Header: se posicionaba relativo al Header (alto 52px), no al viewport, apareciendo recortado/detrás y con `zIndex 65` por debajo de WineSheet (70) pero dentro del stacking del Header. En mobile 320px el contenido quedaba fuera del viewport y no era tocable.

Otros ancestros auditados: `App` (`position: relative; zIndex:1`), `Hero` (`overflow:hidden`, `backdropFilter` pero no ancestro), `body` (`overflow-x:hidden`). Ninguno más creaba containing block salvo Header.

## Solución

**Portal a `document.body`:**

```tsx
import { createPortal } from "react-dom";
{open && typeof document !== "undefined" ? createPortal(overlay, document.body) : null}
```

- Overlay: `position: fixed; inset: 0; width: 100vw; height: 100dvh; zIndex: 100; background: rgba(...); backdropFilter: blur(6px); display:flex; alignItems:flex-end; justifyContent:center; padding:12`
- Sheet: `width:100%; maxWidth:520; maxHeight:84dvh; zIndex:101; overflow:hidden; flex column`
- Escala `z-index` centralizada en `tokens.css`: `--z-header:40 --z-winery:60 --z-wine:70 --z-locale-overlay:100 --z-locale-content:101`
- No se duplica componente, única instancia lógica. Trigger queda en Header, overlay en body.

**Scroll & Focus:**
- Guarda `previousScrollY = window.scrollY`, compensa scrollbar `paddingRight`, `body.overflow=hidden`, `focus({preventScroll:true})`, al cerrar restaura `window.scrollTo({top: previousScrollY, behavior:"instant"})` sin `position:fixed` en body.
- Cierre: `Esc`, `backdrop tap`, botón `✕`/`Guardar`. Selección de idioma/moneda/rate no cierra (permite configurar varias opciones).

**Mobile 320-430:** `width:100% maxWidth:520` → en 320 ocupa 296px centrado, `grid 3 cols` 82px cada botón, todo tocable, `overflow:auto` interno con `84dvh`.

## Validación

- `grep position:fixed` → Locale 100, Wine 70, Winery 60 — correcto orden
- `grep createPortal` → presente
- `grep scrollIntoView` → 0
- `npm run check` → 0, `npm run build` → 37 módulos 535kB gz103.94kB
- Funcional: abrir → cambiar ES/PT/EN → cambiar ARS/BRL/USD → cambiar Oficial/Blue → cerrar → scroll → abrir WineSheet → cerrar → reabrir Locale → siempre visible sobre Header/Hero/catálogo, no recortado, body no scrollea detrás, posición restaurada, idioma/moneda ortogonales.

