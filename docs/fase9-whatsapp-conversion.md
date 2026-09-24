# Fase 9 — Conversión: WhatsApp + acciones de mesa + Mi selección

**Fecha:** 2026-09-24 · Base: `d952f50` (Fase 8)

## Principio

La web **no finge que envió nada**: solo construye el mensaje, abre WhatsApp
mediante una URL segura y deja que el usuario revise/envíe ahí. Prohibido
"Pedido enviado / Solicitud enviada / Mozo notificado / Cuenta solicitada /
Compra realizada". El copy es siempre "Abrir / Continuar / Consultar por
WhatsApp". Transforma **selección → intención → consulta**, sin convertir la
web en un sistema de pedidos.

## Arquitectura

| Pieza | Archivo | Rol |
|---|---|---|
| Config comercial | `src/config.ts` (nuevo) | `CommercialConfig { whatsappPhone?, deliveryEnabled? }` — **ambos `undefined` por defecto**; `get/setCommercialConfig()` para QA (número de prueba controlado) y futuro CMS |
| Helpers puros | `src/utils/whatsapp.ts` (nuevo) | `normalizeWhatsAppPhone`, `buildWhatsAppUrl`, `buildSelectionMessage`, `buildSelectionShareText`, `buildTableActionMessage`, `openWhatsAppExternal`, `WHATSAPP_SELECTION_LIMIT = 20` |
| Mi selección | `SelectionSheet.tsx` | CTA "Consultar por WhatsApp" (solo con config) + "Compartir selección" (Web Share) / "Copiar selección" (fallback) |
| Mesa | `TableActionBar.tsx` | Con intención activa + config: "Continuar en WhatsApp" — F5D intacta sin config |
| WineSheet | `WineSheet.tsx` | Su share existente (`wa.me/?text=`) ahora usa el helper único — cero duplicación |

Auditoría previa (B1): no existía generador de URLs de negocio; el único
patrón era el share de WineSheet → se centralizó en un helper en vez de
crear otro. `business.phone` sigue `null` (display); la conversión lee solo
de `config.ts`.

## Seguridad

- **Teléfono**: `normalizeWhatsAppPhone()` — solo dígitos finales (8–15,
  E.164, sin 0 inicial), elimina `+ espacios ( ) - .`; inválidos → `null`;
  nunca lanza. `resolveBusinessWhatsAppPhone()` devuelve `null` sin config.
- **URL**: únicamente `https://wa.me/…` (constante) + `encodeURIComponent`
  del mensaje → imposible producir `javascript:`/`data:`/`file:` o URL
  injection. B42: mensaje vacío tras trim → `null` (jamás `?text=` vacío).
- **Apertura**: ancla real con `rel="noopener noreferrer"` (equivalente
  seguro de `window.open(...,"noopener")`, que devuelve `null` incluso con
  éxito; el click de ancla es el patrón más confiable en Safari/Chrome
  móviles — B54). Solo desde gesto del usuario.
- **Nada de HTML interpretado**: nombres/bodegas/mesa son solo texto; grep de
  `dangerouslySetInnerHTML/innerHTML/eval/new Function` limpio. Sin
  `Math.random`. Sin analytics, sin tracking, sin dependencias nuevas.

## Mensajes (solo datos reales)

