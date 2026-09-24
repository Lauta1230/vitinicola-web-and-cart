import { useEffect, useMemo, useRef, useState } from "react";
import type { Wine } from "../data/catalog";
import { allWines } from "../data/catalog";
import { filterWines } from "../utils/search";
import { priceBands, isPriceInRange, isPriceInOccasion } from "../data/priceBands";
import type { OccasionFilter } from "../data/priceBands";
import type { FacetKey } from "../data/styleFacets";
import {
  isMalbec,
  isCabernetSauvignon,
  isWhiteOrRose,
  isSparkling,
  isAuthorBoutique,
} from "../data/styleFacets";
import { useSelection } from "../context/SelectionContext";
import { useLocale } from "../context/LocaleContext";
import { formatPrice } from "../utils/formatPrice";
import { useTranslation } from "../hooks/useTranslation";

/**
 * FASE 7 — Sommelier Digital: "buscador guiado de vinos".
 *
 * NO es un chatbot ni un sistema generativo: convierte selecciones EXPLÍCITAS
 * del visitante (ocasión · estilo · presupuesto, todos opcionales) en
 * coincidencias reales del catálogo, explicadas por los criterios elegidos.
 * Sin IA, sin Math.random, sin rankings externos, sin "mejor vino".
 *
 * - Motor: filterWines (facets F3 + ocasión F4) + isPriceInRange (bandas F4).
 *   El presupuesto se aplica como rango ARS base (derivado de priceBands,
 *   sin duplicar límites) para poder combinarse con la ocasión, que usa el
 *   parámetro occasion del motor.
 * - Scoring determinista y documentado: +1 por cada criterio ACTIVO que el
 *   vino cumple (máx 3). Como los resultados son coincidencias exactas, todos
 *   cumplen los criterios activos → empate → se conserva el orden estable del
 *   catálogo. La función existe para explicar la coincidencia y permitir
 *   futuras coincidencias parciales sin cambiar la arquitectura.
 * - Estado 100% local: cerrar el sheet no toca búsqueda, filtros, selección,
 *   moneda, idioma ni service mode. Funciona en AMBOS service modes.
 * - 6 resultados iniciales, "Ver más" suma 6. Nunca los 659.
 */

export type SommBudget = "everyday" | "gift" | "collection";

/** Bandas DERIVADAS de priceBands (misma fuente que Gift Explorer; se define
 *  localmente para no acoplar chunks lazy entre sí). */
export const SOMM_BUDGETS: ReadonlyArray<{ key: SommBudget; min: number; max: number }> = [
  { key: "everyday", min: 0, max: priceBands.everyday.max },
  { key: "gift", min: priceBands.everyday.max + 1, max: priceBands.gift.max },
  { key: "collection", min: priceBands.gift.max + 1, max: Number.POSITIVE_INFINITY },
];

export type SommelierCriteria = {
  occasion: OccasionFilter; // "all" = no elegido
  style: FacetKey; // "all" = no elegido
  budget: SommBudget | "all";
};

/** Predicados de facet existentes (F3): scoring O(1) por vino, sin reconstruir caches. */
const STYLE_PREDICATES: Readonly<Record<Exclude<FacetKey, "all">, (w: Wine) => boolean>> = {
  malbec: isMalbec,
  cabernetSauvignon: isCabernetSauvignon,
  whiteOrRose: isWhiteOrRose,
  sparkling: isSparkling,
  authorBoutique: isAuthorBoutique,
};

/**
 * Scoring explícito (Bloque 11): +1 estilo activo cumplido, +1 ocasión activa,
 * +1 presupuesto activo. Máximo 3. Sin rating/calidad/popularidad.
 */
export function matchScore(wine: Wine, c: SommelierCriteria): number {
  const styleP = c.style !== "all" ? STYLE_PREDICATES[c.style] : null;
  const band = c.budget !== "all" ? SOMM_BUDGETS.find((b) => b.key === c.budget) : undefined;
  return (
    (styleP && styleP(wine) ? 1 : 0) +
    (c.occasion !== "all" && isPriceInOccasion(wine.precio, c.occasion) ? 1 : 0) +
    (band && c.budget !== "all" && isPriceInRange(wine.precio, [band.min, band.max]) ? 1 : 0)
  );
}

/** Coincidencias: motor existente (estilo + ocasión) y presupuesto como rango. */
export function sommelierMatches(c: SommelierCriteria): Wine[] {
  const base = filterWines(allWines, "", null, c.style, null, c.occasion);
  if (c.budget === "all") return base;
  const band = SOMM_BUDGETS.find((b) => b.key === c.budget);
  if (!band) return base;
  return base.filter((w) => isPriceInRange(w.precio, [band.min, band.max]));
}

