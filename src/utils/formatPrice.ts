// Formatea precio ARS exactamente como validado: $ 52.800
export function formatARS(precio: number | null | undefined): string {
  if (precio == null) return "Consultar";
  // Usar punto como separador de miles, sin decimales
  return `$ ${precio.toLocaleString("es-AR")}`;
}

export function formatPriceCompact(precio: number | null | undefined): string {
  return formatARS(precio);
}
