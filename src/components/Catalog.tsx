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

  // Cuando hay búsqueda activa, mostrar en grilla plana para comparar rápido
  if (isFiltered) {
    return (
      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            fontWeight: 800,
            color: "var(--ink-muted)",
            marginBottom: 10,
            paddingLeft: 2,
          }}
        >
          RESULTADOS · {wines.length} ETIQUETAS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 158px), 1fr))",
            gap: 10,
          }}
        >
          {wines.map((w) => (
            <WineCard key={w.id} wine={w} onOpen={onOpen} />
          ))}
        </div>
      </div>
    );
  }

  // Sin filtros: agrupado por bodega, para explorar 659 sin abrumar
  return (
    <div style={{ display: "grid", gap: 18 }}>
      {grouped.map(([bodegaName, items]) => (
        <section
          key={bodegaName}
          style={{
            background: "var(--paper-warm)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(15,46,64,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "12px 14px",
              borderBottom: "1px solid var(--line)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,245,239,0.9))",
              position: "sticky",
              top: "var(--header-h)",
              zIndex: 5,
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "ui-serif, Georgia, serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "var(--navy)",
                  lineHeight: 1.2,
                }}
              >
                {bodegaName}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2, letterSpacing: "0.06em", fontWeight: 600 }}>
                {items.length} etiquetas · pág. {items[0]?.pagina_carta}
              </div>
            </div>
            <span
              style={{
                flex: "0 0 auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 34,
                height: 28,
                padding: "0 8px",
                borderRadius: 999,
                background: "var(--navy)",
                color: "var(--paper-warm)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {items.length}
            </span>
          </div>

          <div style={{ padding: 10 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 158px), 1fr))",
                gap: 10,
              }}
            >
              {items.map((w) => (
                <WineCard key={w.id} wine={w} onOpen={onOpen} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
