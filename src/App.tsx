import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SearchBar } from "./components/SearchBar";
import { WineryExplorer } from "./components/WineryExplorer";
import { QuickFilters } from "./components/QuickFilters";
import { PriceOccasionFilters } from "./components/PriceOccasionFilters";
import { Catalog } from "./components/Catalog";
import { Footer } from "./components/Footer";
import { LazyGiftExplorer, LazySelectionSheet, LazySommelier, LazyWineFlightBuilder, LazyWineSheet } from "./components/lazySheets";
import { ServiceModeSwitch } from "./components/ServiceModeSwitch";
import { TableActionBar } from "./components/TableActionBar";
import { SelectionTrigger } from "./components/SelectionTrigger";
import { allWines, bodegaList } from "./data/catalog";
import { filterWines } from "./utils/search";
import { countFacets } from "./data/styleFacets";
import { MIN_PRICE, MAX_PRICE } from "./data/priceBands";
import type { Wine } from "./data/catalog";
import type { FacetKey } from "./data/styleFacets";
import type { OccasionFilter } from "./data/priceBands";
import { useTableContext } from "./hooks/useTableContext";
import { SelectionProvider, useSelection } from "./context/SelectionContext";
import { useTranslation } from "./hooks/useTranslation";
import "./styles/global.css";

