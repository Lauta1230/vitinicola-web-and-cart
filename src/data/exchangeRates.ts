import type { Currency, RateType } from "./translations";

// Valores de referencia para DEMO — no son cotizaciones en vivo.
// Base: ARS. Conversión se hace al renderizar: precioARS * rate
// Ejemplo spec: $ 52.800 ARS → U$S 34,32 (rate 0.00065) → R$ 187,50 (rate 0.00355)

export const exchangeRates: Record<RateType, Record<Exclude<Currency, "ARS">, number>> = {
  official: {
    USD: 0.00065,
    BRL: 0.00355,
  },
  blue: {
    USD: 0.00052,
    BRL: 0.0032,
  },
} as const;

export function convertPrice(priceARS: number | null | undefined, currency: Currency, rateType: RateType): number | null {
  if (priceARS == null) return null;
  if (currency === "ARS") return priceARS;
  const rate = exchangeRates[rateType][currency as Exclude<Currency, "ARS">];
  if (!rate) return null;
  return priceARS * rate;
}

export const currencyMeta: Record<Currency, { symbol: string; locale: string; decimals: number }> = {
  ARS: { symbol: "$", locale: "es-AR", decimals: 0 },
  USD: { symbol: "U$S", locale: "en-US", decimals: 2 },
  BRL: { symbol: "R$", locale: "pt-BR", decimals: 2 },
};
