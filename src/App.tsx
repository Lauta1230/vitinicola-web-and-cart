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

  const catalogAnchorRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => filterWines(allWines, query, bodega), [query, bodega]);

  const handleExplore = () => {
    // AUDITORÍA SCROLL: antes usaba offset arbitrario -72 y el catálogo quedaba oculto
    // bajo el header sticky + la barra de controles sticky (que ocupaba ~150px).
    // FIX: medir altura real del header y hacer scroll al ancla #catalogo, no al interior del catálogo.
    // El ancla tiene scroll-margin-top: calc(var(--header-h) + 12px) para que el navegador lo respete,
    // pero aquí usamos window.scrollTo + medición precisa para CTA.
    const anchor = catalogAnchorRef.current;
    if (!anchor) return;
    const header = document.querySelector("header") as HTMLElement | null;
    const headerH = header ? header.getBoundingClientRect().height : 52;
    // Pequeño respiro para que el inicio de la carta no quede pegado al header
    const padding = 12;
    const top = anchor.getBoundingClientRect().top + window.scrollY - headerH - padding;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Hero totalWines={allWines.length} totalBodegas={bodegaList.length} onExplore={handleExplore} />

      {/* Ancla real del catálogo: justo antes de los controles.
          Importante: el Header es el único sticky. Los controles ya NO son sticky,
          así evitamos doble capa sticky que tapaba media pantalla en mobile. */}
      <div id="catalogo" ref={catalogAnchorRef} aria-label="Inicio del catálogo" />

      <main className="container" style={{ width: "100%", paddingTop: 16, paddingBottom: 0, flex: "1 1 auto" }}>
        {/* Controles: ahora NO sticky — scroll natural. 
            Esto elimina el bug donde el Hero/Header/controles tapaban el inicio de la carta. */}
        <div
          style={{
            display: "grid",
            gap: 12,
            // Antes: position: sticky, top: var(--header-h), zIndex: 20, márgenes negativos
            // Ahora: flujo normal, sin sticky, sin z-index elevado
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
              {bodega ? `Bodega: ${bodega} · ${filtered.length} vinos` : `Carta · ${filtered.length} vinos · ${bodegaList.length} bodegas`}
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

        {/* Catálogo en sí */}
        <div style={{ paddingTop: 12, paddingBottom: 16 }}>
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
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)", lineHeight: 1.3 }}>Carta digital · 659 etiquetas · 113 bodegas</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4, lineHeight: 1.5 }}>
              Explorá la carta como en la vinoteca. Los 2 registros DUDOSO (VIN-053 y VIN-145) permanecen fuera de la carta hasta confirmación.
              <br />
              <span style={{ fontSize: 11, letterSpacing: "0.04em" }}>Fuente: <code>data/inventario-carta.json</code> · Octubre · ARS</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <WineSheet wine={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