- **Selección** (B6/7): intro localizada ("Hola, quisiera consultar por estos
  vinos…" — "para llevar/regalar" si el modo es takeaway) + líneas numeradas
  `nombre — bodega — precio individual` en la moneda activa (formato
  `formatPrice` existente, sin recálculo) + `Moneda: {código}` +
  "Quisiera saber disponibilidad y opciones.". **Sin total, sin descuentos,
  sin stock, sin notas de cata, sin envío.**
- **Límite (B13)**: primeros 20 vinos + línea visible "+ N vinos más" (sin
  truncamiento silencioso; Mi selección NO se limita).
- **Mesa** (B15–21): dos líneas — "Hola, estoy en la mesa {id}." + consulta
  (copa/botella/acompañamiento/cuenta). `tableId` del contexto validado de
  5A (nunca re-lee la URL); "12A" funciona; consulta, nunca confirmación.
- **Share (B26/27)**: intro social "Mi selección de vinos:" + lista; **sin
  mesa, sin teléfono, sin datos de sesión**. Web Share si existe; cancelar
  (`AbortError`) no es error; fallo → clipboard; clipboard falla → "No se
  pudo copiar" (nunca "Selección copiada" falsa — B28).

## Configuración: cómo habilitar WhatsApp

1. El negocio confirma su número oficial.
2. Se setea en `src/config.ts` → `commercialConfig.whatsappPhone`
   (o vía `setCommercialConfig()` desde un futuro CMS).
3. Los CTA aparecen solos: `SelectionSheet` ("Consultar por WhatsApp") y
   `TableActionBar` ("Continuar en WhatsApp" tras elegir intención).

**Si está ausente/inválido**: los CTA se OCULTAN (nunca un botón que falla —
B37); la app entera funciona igual (verificado B62 con SSR). Hoy, sin
confirmación del negocio, la demo vive en este estado.

## UX

- Sin estados falsos: abrir WhatsApp es la última acción; sin feedback
  posterior (B36 — el cambio de contexto basta). La intención de mesa NO se
  limpia al abrir (B55: al volver del navegador el estado permanece).
- Jerarquía (B44): catálogo → WineSheet → Mi selección → Consultar; mesa →
  intención → Continuar. Botones sobrios navy/gold, 44–48px, focus-visible,
  aria-labels claros, feedback `aria-live` solo para copiado.
- B25: "Otra botella" NO adjunta Mi selección (intenciones separadas; la
  integración futura no se implementó).

## Performance / Bundle

Helpers puros, sin listeners ni efectos; mensajes construidos **solo al
click** (B38). Sin chunk nuevo (B58): helpers pequeños en el bundle inicial.
Build: inicial **566.37 kB (gzip 113.77)** vs F8 561.51 (gzip 112.27) →
+4.86 kB (wiring + helper + 69 líneas de traducciones + CTA de mesa);
`SelectionSheet` 3.60 → 5.11 kB (capa de conversión dentro del chunk lazy);
CSS 21.06 → 22.74. Sin warnings nuevos. Split verificado en servido:
traducciones en inicial, claves de uso en sus chunks, helper sin duplicar,
**cero números en los assets**.

## QA

**93 verificaciones OK / 0 FAIL** (85 checks principales + 8 de
re-confirmación; los 2 fallos intermedios eran del harness: un render sin
`onExplore` y un comentario que citaba los identificadores prohibidos del
scan — reescrito).

- Teléfono: 17 casos (+54 9 261 123-4567 → `5492611234567`; `abc`/`123`/
  `<script>`/0-inicial/17 dígitos → `null`; nunca lanza).
- URL: prefijo exacto, decode roundtrip con `& ? + % á é í ó ú ç ñ < > "`,
  nombre de 300+ chars, compat `wa.me/?text=`, inyecciones → `null`.
- Selección: 1→1 línea, 3→3, 25→20 + "+ 5 vinos más"; sin
  total/descuento/envío/stock; intros bar/takeaway/PT/EN.
- Mesa: 4 acciones × {4, 12A} × 3 idiomas exactas; sin "enviado/notificado/
  recibido"; tableId vacío → null; sin mesa no hay barra (B22).
- SSR: sheet vacío (Explorar vinos, sin CTA), 3 y 8 vinos (CTA solo con
  config — B62), aria-labels, App completa `?mesa=4` (4 acciones, sin CTA
  sin config), `?mesa=12A`, `""` y `?mesa=abc` → takeaway sin barra.
- Regresión: **659 · 113 · 162/32/60/28/1 · 375/194/90 intactos**; flight F8
  spot (límite, orden, determinismo). Preview ×4 HTTP 200. Typecheck real ×3
  + build OK.

Nota: para SSR con vinos, `SelectionProvider` sumó props opcionales
`initialIds`/`initialOpen` (normalizan al montar; la app no las pasa →
comportamiento idéntico).

## Futuro (solo cuando el negocio lo confirme)

WhatsApp oficial (hoy oculto), delivery/hotel (`deliveryEnabled` sigue
`undefined` — ningún flujo de envío existe), packs, pedidos reales, pagos.
