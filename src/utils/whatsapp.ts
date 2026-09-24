import { getCommercialConfig } from "../config";

/**
 * FASE 9 — Helpers puros de conversión por WhatsApp.
 *
 * PRINCIPIO: la web NO finge que envió nada. Estos helpers solo
 * CONSTRUYEN texto + URL; quien envía el mensaje es el usuario, en WhatsApp.
 * Nunca afirmar "pedido enviado / solicitud enviada / cuenta solicitada".
 *
 * Seguridad:
 *  - La URL se construye ÚNICAMENTE desde `https://wa.me/` con un teléfono
 *    que ya pasó por `normalizeWhatsAppPhone` (solo dígitos) → sin URL injection.
 *  - El mensaje SIEMPRE pasa por `encodeURIComponent` (nunca concatenado crudo).
 *  - Nada de esto interpreta HTML en ningún punto: los datos del
 *    catálogo (nombres, bodegas) se tratan solo como texto.
 *
 * Performance (B38): funciones puras, sin efectos globales, sin listeners,
 * sin índices nuevos. Se invocan SOLO en el handler del CTA (nunca por render).
 */

/** Firma mínima de la función de traducción (compatibilidad con useTranslation). */
export type TFn = (path: string, params?: Record<string, string | number>) => string;

/** Límites E.164 razonables: mínimo 8 (números locales cortos), máximo 15. */
const PHONE_MIN_DIGITS = 8;
const PHONE_MAX_DIGITS = 15;
/** Corte temprano de inputs patológicos antes de cualquier regex. */
const PHONE_MAX_RAW_LENGTH = 40;

/**
 * Normaliza un teléfono a dígitos puros para `wa.me`.
 * Acepta `+`, espacios, paréntesis, guiones y puntos; elimina todo eso y
 * exige solo dígitos finales (sin cero inicial), 8–15 dígitos.
 *
 * Ejemplo: "+54 9 261 123-4567" → "5492611234567".
 * Inválidos ("abc", "123", "<script>", "") → `null`. Nunca lanza excepción.
 */
export function normalizeWhatsAppPhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > PHONE_MAX_RAW_LENGTH) return null;
  const digits = trimmed.replace(/[\s+().\-]/g, "");
  // E.164: el primer dígito no puede ser 0; máximo 15 dígitos.
  const pattern = new RegExp(`^[1-9]\\d{${PHONE_MIN_DIGITS - 1},${PHONE_MAX_DIGITS - 1}}$`);
  return pattern.test(digits) ? digits : null;
}

/**
 * Teléfono del negocio ya normalizado, o `null` si no hay WhatsApp configurado
 * (estado por defecto hasta que La Vinícola confirme su número oficial).
 * Los CTA comerciales se muestran SOLO si esto devuelve un string.
 */
export function resolveBusinessWhatsAppPhone(): string | null {
  return normalizeWhatsAppPhone(getCommercialConfig().whatsappPhone);
}

/**
 * Construye la URL de WhatsApp con el mensaje SIEMPRE encoded.
 * Con teléfono → `https://wa.me/{phone}?text=...`
 * Con `null` → `https://wa.me/?text=...` (compartir: el usuario elige contacto;
 * es el comportamiento que WineSheet ya tenía, ahora centralizado aquí).
 *
 * Devuelve `null` (nunca una URL rota) si el teléfono es inválido o el mensaje
 * queda vacío tras trim (B42: jamás `?text=` sin contenido significativo).
 * El prefijo es constante `https://wa.me/` — imposible producir javascript:/data:/file:.
 */