const INITIAL_RESULTS = 6;
const RESULTS_STEP = 6;
/** Duración de la animación de salida (ms); debe coincidir con el CSS. */
const EXIT_MS = 140;

function fmtARS(n: number): string {
  return `$ ${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

type Props = {
  onClose: () => void;
  /** Abre el vino con el WineSheet único de la app. */
  onOpenWine: (wine: Wine) => void;
};

export function SommelierExplorer({ onClose, onOpenWine }: Props) {
  const { t } = useTranslation();
  const { currency, rateType } = useLocale();
  const { selectedCount, isSelected, toggle } = useSelection();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollYRef = useRef<number>(0);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  // Estado local (Bloque 9): cerrar descarta; nada global se modifica.
  const [criteria, setCriteria] = useState<SommelierCriteria>({
    occasion: "all",
    style: "all",
    budget: "all",
  });
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS);

  const requestClose = () => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setClosing(false);
      onClose();
    }, EXIT_MS);
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    },
    []
  );

  // ESC + lock de scroll con restauración exacta (patrón existente).
  useEffect(() => {
    scrollYRef.current = window.scrollY;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      sheetRef.current?.focus({ preventScroll: true } as unknown as FocusOptions);
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      const y = scrollYRef.current;
      if (Math.abs(window.scrollY - y) > 2) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coincidencias + orden estable (score uniforme en coincidencias exactas).
  const results = useMemo(() => {
    const matches = sommelierMatches(criteria);
    return matches
      .map((wine, index) => ({ wine, score: matchScore(wine, criteria), index }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((x) => x.wine);
  }, [criteria]);
  const shown = results.slice(0, visibleCount);

  const toggleCriterion = (patch: Partial<SommelierCriteria>) => {
    setCriteria((cur) => ({ ...cur, ...patch }));
    setVisibleCount(INITIAL_RESULTS);
  };

  const resetAll = () => {
    setCriteria({ occasion: "all", style: "all", budget: "all" });
    setVisibleCount(INITIAL_RESULTS);
  };

  const occasionOptions: ReadonlyArray<{ key: OccasionFilter; label: string }> = [
    { key: "everyday", label: t("sommelier.occasionEveryday") },
    { key: "gift", label: t("sommelier.occasionGift") },
    { key: "collection", label: t("sommelier.occasionCollection") },
  ];
  const styleOptions: ReadonlyArray<{ key: FacetKey; label: string }> = [
    { key: "all", label: t("gifts.styleAll") },
    { key: "malbec", label: t("filters.malbec") },
    { key: "cabernetSauvignon", label: t("filters.cabernet") },
    { key: "whiteOrRose", label: t("filters.whiteRose") },
    { key: "sparkling", label: t("filters.sparkling") },
    { key: "authorBoutique", label: t("filters.author") },
  ];
  const budgetLabel = (key: SommBudget): string => {
    if (key === "everyday") return t("gifts.upTo", { amount: fmtARS(priceBands.everyday.max) });
    if (key === "gift")
      return t("gifts.midRange", {
        min: fmtARS(priceBands.everyday.max + 1),
        max: fmtARS(priceBands.gift.max),
      });
    return t("gifts.over", { amount: fmtARS(priceBands.gift.max + 1) });
  };

  // Explicación por fila: los criterios ACTIVOS elegidos (corresponden por
  // definición de coincidencia exacta). Sin frases sensoriales.
  const activeCriteriaLabels: string[] = [
    ...(criteria.occasion !== "all" ? [t("sommelier.criteriaOccasion")] : []),
    ...(criteria.style !== "all" ? [t("sommelier.criteriaStyle")] : []),
    ...(criteria.budget !== "all" ? [t("sommelier.criteriaBudget")] : []),
  ];
  const matchLine =
    activeCriteriaLabels.length > 0
      ? `${t("sommelier.matchBy")} ${activeCriteriaLabels.join(" + ")}`
      : null;

  // Criterios activos quitables en el empty state.
  const removable: ReadonlyArray<{ label: string; clear: Partial<SommelierCriteria> }> = [
    ...(criteria.occasion !== "all"
      ? [{ label: t("sommelier.criteriaOccasion"), clear: { occasion: "all" as const } }]
      : []),
    ...(criteria.style !== "all"
      ? [{ label: t("sommelier.criteriaStyle"), clear: { style: "all" as const } }]
      : []),
    ...(criteria.budget !== "all"
      ? [{ label: t("sommelier.criteriaBudget"), clear: { budget: "all" as const } }]
      : []),
  ];

  return (
    <div
      className={`sel-overlay somm-overlay${closing ? " is-closing" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className="sel-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="somm-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sel-handle" aria-hidden>
          <span />
        </div>

        <header className="sel-header">
          <div style={{ minWidth: 0 }}>
            <h2 id="somm-title" className="sel-title">
              {t("sommelier.title")}
            </h2>
            <p className="sel-count">{t("sommelier.subtitle")}</p>
            {selectedCount > 0 && (
              <p className="gift-selcount" aria-live="polite">
                {t("gifts.selection", { count: selectedCount })}
              </p>
            )}
          </div>
          <button type="button" className="sel-close" aria-label={t("settings.close")} onClick={requestClose}>
            ✕
          </button>
        </header>

        <div className="gift-filters">
          <div>
            <div className="gift-label" id="somm-occ-label">
              {t("sommelier.qOccasion")}
            </div>
            <div className="gift-chips" role="group" aria-labelledby="somm-occ-label">
              {occasionOptions.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className="gift-chip"
                  aria-pressed={criteria.occasion === o.key}
                  onClick={() =>
                    toggleCriterion({ occasion: criteria.occasion === o.key ? "all" : o.key })
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="gift-label" id="somm-style-label">
              {t("sommelier.qStyle")}
            </div>
            <div className="gift-chips" role="group" aria-labelledby="somm-style-label">
              {styleOptions.map((sc) => (
                <button
                  key={sc.key}
                  type="button"
                  className="gift-chip"
                  aria-pressed={criteria.style === sc.key}
                  onClick={() => toggleCriterion({ style: sc.key })}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="gift-label" id="somm-budget-label">
              {t("sommelier.qBudget")}
            </div>
            <div className="gift-chips" role="group" aria-labelledby="somm-budget-label">
              {SOMM_BUDGETS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  className="gift-chip"
                  aria-pressed={criteria.budget === b.key}
                  onClick={() =>
                    toggleCriterion({ budget: criteria.budget === b.key ? "all" : b.key })
                  }
                >
                  {budgetLabel(b.key)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="sel-empty">
            <p className="sel-empty-title">{t("sommelier.empty")}</p>
            <p className="sel-empty-desc">{t("sommelier.emptyHint")}</p>
            <div className="somm-removable" role="group" aria-label={t("sommelier.emptyHint")}>
              {removable.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  className="gift-chip"
                  onClick={() => toggleCriterion(r.clear)}
                >
                  ✕ {r.label}
                </button>
              ))}
            </div>
            <button type="button" className="sel-cta" onClick={resetAll}>
              {t("sommelier.reset")}
            </button>
          </div>
        ) : (
          <>
            <div className="gift-results-head">
              <span className="gift-label">{t("sommelier.matches", { count: results.length })}</span>
            </div>
            <ul className="gift-list">
              {shown.map((wine) => {
                const inSel = isSelected(wine.id);
                const hasAnada = wine.anada != null && String(wine.anada).trim() !== "";
                const nombre = wine.nombre_completo_visible;
                return (
                  <li key={wine.id} className="gift-row">
                    <button
                      type="button"
                      className="gift-open"
                      aria-label={t("gifts.openAria", { nombre, nome: nombre, name: nombre })}
                      onClick={() => onOpenWine(wine)}
                    >
                      <span className="sel-item-bodega">
                        {wine.bodega ?? wine.categoria_carta}
                        {hasAnada ? ` · ${String(wine.anada)}` : ""}
                      </span>
                      <span className="sel-item-name">{nombre}</span>
                      <span className="sel-item-price">
                        {formatPrice(wine.precio, currency, rateType)} <em>{currency}</em>
                      </span>
                      {matchLine && <span className="somm-matchline">{matchLine}</span>}
                    </button>
                    <button
                      type="button"
                      className="gift-add"
                      aria-pressed={inSel}
                      aria-label={
                        inSel
                          ? t("selection.removeAria", { nombre, nome: nombre, name: nombre })
                          : t("selection.addAria", { nombre, nome: nombre, name: nombre })
                      }
                      onClick={() => toggle(wine.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={inSel ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
                      </svg>
                      {inSel ? t("gifts.added") : t("gifts.add")}
                    </button>
                  </li>
                );
              })}
              {visibleCount < results.length && (
                <li className="gift-more">
                  <button type="button" className="gift-more-btn" onClick={() => setVisibleCount((v) => v + RESULTS_STEP)}>
                    {t("gifts.seeMore")}
                  </button>
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
