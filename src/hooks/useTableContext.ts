import { useCallback, useState } from "react";

/**
 * FASE 5A — Contexto de servicio + mesa
 *
 * Modelo de estado:
 *  - serviceMode: "bar" | "takeaway"  → cómo el cliente disfruta la carta
 *  - tableContext.tableId: string | null → mesa normalizada (o ausente)
 *
 * Defaults (sin ?mesa=):
 *  - serviceMode = "takeaway"  (Llevar / Regalar)
 *  - tableContext.tableId = null
 *
 * Con ?mesa= válida:
 *  - serviceMode = "bar"  (Tomar acá)
 *  - tableContext.tableId = valor normalizado (ej: "4", "12A")
 *
 * Trust boundary: URL → sanitize → validate → normalize → state → UI.
 * La URL es input NO CONFIABLE: nunca lanza excepción y nunca se interpreta.
 * La mesa se lee UNA sola vez al montar (sin listeners globales ni watchers).
 */

/** Modo de servicio: consumir en el Wine Bar ("bar") o llevar / regalar ("takeaway"). */
export type ServiceMode = "bar" | "takeaway";

/** Contexto de mesa mínimo. null = sin mesa (modo exploración / tienda). */
export type TableContext = { tableId: string | null };

/**
 * Formato aceptado: 1–3 dígitos, opcionalmente seguidos de UNA letra.
 * Válidos: "4", "12", "12A". Inválidos: "abc", "4-5", "Mesa 4", "<script>", "1234567".
 * (La entrada ya llega trimada y en mayúscula.)
 */
const MESA_PATTERN = /^\d{1,3}[A-Z]?$/;

/** Longitud máxima corta: corta inputs patológicos antes de validar. */
const MESA_MAX_RAW_LENGTH = 8;

/**
 * Sanitiza + valida + normaliza el valor crudo de ?mesa=.
 * Cualquier input no confiable que no calce el formato → null (sin excepción).
 */
export function sanitizeMesa(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toUpperCase();
  if (value.length === 0 || value.length > MESA_MAX_RAW_LENGTH) return null;
  if (!MESA_PATTERN.test(value)) return null;
  return value;
}

/**
 * Lee y normaliza ?mesa= desde un querystring.
 * Aislado del UI: única fuente de verdad del contexto de mesa inicial.
 */
export function readMesaParam(search: string): string | null {
  try {
    const raw = new URLSearchParams(search).get("mesa");
    return sanitizeMesa(raw);
  } catch {
    // Querystring malformado u entorno sin location: mesa ausente, sin error.
    return null;
  }
}

/**
 * Hook de contexto de servicio. La mesa se resuelve una vez al montar;
 * cambiar serviceMode NO toca filtros, búsqueda, idioma, moneda ni scroll.
 */
export function useTableContext(): {
  serviceMode: ServiceMode;
  tableContext: TableContext;
  setServiceMode: (mode: ServiceMode) => void;
} {
  const [tableContext] = useState<TableContext>(() => ({
    tableId: readMesaParam(window.location.search),
  }));

  // Con mesa válida el modo inicial es "bar" (Tomar acá); si no, "takeaway".
  const [serviceMode, setServiceModeState] = useState<ServiceMode>(() =>
    tableContext.tableId !== null ? "bar" : "takeaway"
  );

  const setServiceMode = useCallback((mode: ServiceMode) => {
    setServiceModeState(mode);
  }, []);

  return { serviceMode, tableContext, setServiceMode };
}