function AppInner() {
  const [query, setQuery] = useState("");
  const [bodega, setBodega] = useState<string | null>(null);
  const [facet, setFacet] = useState<FacetKey>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [occasion, setOccasion] = useState<OccasionFilter>("all");
  const [selected, setSelected] = useState<Wine | null>(null);
  // FASE 5A — contexto de servicio: mesa desde ?mesa= (lectura única) + modo bar/takeaway.
  // No interactúa con filtros, búsqueda, idioma, moneda ni scroll.
  const { serviceMode, tableContext, setServiceMode } = useTableContext();
  // FASE 5.5 — solo isOpen: el toggle de selección re-renderiza AppInner, pero
  // Catalog (memo) y su listado de 659 cards quedan fuera del render.
  const { isOpen: selectionOpen } = useSelection();
  // FASE 6 — Gift Explorer: disponible solo en "Llevar / Regalar" (capa
  // secundaria; no compite con la experiencia de mesa). Estado local del sheet.
  const [giftOpen, setGiftOpen] = useState(false);
  // FASE 7 — Sommelier: buscador guiado secundario, disponible en AMBOS modos.
  // Estado local del sheet; no toca filtros ni selección globales.
  const [sommOpen, setSommOpen] = useState(false);
  // FASE 8 — Flight Builder: comparador local de hasta 3 vinos (ambos modos).
  // Estado local al sheet: cerrar lo descarta; Mi selección no se modifica.
  const [flightOpen, setFlightOpen] = useState(false);
  const { t } = useTranslation();

  const catalogAnchorRef = useRef<HTMLDivElement | null>(null);

  const facetCounts = useMemo(() => {
    const c = countFacets(allWines);
    return {
      all: allWines.length,
      malbec: c.malbec,
      cabernetSauvignon: c.cabernetSauvignon,
      whiteOrRose: c.whiteOrRose,
      sparkling: c.sparkling,
      authorBoutique: c.authorBoutique,
    } as Record<FacetKey, number>;
  }, []);

  const filtered = useMemo(
    () => filterWines(allWines, query, bodega, facet, priceRange, occasion),
    [query, bodega, facet, priceRange, occasion]
  );

  // FASE 5.5 — callbacks estables: permiten memo(Catalog) sin rerenders del
  // listado cuando cambian estados no relacionados (service mode, selección,
  // WineSheet, acciones de mesa).
  const handleExplore = useCallback(() => {
    const anchor = catalogAnchorRef.current;
    if (!anchor) return;
    const header = document.querySelector("header") as HTMLElement | null;
    const headerH = header ? header.getBoundingClientRect().height : 52;
    const padding = 12;
    const top = anchor.getBoundingClientRect().top + window.scrollY - headerH - padding;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const clearAllFilters = useCallback(() => {
    setQuery("");
    setBodega(null);
    setFacet("all");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setOccasion("all");
  }, []);

  const isPriceFiltered = priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE;
  const isOccasionFiltered = occasion !== "all";
  const hasActiveFilters =
    query.trim().length > 0 || bodega !== null || facet !== "all" || isPriceFiltered || isOccasionFiltered;

  const activeCount = [
    query.trim().length > 0,
    bodega !== null,
    facet !== "all",
    isOccasionFiltered,
    isPriceFiltered,
  ].filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header tableId={tableContext.tableId} />
      <Hero totalWines={allWines.length} totalBodegas={bodegaList.length} onExplore={handleExplore} />

      <div id="catalogo" ref={catalogAnchorRef} aria-label="Inicio del catálogo" />

      <main className="container" style={{ width: "100%", paddingTop: 16, paddingBottom: 0, flex: "1 1 auto" }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            position: "relative",
            zIndex: 1,
            paddingTop: 4,
            paddingBottom: 8,
            background: "transparent",
          }}
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            total={allWines.length}
            filteredCount={filtered.length}
            bodegaActiva={bodega}
            onClearBodega={() => setBodega(null)}
          />

          {/* FASE 5A — contexto de uso (identidad → búsqueda → contexto → carta) */}
          <ServiceModeSwitch mode={serviceMode} onChange={setServiceMode} />

          <QuickFilters active={facet} onSelect={setFacet} counts={facetCounts} />

          <PriceOccasionFilters
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            occasion={occasion}
            onOccasionChange={setOccasion}
          />

          {/* FASE 6/7 — triggers de descubrimiento secundarios (Progressive Disclosure) */}
          <div className="disc-row">
            {serviceMode === "takeaway" && (
              <button
                type="button"
                className="gift-trigger"
                aria-haspopup="dialog"
                onClick={() => setGiftOpen(true)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="4" y="10" width="16" height="10" rx="1.5" />
                  <path d="M12 10v10" />
                  <path d="M4 10h16" />
                  <path d="M12 10c-4.5 0-6-1.8-6-3.4C6 5.1 7.2 4 8.6 4 10.6 4 12 6.4 12 10Z" />
                  <path d="M12 10c4.5 0 6-1.8 6-3.4C18 5.1 16.8 4 15.4 4 13.4 4 12 6.4 12 10Z" />
                </svg>
                {t("gifts.explore")}
              </button>
            )}
            <button
              type="button"
              className="gift-trigger"
              aria-haspopup="dialog"
              onClick={() => setSommOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                <path d="M12 3v3" />
                <path d="M12 18v3" />
                <path d="M3 12h3" />
                <path d="M18 12h3" />
                <path d="m5.6 5.6 2.1 2.1" />
                <path d="m16.3 16.3 2.1 2.1" />
                <path d="m18.4 5.6-2.1 2.1" />
                <path d="m7.7 16.3-2.1 2.1" />
                <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
              </svg>
              {t("sommelier.trigger")}
            </button>
            <button
              type="button"
              className="gift-trigger"
              aria-haspopup="dialog"
              onClick={() => setFlightOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                <path d="M5 4v9a3 3 0 0 0 6 0V4" />
                <path d="M8 16v4" />
                <path d="M6 20h4" />
                <path d="M13 4v9a3 3 0 0 0 6 0V4" />
                <path d="M16 16v4" />
                <path d="M14 20h4" />
              </svg>
              {t("flight.trigger")}
            </button>
          </div>

          <WineryExplorer totalBodegas={bodegaList.length} activeBodega={bodega} onSelect={setBodega} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              fontSize: 11,
              color: "var(--ink-muted)",
              letterSpacing: "0.06em",
              fontWeight: 600,
              paddingLeft: 2,
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 1,
                  background: "var(--line-strong)",
                  display: "inline-block",
                  flex: "0 0 auto",
                }}
              />
              {hasActiveFilters ? (
                <span>
                  {t("price.activeCount", { count: activeCount })} · {filtered.length} {t("common.vinos")}
                  {facet !== "all" && ` · ${t(`filters.${facet === "cabernetSauvignon" ? "cabernet" : facet === "whiteOrRose" ? "whiteRose" : facet === "authorBoutique" ? "author" : facet}` as any)}`}
                  {isOccasionFiltered &&
                    ` · ${occasion === "everyday" ? t("price.everyday") : occasion === "gift" ? t("price.gift") : t("price.collection")}`}
                  {bodega && ` · ${bodega}`}
                  {isPriceFiltered && ` · ${priceRange[0].toLocaleString("es-AR")}–${priceRange[1].toLocaleString("es-AR")}`}
                </span>
              ) : facet !== "all" ? (
                `${t(`filters.${facet === "cabernetSauvignon" ? "cabernet" : facet === "whiteOrRose" ? "whiteRose" : facet === "authorBoutique" ? "author" : facet}` as any)} · ${filtered.length} ${t("common.vinos")}`
              ) : bodega ? (
                t("catalog.bodegaCount", { bodega, count: filtered.length })
              ) : (
                t("catalog.filteredCount", { filtered: filtered.length, total: bodegaList.length })
              )}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  height: 28,
                  padding: "0 10px",
                  borderRadius: 999,
                  border: "1px solid var(--line)",
                  background: "var(--white)",
                  color: "var(--ink-muted)",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  flex: "0 0 auto",
                }}
              >
                {t("filters.clear")}
              </button>
            )}
          </div>
        </div>

        <div style={{ paddingTop: 12, paddingBottom: 16 }}>
          <Catalog
            wines={filtered}
            query={query}
            bodega={bodega}
            facet={facet}
            priceRange={priceRange}
            occasion={occasion}
            onOpen={setSelected}
            onClearFilters={clearAllFilters}
          />
        </div>

        <div
          style={{
            marginTop: 8,
            padding: "14px 14px",
            borderRadius: 16,
            background: "var(--white)",
            border: "1px solid var(--line)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "var(--paper-dark)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
              fontSize: 14,
            }}
          >
            ✓
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", lineHeight: 1.3 }}>{t("catalog.integrityTitle")}</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4, lineHeight: 1.5 }}>
              {t("catalog.integrityDesc")}
              <br />
              <span style={{ fontSize: 11, letterSpacing: "0.04em" }}>{t("catalog.integritySource")}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {selected && (
        <Suspense fallback={<SheetShellFallback />}>
          <LazyWineSheet wine={selected} onClose={() => setSelected(null)} />
        </Suspense>
      )}

      {/* FASE 5B — Mi selección: trigger flotante + panel. AppInner NO consume
          el contexto: toggle/cambios de selección nunca re-renderean el catálogo. */}
      {/* FASE 5D — Barra de acciones de mesa: solo con mesa válida + Tomar acá.
          Montaje condicional → al cambiar a Llevar/Regalar se desmonta y su
          activeAction se descarta (reaparece limpia al volver al modo mesa). */}
      {tableContext.tableId !== null && serviceMode === "bar" && (
        <TableActionBar tableId={tableContext.tableId} serviceMode={serviceMode} />
      )}
      <div className={`sel-fab-slot${tableContext.tableId !== null && serviceMode === "bar" ? " sel-fab-slot--raised" : ""}`}>
        <SelectionTrigger />
      </div>
      {selectionOpen && (
        <Suspense fallback={<SheetShellFallback />}>
          <LazySelectionSheet onExplore={handleExplore} serviceMode={serviceMode} />
        </Suspense>
      )}
      {serviceMode === "takeaway" && giftOpen && (
        <Suspense fallback={<SheetShellFallback />}>
          <LazyGiftExplorer onClose={() => setGiftOpen(false)} onOpenWine={setSelected} />
        </Suspense>
      )}
      {sommOpen && (
        <Suspense fallback={<SheetShellFallback />}>
          <LazySommelier onClose={() => setSommOpen(false)} onOpenWine={setSelected} />
        </Suspense>
      )}
      {flightOpen && (
        <Suspense fallback={<SheetShellFallback />}>
          <LazyWineFlightBuilder
            onClose={() => setFlightOpen(false)}
            onOpenWine={setSelected}
            onExplore={handleExplore}
          />
        </Suspense>
      )}
    </div>
  );
}

import { LocaleProvider } from "./context/LocaleContext";

/**
 * FASE 5.5 — fallback de Suspense: shell mínimo del sheet (sin layout shift,
 * sin "Cargando aplicación..."). Con preload por hover/focus casi nunca se ve.
 */
function SheetShellFallback() {
  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(10, 34, 48, 0.52)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          height: 160,
          background: "var(--paper-warm)",
          borderRadius: "20px 20px 16px 16px",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-strong)",
          display: "flex",
          justifyContent: "center",
          paddingTop: 10,
        }}
      >
        <span style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line-strong)", display: "block" }} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <SelectionProvider>
        <AppInner />
      </SelectionProvider>
    </LocaleProvider>
  );
}
