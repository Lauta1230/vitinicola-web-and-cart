import { useEffect, useMemo, useRef, useState } from "react";
import type { Wine } from "../data/catalog";
import { allWines } from "../data/catalog";
import {
  isMalbec,
  isCabernetSauvignon,
  isWhiteOrRose,
  isSparkling,
  isAuthorBoutique,
} from "../data/styleFacets";
import { isPriceInOccasion } from "../data/priceBands";
import type { OccasionFilter } from "../data/priceBands";
import { useSelection } from "../context/SelectionContext";
import { useLocale } from "../context/LocaleContext";
import { formatPrice } from "../utils/formatPrice";
import { useTranslation } from "../hooks/useTranslation";

/**
 * FASE 8 — "Armá tu trío": comparador de hasta 3 vinos reales del catálogo.
 *
 * Herramienta de EXPLORACIÓN y comparación — NO es un producto comercial:
 * sin "flight vendido", sin precio del trío, sin total, sin descuento, sin
 * servicio de degustación, sin reservas. "Trío" = lo que el visitante arma
 * para comparar, no una oferta de la casa.
 *
 * - Modelo (Bloque 7): estado LOCAL `flightIds` (máx 3, orden de agregado).
 *   Al cerrar el builder el trío se pierde; Mi selección NUNCA se modifica
 *   por el builder (la selección global solo cambia con acciones explícitas).
 * - Puente con lo explorado: los vinos de Mi selección se ofrecen como
 *   candidatos "Desde mi selección" (Bloques 9/32, sin segundo store global).
 * - Sugerencias deterministas (Bloques 19/20/45): score transparente
 *   +1 estilo distinto / +1 bodega distinta / +1 ocasión distinta respecto al
 *   trío actual; empate → orden estable del catálogo; máx 6 candidatos.
 *   Microcopy descriptivo, nunca "recomendado porque combina mejor".
 * - Comparación objetiva (Bloques 13/14/16/44): solo datos reales del
 *   catálogo + conteos matemáticos. Sin aroma/cuerpo/taninos inventados, sin
 *   "mejor trío", sin score de calidad. Total NO se muestra (Bloque 28).
 * - Ficha de cata (Bloque 26): si `tasting` no existe → texto vacío explícito.
 */

/** Máximo de vinos del trío. */
export const FLIGHT_LIMIT = 3;
/** Duración de la animación de salida (ms); debe coincidir con el CSS. */
const EXIT_MS = 140;

/** Estilo facet derivado (F3) como clave estable. */
export function styleKeyOf(w: Wine): string {
  if (isMalbec(w)) return "malbec";
  if (isCabernetSauvignon(w)) return "cabernetSauvignon";
  if (isWhiteOrRose(w)) return "whiteOrRose";
  if (isSparkling(w)) return "sparkling";
  if (isAuthorBoutique(w)) return "authorBoutique";
  return "none";
}

/** Banda de precio (F4) como clave estable (= rango de precio). */
export function occasionKeyOf(w: Wine): Exclude<OccasionFilter, "all"> {
  if (isPriceInOccasion(w.precio, "everyday")) return "everyday";
  if (isPriceInOccasion(w.precio, "gift")) return "gift";
  return "collection";
}

/** add idempotente con límite 3: el 4º y los duplicados son no-op (Bloque 10/49). */
export function addFlight(flight: readonly string[], wineId: string): string[] {
  if (flight.includes(wineId)) return [...flight];
  if (flight.length >= FLIGHT_LIMIT) return [...flight];
  return [...flight, wineId];
}

/** remove sin excepción; orden de los restantes preservado. */
export function removeFlight(flight: readonly string[], wineId: string): string[] {
  return flight.filter((id) => id !== wineId);
}

/**
 * Conteos objetivos del trío (Bloques 16/44): valores únicos reales.
 * Sin afinidad sensorial, sin calidad, sin "mejor".
 */
export function flightDifferences(flight: readonly Wine[]): {
  bodegas: number;
  estilos: number;
  ocasiones: number;
} {
  const bodegas = new Set(flight.map((w) => w.bodega ?? w.categoria_carta));
  const estilos = new Set(flight.map(styleKeyOf));
  const ocasiones = new Set(flight.map(occasionKeyOf));
  return { bodegas: bodegas.size, estilos: estilos.size, ocasiones: ocasiones.size };
}

