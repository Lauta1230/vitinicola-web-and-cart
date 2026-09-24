import { useMemo } from "react";
import type { Wine } from "../data/catalog";
import { WineCard } from "./WineCard";

type Props = {
  wines: Wine[];
  query: string;
  bodega: string | null;
  onOpen: (wine: Wine) => void;
};

export function Catalog({ wines, query, bodega, onOpen }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, Wine[]>();
    for (const w of wines) {
      const key = w.bodega || w.categoria_carta || "Sin bodega";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "es", { sensitivity: "base" }));
  }, [wines]);

  const isFiltered = query.trim().length > 0 || bodega !== null;

  if (wines.length === 0) {
    return (
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
          color: "var(--ink-soft)",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
        <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: 16 }}>Sin resultados</div>
        <div style={{ fontSize: 13, marginTop: 6, color: "var(--ink-muted)", lineHeight: 1.5 }}>
          Probá con otro término. Ej: <strong>Quimera</strong>, <strong>Malbec</strong>, <strong>Zuccardi</strong>.
          <br />
          También podés cambiar de bodega o limpiar filtros.
        </div>
      </div>
    );
  }

  // Cuando hay búsqueda activa: grilla plana con bodega visible
  if (isFiltered) {
    return (
      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.10em",
            fontWeight: 800,
            color: "var(--gold-muted)",
            marginBottom: 10,
            paddingLeft: 2,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ width: 18, height: 1, background: "var(--line-strong)", display: "inline-block" }} />
          RESULTADOS · {wines.length} ETIQUETAS
          <span style={{ width: 18, height: 1, background: "var(--line-strong)", display: "inline-block" }} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 8,
          }}
        >
          {wines.map((w) => (
            <WineCard key={w.id} wine={w} onOpen={onOpen} showBodega />
          ))}
        </div>
      </div>
    );
  }

  // Sin filtros: carta editorial agrupada por bodega
  return (
    <div style={{ display: "grid", gap: 22 }}>
      {grouped.map(([bodegaName, items]) => (
        <section
          key={bodegaName}
          aria-label={bodegaName}
          style={{
            background: "transparent",
            border: "none",
          }}
        >
          {/* Encabezado de sección tipo carta */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              paddingBottom: 8,
              borderBottom: "1px solid var(--line-strong)",
              marginBottom: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "ui-serif, Georgia, serif",
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: "0.08em",
                  color: "var(--navy)",
                  lineHeight: 1.1,
                  textTransform: "uppercase",
                }}
              >
                {bodegaName}
              </h2>
              <div
                style={{
                  marginTop: 4,
                  height: 2,
                  width: 32,
                  background: "var(--gold)",
                  borderRadius: 999,
                }}
                aria-hidden
              />
            </div>

            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: "var(--ink-muted)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 22,
                  height: 22,
                  padding: "0 6px",
                  borderRadius: 999,
                  background: "var(--paper-dark)",
                  border: "1px solid var(--line)",
                  color: "var(--ink-soft)",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {items.length}
              </span>
              <span style={{ opacity: 0.7 }}>pág. {items[0]?.pagina_carta}</span>
            </div>
          </div>

          {/* Lista de vinos estilo carta: una columna, filas elegantes */}
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((w) => (
              <WineCard key={w.id} wine={w} onOpen={onOpen} showBodega={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
