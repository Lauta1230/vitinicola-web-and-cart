import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { allWines } from "../data/catalog";

/**
 * FASE 5B — "Mi selección": lista temporal de preselección editorial.
 *
 * NO es un carrito: sin cantidades, sin totales, sin checkout, sin envíos.
 * Solo IDs de vinos del catálogo, en orden de guardado, sin duplicados.
 *
 * Persistencia: NINGUNA (intencional). El estado vive solo durante la sesión
 * de la página y se reinicia al recargar — no hay identidad de usuario aún.
 *
 * El estado del panel (isOpen) vive aquí para que cambios de selección no
 * re-rendereen App ni el catálogo: solo re-renderizan los consumers pequeños.
 */

// ── Índices del catálogo (creados UNA vez a nivel módulo, nunca por render) ──
const CATALOG_IDS: ReadonlySet<string> = new Set(allWines.map((w) => w.id));

/**
 * Normaliza y valida un ID contra el catálogo.
 * ID desconocido/inválido → null (sin excepción, sin estado inválido).
 */
export function normalizeWineId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  if (id.length === 0) return null;
  if (!CATALOG_IDS.has(id)) return null;
  return id;
}

// ── Reducer puro (testeable sin DOM) ──

export type SelectionState = { ids: string[] };

export type SelectionAction =
  | { type: "add"; wineId: unknown }
  | { type: "remove"; wineId: unknown }
  | { type: "toggle"; wineId: unknown }
  | { type: "clear" };

export function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case "add": {
      const id = normalizeWineId(action.wineId);
      if (id === null || state.ids.includes(id)) return state; // idempotente
      return { ids: [...state.ids, id] };
    }
    case "remove": {
      const id = normalizeWineId(action.wineId);
      if (id === null) return state; // inexistente: no-op, sin excepción
      return { ids: state.ids.filter((x) => x !== id) };
    }
    case "toggle": {
      const id = normalizeWineId(action.wineId);
      if (id === null) return state;
      return state.ids.includes(id)
        ? { ids: state.ids.filter((x) => x !== id) }
        : { ids: [...state.ids, id] };
    }
    case "clear":
      return state.ids.length === 0 ? state : { ids: [] };
  }
}

// ── Contexto ──

export type SelectionContextValue = {
  /** IDs seleccionados, en orden de guardado. Serializable. */
  selectedIds: readonly string[];
  /** Cantidad de vinos distintos (no botellas). */
  selectedCount: number;
  isSelected: (wineId: string) => boolean;
  add: (wineId: string) => void;
  remove: (wineId: string) => void;
  toggle: (wineId: string) => void;
  clear: () => void;
  /** Estado del panel "Mi selección". */
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

/**
 * FASE 9 — `initialIds`/`initialOpen` opcionales (solo harness de QA/SSR y
 * futuros puntos de entrada): normalizan una vez al montar; duplicados e ids
 * inválidos se descartan. En la app real no se pasan → comportamiento idéntico.
 */
export function SelectionProvider({
  children,
  initialIds,
  initialOpen,
}: {
  children: React.ReactNode;
  initialIds?: readonly string[];
  initialOpen?: boolean;
}) {
  const [state, dispatch] = useReducer(selectionReducer, { ids: [] } as SelectionState, (init) => {
    if (!initialIds || initialIds.length === 0) return init;
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const raw of initialIds) {
      const id = normalizeWineId(raw);
      if (id !== null && !seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
    return { ids } as SelectionState;
  });
  const [isOpen, setIsOpen] = useState<boolean>(() => initialOpen === true);

  const selectedIds = state.ids;

  const isSelected = useCallback((wineId: string) => selectedIds.includes(wineId), [selectedIds]);

  const add = useCallback((wineId: string) => dispatch({ type: "add", wineId }), []);
  const remove = useCallback((wineId: string) => dispatch({ type: "remove", wineId }), []);
  const toggle = useCallback((wineId: string) => dispatch({ type: "toggle", wineId }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<SelectionContextValue>(
    () => ({
      selectedIds,
      selectedCount: selectedIds.length,
      isSelected,
      add,
      remove,
      toggle,
      clear,
      isOpen,
      open,
      close,
    }),
    [selectedIds, isSelected, add, remove, toggle, clear, isOpen, open, close]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection debe usarse dentro de <SelectionProvider>");
  return ctx;
}
