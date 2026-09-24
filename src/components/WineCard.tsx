import type { Wine } from "../data/catalog";
import { formatARS } from "../utils/formatPrice";

type Props = {
  wine: Wine;
  onOpen: (wine: Wine) => void;
  // Cuando se muestra agrupado por bodega, la bodega ya está en el encabezado de sección:
  // no repetir badge para reforzar la jerarquía de carta.
  showBodega?: boolean;
};

export function WineCard({ wine, onOpen, showBodega = true }: Props) {
  const hasAnada = wine.anada != null && String(wine.anada).trim() !== "";

  return (
    <article
      onClick={() => onOpen(wine)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(wine);
        }
      }}
      aria-label={`${wine.nombre_completo_visible}, ${wine.bodega} — ${formatARS(wine.precio)}`}
      style={{
        background: "var(--paper-warm)",
        border: "1px solid var(--line)",
        borderLeft: "3px solid rgba(201,168,106,0.0)",
        borderRadius: 14,
        padding: "12px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        cursor: "pointer",
        transition: "background 0.12s ease, border-color 0.12s ease, transform 0.12s ease",
        minHeight: 64,
      }}
      onPointerEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "var(--white)";
        el.style.borderLeftColor = "var(--gold)";
        el.style.borderColor = "var(--line-strong)";
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "var(--paper-warm)";
        el.style.borderLeftColor = "rgba(201,168,106,0.0)";
        el.style.borderColor = "var(--line)";
      }}
    >
      {/* Izquierda: nombre + bodega sutil */}
      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
        {showBodega && (
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.10em",
              fontWeight: 700,
              color: "var(--gold-muted)",
              lineHeight: 1,
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {wine.bodega}
            {hasAnada ? ` · ${wine.anada}` : ""}
          </div>
        )}
        {!showBodega && hasAnada && (
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.08em",
              fontWeight: 700,
              color: "var(--gold-muted)",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            AÑADA {String(wine.anada)}
          </div>
        )}
        <h3
          style={{
            margin: 0,
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 14.5,
            lineHeight: 1.32,
            fontWeight: 650,
            color: "var(--ink)",
            // En carta, el nombre debe leerse completo sin truncar agresivo
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {wine.nombre_completo_visible}
        </h3>
        {!showBodega && (
          <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2, lineHeight: 1, letterSpacing: "0.02em" }}>
            pág. {wine.pagina_carta}
          </div>
        )}
      </div>

      {/* Derecha: precio + flecha */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 92,
          justifyContent: "flex-end",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: "var(--navy)",
            whiteSpace: "nowrap",
            textAlign: "right",
          }}
        >
          {formatARS(wine.precio)}
        </span>
        <span
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "var(--paper-dark)",
            border: "1px solid var(--line)",
            color: "var(--ink-muted)",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            flex: "0 0 auto",
          }}
        >
          ›
        </span>
      </div>
    </article>
  );
}
