import { convertPrice, currencyMeta } from "../data/exchangeRates";
import type { Currency, RateType } from "../data/translations";

export function formatPrice(priceARS: number | null | undefined, currency: Currency, rateType: RateType): string {
  const converted = convertPrice(priceARS, currency, rateType);
  if (converted == null) return "Consultar";
  const meta = currencyMeta[currency];

  if (currency === "ARS") {
    // Formato carta: $ 52.800 (punto miles, sin decimales)
    return `$ ${converted.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
  }

  if (currency === "USD") {
    // U$S 34,32 -> usar locale en-US pero con coma como pide spec, o es-AR con 2 decimales
    // Spec dice U$S 34,32 (coma). Usaremos es-AR para coma, pero mantener símbolo U$S
    return `U$S ${converted.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (currency === "BRL") {
    // R$ 187,50 (pt-BR también usa coma)
    return `R$ ${converted.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${meta.symbol} ${converted.toLocaleString(meta.locale, { minimumFractionDigits: meta.decimals, maximumFractionDigits: meta.decimals })}`;
}

// Mantener compatibilidad con código que solo formateaba ARS
export function formatARS(priceARS: number | null | undefined): string {
  return formatPrice(priceARS, "ARS", "official");
}
