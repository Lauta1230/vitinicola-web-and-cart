/**
 * FASE 9 — Capa de configuración comercial.
 *
 * Única fuente autorizada del contacto comercial de La Vinícola.
 *
 * REGLA CRÍTICA: NO existe un número de WhatsApp confirmado por el negocio.
 * `whatsappPhone` queda `undefined` (no se hardcodea ningún número inventado).
 * Cuando el negocio confirme su WhatsApp oficial, el valor se setea AQUÍ
 * (o desde un futuro CMS / otra fuente confirmada — ver `setCommercialConfig`).
 *
 * `deliveryEnabled` queda `undefined` hasta confirmación expresa del negocio:
 * mientras sea falsy, NINGÚN flujo de entrega/delivery/hotel puede mostrarse.
 *
 * Con `whatsappPhone` ausente o inválido:
 *  - los CTA comerciales de WhatsApp se OCULTAN (nunca un botón que falla),
 *  - el resto de la app (selección, mesa, gift, sommelier, flight) funciona igual.
 */

/** Configuración comercial activa. Campos opcionales = no confirmados. */
export type CommercialConfig = {
  /** Teléfono de WhatsApp del negocio en formato internacional. Sin confirmar → undefined. */
  whatsappPhone?: string;
  /** Entrega a domicilio/hotel. Sin confirmar → undefined (nunca mostrar flujos de envío). */
  deliveryEnabled?: boolean;
};

/**
 * Valores por defecto (deploy): sin número, sin delivery.
 * Este objeto es la configuración "de fábrica"; no mutarlo directamente.
 */
export const commercialConfig: Readonly<CommercialConfig> = {
  whatsappPhone: undefined,
  deliveryEnabled: undefined,
};

let configOverride: CommercialConfig | null = null;

/** Config efectiva: override (QA / futuro CMS) si existe, si no la de fábrica. */
export function getCommercialConfig(): CommercialConfig {
  return configOverride ?? commercialConfig;
}

/**
 * Setea un override de configuración (QA con número de prueba controlado o
 * futura inyección desde CMS). `null` vuelve a la config de fábrica.
 * No persiste: vive solo en la sesión actual (sin localStorage, Fase 9 B55).
 */
export function setCommercialConfig(cfg: CommercialConfig | null): void {
  configOverride = cfg;
}
