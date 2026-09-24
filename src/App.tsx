import { useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SearchBar } from "./components/SearchBar";
import { WineryExplorer } from "./components/WineryExplorer";
import { Catalog } from "./components/Catalog";
import { WineSheet } from "./components/WineSheet";
import { Footer } from "./components/Footer";
import { allWines, bodegaList } from "./data/catalog";
import { filterWines } from "./utils/search";
import type { Wine } from "./data/catalog";
import { useTranslation } from "./hooks/useTranslation";
import "./styles/global.css";

function AppInner() {
  const [query, setQuery] = useState("");
  const [bodega, setBodega] = useState<string | null>(null);
  const [selected, setSelected] = useState<Wine | null>(null);
  const { t } = useTranslation();

  const catalogAnchorRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => filterWines(allWines, query, bodega), [query, bodega]);

  const handleExplore = () => {
    const anchor = catalogAnchorRef.current;
    if (!anchor) return;
    const header = document.querySelector("header") as HTMLElement | null;
    const headerH = header ? header.getBoundingClientRect().height : 52;
    const padding = 12;
    const top = anchor.getBoundingClientRect().top + window.scrollY - headerH - padding;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
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
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 1,
                  background: "var(--line-strong)",
                  display: "inline-block",
                }}
              />
              {bodega
                ? t("catalog.bodegaCount", { bodega, count: filtered.length })
                : t("catalog.filteredCount", { filtered: filtered.length, total: bodegaList.length })}
            </span>
            {(query || bodega) && (
              <button
                onClick={() => {
                  setQuery("");
                  setBodega(null);
                }}
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
                }}
              >
                {t("catalog.clearFilters")}
              </button>
            )}
          </div>
        </div>

        <div style={{ paddingTop: 12, paddingBottom: 16 }}>
          <Catalog wines={filtered} query={query} bodega={bodega} onOpen={setSelected} />
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
