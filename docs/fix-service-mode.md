# FIX — Service Mode ("Tomar acá / Llevar / Regalar")

**Fecha:** 2026-09-24 · Base: `7c25cbe` (5.5)

## Auditoría (Bloque 1 — las 9 preguntas)

1. **Dónde vive `serviceMode`:** en `useTableContext()` (hook), instanciado en `AppInner`.
2. **Fuente única de verdad:** el estado del hook — **hallazgo:** `TableActionBar` instanciaba el hook por su cuenta (segunda copia de `serviceMode`/`tableId`). Consistente hoy solo gracias al montaje condicional de App.
3. **Qué recibe el switch:** `mode={serviceMode}` — prop real del estado.
4. **Callback:** `onChange={setServiceMode}` (estable, `useCallback([])`).
5. **¿Efectos que reimpongan el inicial?:** NINGUNO (grep exhaustivo; prohibición del Bloque 2 respetada desde 5A).
6. **¿`tableId` sobrescribe post-click?:** NO — la mesa solo participa en el inicializador lazy de `useState`.
7. **¿Es controlado?:** SÍ — cero estado interno de selección; `data-pos` y `aria-pressed` derivan de la prop.
8. **Click → setter correcto:** SÍ — verificado en el **bundle minificado servido**: `onClick:()=>t("bar")`, `"aria-pressed":e==="bar"`, `setServiceMode:useCallback(e=>{n(e)})`.
9. **Estilo según prop que cambia:** SÍ — CSS fuente **y** compilado contienen `.svc-thumb[data-pos=takeaway]{transform:translate(100%)}` y `.svc-btn[aria-pressed=true]`; llaves balanceadas.

## Verificación funcional (25 tests automatizados, componentes reales vía SSR)

- **Inicialización (11/11, formato nativo `location.search`):** `/`→takeaway/null; `?mesa=4|12|12A`→bar; `abc|4-5|Mesa4|1234|1234567`→takeaway/null sin excepción; `?mesa=4&x=1` y `?x=1&mesa=8c`→bar.
- **Switch controlado (8/8):** `bar`→`aria-pressed=[true,false]`+thumb izquierda; `takeaway`→`[false,true]`+thumb desplazado; exactamente una opción activa; mismo prop→mismo HTML (sin estado interno).
- **Barra (5/5):** `bar+mesa`→visible; `takeaway+mesa`→ausente; `bar` sin mesa→ausente; rapid-toggle ×5→estado final = último click.

**Resultado de la auditoría: NO existe defecto funcional en la cadena** (estado → switch → CSS → bundle servido, todo verificado). El síntoma reportado es consistente con una pestaña con bundle desactualizado en memoria (el preview se cayó y fue reiniciado en la sesión anterior). Nota de robustez hallada en el camino: `readMesaParam` espera el formato nativo de `location.search` (`"?..."`, sin path) — correcto en producción.

## Corrección quirúrgica aplicada (hardening de fuente única)

Eliminada la única divergencia estructural posible de esta clase de bug:

- `TableActionBar` ahora recibe `tableId`/`serviceMode` **por props desde App** (la misma instancia de estado que maneja el switch) en lugar de instanciar `useTableContext()` por su cuenta.
- Antes: segunda copia de `serviceMode` dentro de la barra, coherente solo por accidente del montaje condicional. Después: **una única fuente de verdad**; la visibilidad no puede divergir del selector ni tras futuros refactors.
- Comportamiento visible: sin cambios (verificado por tests + build).

**Archivos modificados:** `src/components/TableActionBar.tsx` (+14/−6), `src/App.tsx` (+3/−1). **Intactos:** `useTableContext.ts`, `ServiceModeSwitch.tsx`, catálogo, filtros, selección, WineSheet, traducciones, CSS.

## Regresión y build

- Suite completa: inicialización 11/11 + switch/barra 5/5 post-fix + regresión 11/11 (659 · 113 · 162/32/60/28/1 · 375/194/90 · búsqueda indexada · reducer · barra) — **0 fallos**.
- Typecheck real (check + app + node): 0 errores. `npm run build` OK: inicial 550.58 kB (gzip 109.45) + WineSheet 9.28 + SelectionSheet 3.60 diferidos.
- Preview: `/`, `/?mesa=4`, `/?mesa=12A`, `/?mesa=abc` → HTTP 200; bundle servido = build final (`index-DEEEjgA8.js`), barra por props verificada en el minificado.

## Para QA manual

Si el síntoma persistiera en un navegador: **recargar forzando cache (Ctrl+Shift+R)** o abrir pestaña nueva — un tab antiguo en memoria puede seguir ejecutando un bundle previo. El flujo esperado: `/` → click "Tomar acá" (thumb se desplaza, aria-pressed cambia, barra NO aparece sin mesa) ↔ "Llevar / Regalar"; `/?mesa=4` → barra aparece/desaparece con el modo y reaparece limpia.
