# Fase 5D — Barra de acciones contextuales de mesa

**Fecha:** 2026-09-24 · Base: `c6da8ea` (Fase 5C)

## Cuándo aparece

Únicamente `mesa válida (parser 5A) && serviceMode === "bar"`:

| URL | Modo | Barra |
|---|---|---|
| `/?mesa=4` | Tomar acá | visible |
| `/?mesa=12A` | Tomar acá | visible |
| `/` | — | ausente |
| `/?mesa=abc` / `4-5` / `Mesa4` / `<script>` | — | ausente (parser → null) |
| `/?mesa=4` | Llevar / Regalar | ausente |

**Montaje condicional desde App:** al pasar a "Llevar / Regalar" la barra se
desmonta → `activeAction` se descarta → al volver a "Tomar acá" reaparece
**limpia**, sin lógica de reset. El componente además re-verifica la condición
internamente (defensivo). Selección, filtros, búsqueda, idioma y moneda: ilesos.

## Modelo

```ts
type TableAction = "another-cup" | "another-bottle" | "accompaniment" | "bill";
activeAction: TableAction | null   // intención local del visitante
```

Helpers puros exportados y testeables: `isTableBarVisible()`,
`nextActiveAction()` (misma acción → null; distinta → reemplaza). La
exclusividad está garantizada por el tipo (un solo valor, no conjunto).
Mesa proveniente **exclusivamente** de `useTableContext()` — sin
`URLSearchParams` propios, sin copias, sin HTML interpretado.

## Intención, NO pedido

**Esta fase representa intención local de servicio. No existe todavía envío de
solicitudes.** Sin WhatsApp, sin APIs/backend/Supabase, sin "pedido enviado /
recibido / en camino", sin "el mozo fue notificado", sin pagos, sin datos
comerciales (precios de copas, disponibilidad, promociones). Feedback:
"Seleccionaste {acción}" (ES), "Você selecionou {action}" (PT), "You selected
{action}" (EN) — solo confirma la marcación, en `aria-live="polite"`.

## Acciones (exactamente cuatro)

Otra copa · Otra botella · Acompañamiento · Cuenta — iconografía SVG inline
monocromática 16px (copa, botella, plato, ticket; ✓ al seleccionar), sin
librerías. Selección no-dependiente-de-color: ✓ + peso + borde dorado + navy.

## Composición y coexistencia

- Barra fija inferior centrada, `max-width: 860px` desktop; en móvil fila con
  **scroll horizontal interno** (body nunca desborda) + fade lateral como
  indicación (solo ≤480px, vía `mask-image`).
- **`SelectionTrigger` intacto**: su slot se eleva (`.sel-fab-slot--raised`,
  solo cuando la barra existe) → ambos tocables, sin colisión, sin cambios a 5B.
- Safe area respetada (`env(safe-area-inset-bottom)` en barra y slot).
- z-index reutilizado (`--z-selection-trigger: 45`): Header (40) < barra/trigger
  (45) < WineSheet (70) < SelectionSheet (80). WineSheet abierta cubre la barra.
- Botones: ≥44px, `aria-pressed`, nav `aria-label="Acciones de mesa"`,
  focus-visible gold, teclado nativo (Tab/Enter/Space), sin trampa de foco.
- Motion: 150ms ease-out bajo `prefers-reduced-motion: no-preference`; sin
  saltos de layout (línea de estado de altura reservada).

## QA

- Tests lógicos: **25/25** — visibilidad (4/12A/null/takeaway), mesas inválidas
  ×5 (parser→null→ausente), toggle (set/unset/reemplazo ×2), exclusividad,
  desmontaje por cambio de modo, regresión 659/113 · 162/32/60/28/1 · 375/194/90.
- Typecheck real (check + app + node): 0 errores · `npm run build` OK.
- Preview: HTTP 200, bundle con las 14 strings verificadas en 3 idiomas.
- **Intactos verificados (`git diff`):** `SelectionContext/Sheet/Trigger`,
  `WineSheet`, `catalog.ts`, `search.ts`, `styleFacets.ts`, `priceBands.ts`,
  `useTableContext.ts`, `package.json`. Cero APIs de scroll agregadas.
- Interacciones independientes: acciones de mesa ↔ Mi selección ↔ ficha no se
  afectan entre sí; cambiar idioma actualiza labels manteniendo la acción
  activa (el tipo es agnóstico del idioma); moneda no tiene efecto alguno.

## Límites

Sin envío real (recién en fases futuras, con backend/WhatsApp explícitos), sin
estados de pedido, sin reglas comerciales por modo. Siguiente paso evaluado:
**5E — QA integral de Fase 5**.
