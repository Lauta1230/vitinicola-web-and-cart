import { useEffect, useMemo, useRef, useState } from "react";
import type { Wine } from "../data/catalog";
import { allWines } from "../data/catalog";
import { filterWines } from "../utils/search";
import { priceBands } from "../data/priceBands";
import type { FacetKey } from "../data/styleFacets";
import { useSelection } from "../context/SelectionContext";
import { useLocale } from "../context/LocaleContext";
import { formatPrice } from "../utils/formatPrice";
import { useTranslation } from "../hooks/useTranslation";

/**
 * FASE 6 — Gift Explorer: capa de descubrimiento para regalar.
 *
 * "Regalo" representa la INTENCIÓN del visitante, no un producto comercial:
 * sin packs, cajas, packaging, envío, descuentos ni promociones (no existen
 * datos confirmados del negocio). Solo catálogo real, bandas reales de Fase 4
 * y facets reales de Fase 3.
 *
 * - Filtros LOCALES (presupuesto + estilo); no tocan búsqueda/filtros globales.
 * - Presupuesto = bandas de priceBands (derivadas, sin duplicar valores),
 *   aplicadas mediante el parámetro `occasion` de filterWines.
 * - Resultados deterministas: orden estable del catálogo; 8 iniciales,
 *   "Ver más" pagina de a 12 (nunca los 659 de golpe).
 * - Agregar usa el SelectionContext existente (mismo contexto del trigger
 *   global); abrir vino usa el WineSheet único (sin GiftWineSheet).
 * - Se desmonta al cerrar o al cambiar a modo mesa: los filtros locales
 *   reinician (nada de estados de regalo engañosos).
 */

/** Acceso al explorer: solo en "Llevar / Regalar" (no compite con la mesa). */
export function isGiftExplorerAvailable(serviceMode: "bar" | "takeaway"): boolean {
  return serviceMode === "takeaway";
}

export type GiftBudget = "everyday" | "gift" | "collection";

/** Bandas DERIVADAS de priceBands (única fuente de verdad de los límites). */
export const GIFT_BUDGETS: ReadonlyArray<{ key: GiftBudget; min: number; max: number }> = [
  { key: "everyday", min: 0, max: priceBands.everyday.max },
  { key: "gift", min: priceBands.everyday.max + 1, max: priceBands.gift.max },
  { key: "collection", min: priceBands.gift.max + 1, max: Number.POSITIVE_INFINITY },
];

const INITIAL_RESULTS = 8;
const RESULTS_STEP = 12;
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

export function GiftExplorer({ onClose, onOpenWine }: Props) {
  const { t } = useTranslation();
  const { currency, rateType } = useLocale();
  const { selectedCount, isSelected, toggle } = useSelection();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollYRef = useRef<number>(0);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const [budget, setBudget] = useState<GiftBudget | "all">("all");
  const [style, setStyle] = useState<FacetKey>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS);

  // Cierre con animación de salida corta (patrón SelectionSheet).
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

  // ESC + lock de scroll con restauración exacta (patrón existente, sin scroll nuevo).
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
    // requestClose es estable por fase del render; ESC solo necesita cerrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resultados: SOLO lógica existente (facets cacheados + bandas reales).
  // Orden estable del catálogo → determinista (sin Math.random).
  const results = useMemo(
    () => filterWines(allWines, "", null, style, null, budget),
    [style, budget]
  );
  const shown = results.slice(0, visibleCount);

  const budgetLabel = (key: GiftBudget): string => {
    if (key === "everyday") return t("gifts.upTo", { amount: fmtARS(priceBands.everyday.max) });
    if (key === "gift")
      return t("gifts.midRange", {
        min: fmtARS(priceBands.everyday.max + 1),
        max: fmtARS(priceBands.gift.max),
      });
    return t("gifts.over", { amount: fmtARS(priceBands.gift.max + 1) });
  };

  const styleChips: ReadonlyArray<{ key: FacetKey; label: string }> = [
    { key: "all", label: t("gifts.styleAll") },
    { key: "malbec", label: t("filters.malbec") },
    { key: "cabernetSauvignon", label: t("filters.cabernet") },
    { key: "whiteOrRose", label: t("filters.whiteRose") },
    { key: "sparkling", label: t("filters.sparkling") },
    { key: "authorBoutique", label: t("filters.author") },
  ];

  return (
    <div
      className={`sel-overlay gift-overlay${closing ? " is-closing" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className="sel-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sel-handle" aria-hidden>
          <span />
        </div>

        <header className="sel-header">
          <div style={{ minWidth: 0 }}>
            <h2 id="gift-title" className="sel-title">
              {t("gifts.title")}
            </h2>
            <p className="sel-count">{t("gifts.subtitle")}</p>
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
            <div className="gift-label" id="gift-budget-label">
              {t("gifts.budget")}
            </div>
            <div className="gift-chips" role="group" aria-labelledby="gift-budget-label">
              {GIFT_BUDGETS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  className="gift-chip"
                  aria-pressed={budget === b.key}
                  onClick={() => {
                    setBudget((cur) => (cur === b.key ? "all" : b.key));
                    setVisibleCount(INITIAL_RESULTS);
                  }}
                >
                  {budgetLabel(b.key)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="gift-label" id="gift-style-label">
              {t("gifts.style")}
            </div>
            <div className="gift-chips" role="group" aria-labelledby="gift-style-label">
              {styleChips.map((sc) => (
                <button
                  key={sc.key}
                  type="button"
                  className="gift-chip"
                  aria-pressed={style === sc.key}
                  onClick={() => {
                    setStyle(sc.key);
                    setVisibleCount(INITIAL_RESULTS);
                  }}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="sel-empty">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="4" y="10" width="16" height="10" rx="1.5" />
              <path d="M12 10v10" />
              <path d="M4 10h16" />
              <path d="M12 10c-4.5 0-6-1.8-6-3.4C6 5.1 7.2 4 8.6 4 10.6 4 12 6.4 12 10Z" />
              <path d="M12 10c4.5 0 6-1.8 6-3.4C18 5.1 16.8 4 15.4 4 13.4 4 12 6.4 12 10Z" />
            </svg>
            <p className="sel-empty-title">{t("gifts.noResults")}</p>
            <p className="sel-empty-desc">{t("gifts.noResultsHint")}</p>
            <button
              type="button"
              className="sel-cta"
              onClick={() => {
                setBudget("all");
                setStyle("all");
                setVisibleCount(INITIAL_RESULTS);
              }}
            >
              {t("gifts.clear")}
            </button>
          </div>
        ) : (
          <>
            <div className="gift-results-head">
              <span className="gift-label">{t("gifts.results", { count: results.length })}</span>
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
                      aria-label={t("gifts.openAria", {
                        nombre,
                        nome: nombre,
                        name: nombre,
                      })}
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
