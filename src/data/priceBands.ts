/**
 * FASE 4 — Bandas de precio por ocasión
 *
 * IMPORTANTE: Los umbrales se basan SIEMPRE en precio ARS original (`wine.precio`).
 * La moneda (ARS/BRL/USD) y el tipo de cambio (Oficial/Blue) solo modifican cómo se visualiza
 * el precio (`formatPrice`), nunca la clasificación. Un vino "Para todos los días" sigue siéndolo
 * aunque el usuario vea el precio en USD.
 *
 * Umbrales definidos tras auditoría de 659 vinos visibles (docs/fase4-price-audit.md):
 * - Min $4.500, Max $665.000, Mediana $31.500, P75 $54.650, P85 $72.900, P90 $93.700
 * - Distribución: 56.9% bajo $35k, 29.4% $35k–$75k, 13.7% sobre $75k
 * - Justificación: cortes redondos, respetan P50–P85, balance comercial 57/29/14, editorial premium.
 */

export type OccasionKey = "everyday" | "gift" | "collection";
export type OccasionFilter = OccasionKey | "all";

export const priceBands: Record<OccasionKey, { min: number; max: number; label: string }> = {
  everyday: { min: 0, max: 35000, label: "Para todos los días" },
  gift: { min: 35001, max: 75000, label: "Para quedar bien / Regalo" },
  collection: { min: 75001, max: Infinity, label: "Alta Gama / Colección" },
} as const;

// Rango real del inventario (659 visibles)
export const MIN_PRICE = 4500;
export const MAX_PRICE = 665000;

// Helpers
export function getOccasionForPrice(priceARS: number | null | undefined): OccasionKey | null {
  if (priceARS == null) return null;
  if (priceARS <= priceBands.everyday.max) return "everyday";
  if (priceARS <= priceBands.gift.max) return "gift";
  return "collection";
}

export function isPriceInRange(priceARS: number | null | undefined, range: [number, number]): boolean {
  if (priceARS == null) return false;
  const [min, max] = range;
  return priceARS >= min && priceARS <= max;
}

export function isPriceInOccasion(priceARS: number | null | undefined, occasion: OccasionFilter): boolean {
  if (occasion === "all" || occasion == null) return true;
  const band = priceBands[occasion];
  if (!band) return true;
  if (priceARS == null) return false;
  return priceARS >= band.min && priceARS <= band.max;
}

// Validación: bandas no solapadas y cubren 100%
export function validateBands(): boolean {
  const { everyday, gift, collection } = priceBands;
  return (
    everyday.max + 1 === gift.min &&
    gift.max + 1 === collection.min &&
    everyday.min === 0 &&
    collection.max === Infinity
  );
}
