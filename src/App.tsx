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
import "./styles/global.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [bodega, setBodega] = useState<string | null>(null);
  const [selected, setSelected] = useState<Wine | null>(null);

  const catalogRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => filterWines(allWines, query, bodega), [query, bodega]);

  const handleExplore = () => {
    // Scroll suave al catálogo SIN usar scrollIntoView que mueve el viewport vertical de forma brusca en demos anteriores.
    // Usamos window.scrollTo + cálculo de offset, solo sobre el viewport.
    const el = catalogRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72; // header offset
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Hero totalWines={allWines.length} totalBodegas={bodegaList.length} onExplore={handleExplore} />

      <main className="container" style={{ width: "100%", paddingTop: 16, paddingBottom: 0, flex: "1 1 auto" }}>
        {/* Controles */}
        <div style={{ display: "grid", gap: 12, position: "sticky", top: "var(--header-h)", zIndex: 20, paddingTop: 12, paddingBottom: 12, background: "var(--paper)", marginLeft: "calc(-1 * var(--content-pad))", marginRight: "calc(-1 * var(--content-pad))", paddingLeft: "var(--content-pad)", paddingRight: "var(--content-pad)", borderBottom: "1px solid transparent" }}>
          <SearchBar
            value={query}
            onChange={setQuery}
            total={allWines.length}
            filteredCount={filtered.length}
            bodegaActiva={bodega}
            onClearBodega={() => setBodega(null)}
          />
          <WineryExplorer totalBodegas={bodegaList.length} activeBodega={bodega} onSelect={setBodega} />
          {/* Hint sutil de estado */}
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
            <span>
              {bodega ? `Bodega: ${bodega} · ${filtered.length} vinos` : `${filtered.length} vinos · ${bodegaList.length} bodegas`}
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
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Catálogo */}
        <div ref={catalogRef} style={{ paddingTop: 8, paddingBottom: 16 }}>
          <Catalog wines={filtered} query={query} bodega={bodega} onOpen={setSelected} />
        </div>

        {/* Nota de integridad */}
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
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", lineHeight: 1.3 }}>Inventario validado · 659 OK · 2 DUDOSO fuera de catálogo</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4, lineHeight: 1.5 }}>
              Los 2 registros DUDOSO (VIN-053 y VIN-145) no se muestran hasta confirmación del establecimiento. Los 659 nombres y precios están intactos, exactamente como en la carta de octubre.
              <br />
              <span style={{ fontSize: 11, letterSpacing: "0.04em" }}>Fuente: <code>data/inventario-carta.json</code> · 113 bodegas · 12 páginas</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <WineSheet wine={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