/**
 * Sugerencias deterministas (Bloques 19/20/45): +1 estilo distinto a los del
 * trío, +1 bodega distinta, +1 ocasión distinta. Máx 3. Empate → orden
 * estable del catálogo (candidates llega en ese orden). Máx 6 resultados.
 */
export function suggestNext(flight: readonly Wine[], candidates: readonly Wine[]): Wine[] {
  if (flight.length === 0 || flight.length >= FLIGHT_LIMIT) return [];
  const styles = new Set(flight.map(styleKeyOf));
  const bodegas = new Set(flight.map((w) => w.bodega ?? w.categoria_carta));
  const ocasiones = new Set(flight.map(occasionKeyOf));
  return candidates
    .map((w, index) => ({
      w,
      index,
      score:
        (styles.has(styleKeyOf(w)) ? 0 : 1) +
        (bodegas.has(w.bodega ?? w.categoria_carta) ? 0 : 1) +
        (ocasiones.has(occasionKeyOf(w)) ? 0 : 1),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 6)
    .map((x) => x.w);
}

type Props = {
  onClose: () => void;
  onOpenWine: (wine: Wine) => void;
  /** Navegación existente para "Explorar vinos" (sin scroll nuevo). */
  onExplore: () => void;
};

export function WineFlightBuilder({ onClose, onOpenWine, onExplore }: Props) {
  const { t } = useTranslation();
  const { currency, rateType } = useLocale();
  const { selectedIds, isSelected, toggle } = useSelection();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollYRef = useRef<number>(0);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  // Estado LOCAL del trío (Bloque 7): orden de agregado, máx 3.
  const [flight, setFlight] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);

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

  const WINE_BY_ID = useMemo(
    () => new Map(allWines.map((w) => [w.id, w] as const)),
    []
  );
  const flightWines = useMemo(
    () => flight.map((id) => WINE_BY_ID.get(id)).filter((w): w is Wine => w !== undefined),
    [flight, WINE_BY_ID]
  );
  const isFull = flight.length >= FLIGHT_LIMIT;

  // Candidatos "Desde mi selección": vinos guardados que aún no están en el trío.
  const fromSelection = useMemo(
    () =>
      selectedIds
        .map((id) => WINE_BY_ID.get(id))
        .filter((w): w is Wine => w !== undefined && !flight.includes(w.id)),
    [selectedIds, WINE_BY_ID, flight]
  );

  // Sugerencias deterministas (solo con trío incompleto y no vacío).
  const suggestions = useMemo(
    () =>
      suggestNext(
        flightWines,
        allWines.filter((w) => !flight.includes(w.id))
      ),
    [flightWines, flight]
  );

  const diffs = useMemo(() => flightDifferences(flightWines), [flightWines]);

  const handleAdd = (wine: Wine) => {
    setFlight((cur) => addFlight(cur, wine.id));
    setComparing(false);
  };
  const handleRemove = (wine: Wine) => {
    setFlight((cur) => removeFlight(cur, wine.id));
    setComparing(false);
  };

  const handleExploreCta = () => {
    // Difiere para que el sheet restaure el overflow antes de navegar (patrón 5B).
    window.setTimeout(() => onExplore(), 120);
    requestClose();
  };

  const styleLabel = (w: Wine): string => {
    const key = styleKeyOf(w);
    if (key === "none") return t("flight.styleNone");
    if (key === "malbec") return t("filters.malbec");
    if (key === "cabernetSauvignon") return t("filters.cabernet");
    if (key === "whiteOrRose") return t("filters.whiteRose");
    if (key === "sparkling") return t("filters.sparkling");
    return t("filters.author");
  };
  const occasionLabel = (w: Wine): string => {
    const key = occasionKeyOf(w);
    if (key === "everyday") return t("price.everyday");
    if (key === "gift") return t("price.gift");
    return t("price.collection");
  };

  // Candidatos ya en Mi selección (chips con estado)
  const selectedBadge = (wine: Wine) =>
    isSelected(wine.id) ? (
      <span className="flight-insel" aria-label={t("flight.inSelection")}>
        ✓ {t("flight.inSelection")}
      </span>
    ) : null;

  return (
    <div
      className={`sel-overlay flight-overlay${closing ? " is-closing" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className="sel-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flight-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sel-handle" aria-hidden>
          <span />
        </div>

        <header className="sel-header">
          <div style={{ minWidth: 0 }}>
            <h2 id="flight-title" className="sel-title">
              {t("flight.title")}
            </h2>
            <p className="sel-count">{t("flight.subtitle")}</p>
          </div>
          <button type="button" className="sel-close" aria-label={t("settings.close")} onClick={requestClose}>
            ✕
          </button>
        </header>

        {/* Contador accesible (Bloque 11/34) */}
        <div className="flight-counter" aria-live="polite">
          <span className="flight-countnum" aria-hidden>
            {isFull ? t("flight.complete") : t("flight.countLabel", { count: flight.length })}
          </span>
          <span className="sr-only">{t("flight.count", { count: flight.length })}</span>
        </div>

        {/* Trío construido */}
        {flightWines.length > 0 && (
          <div className="flight-built">
            {flightWines.map((wine, i) => {
              const nombre = wine.nombre_completo_visible;
              return (
                <div key={wine.id} className="gift-row">
                  <button
                    type="button"
                    className="gift-open"
                    aria-label={t("gifts.openAria", { nombre, nome: nombre, name: nombre })}
                    onClick={() => onOpenWine(wine)}
                  >
                    <span className="sel-item-bodega">
                      {i + 1} · {wine.bodega ?? wine.categoria_carta}
                    </span>
                    <span className="sel-item-name">{nombre}</span>
                    <span className="sel-item-price">
                      {formatPrice(wine.precio, currency, rateType)} <em>{currency}</em>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flight-remove"
                    aria-label={t("flight.removeAria", { nombre, nome: nombre, name: nombre })}
                    onClick={() => handleRemove(wine)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparación (Bloque 12/13): al completar, CTA → vista objetiva */}
        {flightWines.length === FLIGHT_LIMIT && !comparing && (
          <div className="flight-compare-cta">
            <button type="button" className="sel-cta" onClick={() => setComparing(true)}>
              {t("flight.compare")}
            </button>
          </div>
        )}

        {comparing && flightWines.length === FLIGHT_LIMIT && (
          <div className="flight-compare">
            <div className="flight-grid" role="table" aria-label={t("flight.compare")}>
              {flightWines.map((wine) => (
                <div key={wine.id} className="flight-col" role="row">
                  <button
                    type="button"
                    className="gift-open"
                    aria-label={t("gifts.openAria", {
                      nombre: wine.nombre_completo_visible,
                      nome: wine.nombre_completo_visible,
                      name: wine.nombre_completo_visible,
                    })}
                    onClick={() => onOpenWine(wine)}
                  >
                    <span className="sel-item-name">{wine.nombre_completo_visible}</span>
                    <span className="flight-openhint" aria-hidden>{t("wine.detailTitle")}</span>
                  </button>
                  <dl className="flight-facts">
                    <div>
                      <dt>{t("flight.rowWinery")}</dt>
                      <dd>{wine.bodega ?? wine.categoria_carta}</dd>
                    </div>
                    <div>
                      <dt>{t("flight.rowStyle")}</dt>
                      <dd>{styleLabel(wine)}</dd>
                    </div>
                    <div>
                      <dt>{t("flight.rowOccasion")}</dt>
                      <dd>{occasionLabel(wine)}</dd>
                    </div>
                    <div>
                      <dt>{t("flight.rowPrice")}</dt>
                      <dd>
                        {formatPrice(wine.precio, currency, rateType)} <em>{currency}</em>
                      </dd>
                    </div>
                    <div>
                      <dt>{t("flight.rowAnada")}</dt>
                      <dd>{wine.anada != null && String(wine.anada).trim() !== "" ? String(wine.anada) : "—"}</dd>
                    </div>
                    <div>
                      <dt>{t("flight.rowTasting")}</dt>
                      <dd className="flight-tasting">
                        {wine.tasting ? "✓" : t("flight.noTastingData")}
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="gift-add"
                    aria-pressed={isSelected(wine.id)}
                    aria-label={
                      isSelected(wine.id)
                        ? t("selection.removeAria", {
                            nombre: wine.nombre_completo_visible,
                            nome: wine.nombre_completo_visible,
                            name: wine.nombre_completo_visible,
                          })
                        : t("selection.addAria", {
                            nombre: wine.nombre_completo_visible,
                            nome: wine.nombre_completo_visible,
                            name: wine.nombre_completo_visible,
                          })
                    }
                    onClick={() => toggle(wine.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isSelected(wine.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
                    </svg>
                    {isSelected(wine.id) ? t("flight.inSelection") : t("gifts.add")}
                  </button>
                </div>
              ))}
            </div>

            {/* Diferencias explícitas (Bloque 16/18): solo matemática real */}
            <div className="flight-diffs" aria-label={t("flight.differences")}>
              <span className="gift-label">{t("flight.differences")}</span>
              <div className="flight-diffchips">
                {diffs.bodegas > 1 && <span className="gift-chip">{t("flight.distinctBodegas", { count: diffs.bodegas })}</span>}
                {diffs.estilos > 1 && <span className="gift-chip">{t("flight.distinctStyles", { count: diffs.estilos })}</span>}
                {diffs.ocasiones > 1 && <span className="gift-chip">{t("flight.distinctOccasions", { count: diffs.ocasiones })}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Llenado del trío */}
        {!isFull && (
          <div className="gift-filters">
            {fromSelection.length > 0 && (
              <div>
                <div className="gift-label" id="flight-sel-label">
                  {t("flight.fromSelection")}
                </div>
                <ul className="flight-cands" aria-labelledby="flight-sel-label">
                  {fromSelection.slice(0, 6).map((wine) => {
                    const nombre = wine.nombre_completo_visible;
                    return (
                      <li key={wine.id} className="flight-cand">
                        <span className="flight-candinfo">
                          <span className="sel-item-bodega">{wine.bodega ?? wine.categoria_carta}</span>
                          <span className="sel-item-name">{nombre}</span>
                          {selectedBadge(wine)}
                        </span>
                        <button
                          type="button"
                          className="gift-add"
                          aria-label={t("flight.addAria", { nombre, nome: nombre, name: nombre })}
                          onClick={() => handleAdd(wine)}
                        >
                          + {t("flight.add")}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {flightWines.length > 0 && suggestions.length > 0 && (
              <div>
                <div className="gift-label" id="flight-sugg-label">
                  {t("flight.suggestions")}
                </div>
                <ul className="flight-cands" aria-labelledby="flight-sugg-label">
                  {suggestions.map((wine) => {
                    const nombre = wine.nombre_completo_visible;
                    return (
                      <li key={wine.id} className="flight-cand">
                        <span className="flight-candinfo">
                          <span className="sel-item-bodega">
                            {wine.bodega ?? wine.categoria_carta} · {styleLabel(wine)}
                          </span>
                          <span className="sel-item-name">{nombre}</span>
                        </span>
                        <button
                          type="button"
                          className="gift-add"
                          aria-label={t("flight.addAria", { nombre, nome: nombre, name: nombre })}
                          onClick={() => handleAdd(wine)}
                        >
                          + {t("flight.add")}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <button type="button" className="sel-cta" onClick={handleExploreCta}>
              {t("flight.explore")}
            </button>
          </div>
        )}

        {isFull && (
          <div className="flight-limitnote" aria-live="polite">
            {t("flight.limitReached")}
          </div>
        )}

        {/* Empty state (Bloque 21) */}
        {flightWines.length === 0 && (
          <div className="sel-empty">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 21h8" />
              <path d="M12 15v6" />
              <path d="M7 3h10l-.7 8.05A4.7 4.7 0 0 1 12 15a4.7 4.7 0 0 1-4.3-3.95L7 3Z" />
              <path d="M17 3h4l-.5 5.2A3.4 3.4 0 0 1 17 11" />
            </svg>
            <p className="sel-empty-title">{t("flight.emptyTitle")}</p>
            <p className="sel-empty-desc">{t("flight.emptyDesc")}</p>
            <button type="button" className="sel-cta" onClick={handleExploreCta}>
              {t("flight.explore")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
