# Fase 5A — Contexto Wine Bar + Mesa

**Fecha:** 2026-09-24 · Base: `da3ab7a` (recuperación de `a47d815`)

## Alcance

Solo contexto de servicio y contexto de mesa. La misma carta (659 vinos, 113
bodegas) sigue existiendo sin duplicación; cambia el contexto de interacción.
NO incluye: Mi selección, carrito, WhatsApp, acciones de mesa, packs, sommelier,
CMS, Supabase, Progressive Disclosure ni optimización de performance.

## Modelo de estado (`src/hooks/useTableContext.ts`)

- `serviceMode: "bar" | "takeaway"`
- `tableContext: { tableId: string | null }`

Defaults sin `?mesa=`: `takeaway` + `tableId = null`.
Con mesa válida: `bar` + `tableId` normalizado.
La mesa se lee **una sola vez** al montar; sin listeners globales.

## Formato de `?mesa=` (URL = input no confiable)

Trust boundary: `URL → sanitize → validate → normalize → state → UI`.

- trim → mayúsculas → longitud ≤ 8 → regex `^\d{1,3}[A-Z]?$`
- Válidos: `4`, `12`, `12A` · Inválidos: `abc`, `4-5`, `Mesa 4`, `<script>`, `1234567`
- Inválido/ausente → `tableId = null`, **sin excepción**, sin HTML insertado
  (sin `dangerouslySetInnerHTML` en todo el proyecto).

## Composición y dirección de arte

Jerarquía: identidad (Header) → búsqueda (SearchBar) → **contexto de uso**
(`ServiceModeSwitch`) → filtros/carta. Badge de mesa en el Header junto a la
marca (`LA VINÍCOLA · MESA 4`), metadata discreta, nunca título principal.
Identidad intacta: navy/gold/paper, serif editorial + sans, líneas finas,
pulgar deslizante con borde dorado y sombra sutil (sin glassmorphism fuerte).

## Estados y microinteracción

- Selector: default / hover / pressed / focus-visible / selected / disabled;
  botones reales con `aria-pressed`, ≥44px, labels ≤2 líneas (legibles en 320px).
- Selección NO solo cromática: posición del pulgar + peso tipográfico + `aria-pressed`.
- Transición 150ms ease-out, respetando `prefers-reduced-motion` (guardada en
  media query). Nunca se anima el catálogo.

## Cambiar de modo NO modifica

Filtros, búsqueda, idioma, moneda, tipo de cambio, ni scroll (sin
`scrollIntoView`, sin `window.scrollY`). El Locale popover queda intacto.

## Casos de aceptación verificados

| Caso | URL / acción | Resultado |
|---|---|---|
| A | `/` | Sin Mesa · modo `Llevar / Regalar` |
| B | `/?mesa=4` | `MESA 4` visible · modo `Tomar acá` |
| C | `/?mesa=12A` | `MESA 12A` visible |
| D | `/?mesa=abc` | Mesa ignorada, sin error, sin badge |
| E/F | Cambiar de modo | Estado cambia; filtros/scroll/locale intactos; misma carta |

Parser: 32/32 casos (unit). Regresión: 659/113, 162/32/60/28/1, 375/194/90 OK.
Typecheck real (check + app + node) y `npm run build` OK. Preview HTTP 200.
