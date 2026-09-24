import { useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SearchBar } from "./components/SearchBar";
import { WineryExplorer } from "./components/WineryExplorer";
import { QuickFilters } from "./components/QuickFilters";
import { PriceOccasionFilters } from "./components/PriceOccasionFilters";
import { Catalog } from "./components/Catalog";
import { WineSheet } from "./components/WineSheet";
import { Footer } from "./components/Footer";
import { ServiceModeSwitch } from "./components/ServiceModeSwitch";
import { allWines, bodegaList } from "./data/catalog";
import { filterWines } from "./utils/search";
import { countFacets } from "./data/styleFacets";
import { MIN_PRICE, MAX_PRICE } from "./data/priceBands";
import type { Wine } from "./data/catalog";
import type { FacetKey } from "./data/styleFacets";
import type { OccasionFilter } from "./data/priceBands";
import { useTableContext } from "./hooks/useTableContext";
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

  const handleExplore = () => {
    const anchor = catalogAnchorRef.current;
    if (!anchor) return;
    const header = document.querySelector("header") as HTMLElement | null;
    const headerH = header ? header.getBoundingClientRect().height : 52;
    const padding = 12;
    const top = anchor.getBoundingClientRect().top + window.scrollY - headerH - padding;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setQuery("");
    setBodega(null);
    setFacet("all");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setOccasion("all");
  };

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

      <WineSheet wine={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

import { LocaleProvider } from "./context/LocaleContext";

export default function App() {
  return (
    <LocaleProvider>
      <AppInner />
    </LocaleProvider>
  );
}