export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string | null {
  const text = message.trim();
  if (text.length === 0) return null;
  if (phone === null || phone === undefined) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  const normalized = normalizeWhatsAppPhone(phone);
  if (normalized === null) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

/**
 * Abre la URL en una pestaña nueva de forma segura (B33/B54).
 * Se usa un ancla real con `rel="noopener noreferrer"` en vez de
 * `window.open(..., "noopener")` porque con esa feature `window.open`
 * devuelve `null` incluso al tener éxito (no permite detectar bloqueo) y
 * el click de ancla dentro del handler es el patrón más confiable en
 * Safari/Chrome móviles. Debe llamarse solo desde un gesto del usuario.
 */
export function openWhatsAppExternal(url: string): void {
  if (!url.startsWith("https://wa.me/")) return;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Límite práctico del mensaje de selección (B13): se envían los primeros 20
 * vinos y una línea visible "+ N vinos más". NO limita Mi selección (la lista
 * de la UI sigue completa); solo evita mensajes enormes en WhatsApp.
 */
export const WHATSAPP_SELECTION_LIMIT = 20;

/** Línea de un vino ya resuelta desde el catálogo (texto plano, sin HTML). */
export type SelectionLine = { nombre: string; bodega: string; precio: string };

/**
 * Mensaje de consulta por Mi selección (B6/B7/B8/B13/B14).
 * Solo datos reales: nombre, bodega, precio individual formateado en la
 * moneda activa, moneda y cantidad. Sin total, sin descuentos, sin stock,
 * sin notas de cata, sin promesas de envío. Siempre "quisiera consultar…" —
 * la disponibilidad la confirma el negocio, no la web.
 */
export function buildSelectionMessage(opts: {
  t: TFn;
  wines: readonly SelectionLine[];
  currency: string;
  /** Modo de servicio activo: takeaway agrega "para llevar/regalar" (B8). */
  intent: "bar" | "takeaway";
}): string {
  const { t, wines, currency, intent } = opts;
  const introKey = intent === "takeaway" ? "whatsapp.selectionIntroTakeaway" : "whatsapp.selectionIntro";
  const lines: string[] = [t(introKey), ""];
  const visible = wines.slice(0, WHATSAPP_SELECTION_LIMIT);
  visible.forEach((w, i) => {
    lines.push(`${i + 1}. ${w.nombre} — ${w.bodega} — ${w.precio}`);
  });
  const rest = wines.length - visible.length;
  if (rest > 0) lines.push(t("whatsapp.moreWines", { count: rest }));
  lines.push("", t("whatsapp.currencyLine", { currency }), "", t("whatsapp.askAvailability"));
  return lines.join("\n");
}

/**
 * Texto para COMPARTIR la selección con terceros (B26/B27): misma lista,
 * pero intro social en vez de consulta al negocio. NUNCA incluye mesa,
 * teléfono ni datos de sesión.
 */
export function buildSelectionShareText(opts: { t: TFn; wines: readonly SelectionLine[] }): string {
  const { t, wines } = opts;
  const lines: string[] = [t("whatsapp.shareIntro"), ""];
  const visible = wines.slice(0, WHATSAPP_SELECTION_LIMIT);
  visible.forEach((w, i) => {
    lines.push(`${i + 1}. ${w.nombre} — ${w.bodega} — ${w.precio}`);
  });
  const rest = wines.length - visible.length;
  if (rest > 0) lines.push(t("whatsapp.moreWines", { count: rest }));
  return lines.join("\n");
}

/** Intenciones de mesa (mismos valores que `TableAction` de Fase 5D). */
export type TableIntent = "another-cup" | "another-bottle" | "accompaniment" | "bill";

/**
 * Mensaje de una acción de mesa (B15–B19/B21): dos líneas, mesa incluida.
 * El `tableId` SIEMPRE proviene del valor ya validado por useTableContext —
 * esta función no vuelve a leer la URL. Consulta, nunca confirmación.
 * Devuelve `null` si el tableId está vacío (defensa en profundidad).
 */
export function buildTableActionMessage(opts: { t: TFn; tableId: string; action: TableIntent }): string | null {
  const { t, tableId, action } = opts;
  const id = tableId.trim();
  if (id.length === 0) return null;
  const actionKey =
    action === "another-cup"
      ? "whatsapp.anotherCup"
      : action === "another-bottle"
        ? "whatsapp.anotherBottle"
        : action === "accompaniment"
          ? "whatsapp.accompaniment"
          : "whatsapp.bill";
  return `${t("whatsapp.tableIntro", { table: id })}\n${t(actionKey)}`;
}
