import type { Wine } from "../data/catalog";
import { formatARS } from "../utils/formatPrice";

type Props = {
  wine: Wine;
  onOpen: (wine: Wine) => void;
};

export function WineCard({ wine, onOpen }: Props) {
  const initial = (wine.bodega || wine.categoria_carta || "?").trim().charAt(0).toUpperCase();
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
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "pointer",
        transition: "transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease",
        boxShadow: "0 2px 10px rgba(15,46,64,0.06)",
        minHeight: 132,
      }}
      onPointerEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
      }}
      onPointerLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 10px rgba(15,46,64,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
      }}
    >
      {/* Top: bodega + añada */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            fontSize: 11,
            letterSpacing: "0.08em",
            fontWeight: 700,
            color: "var(--navy)",
            background: "var(--paper-dark)",
            border: "1px solid var(--line)",
            padding: "6px 8px",
            borderRadius: 999,
            maxWidth: "75%",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              background: "var(--navy)",
              color: "var(--gold)",
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              fontWeight: 800,
              flex: "0 0 auto",
            }}
          >
            {initial}
          </span>
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wine.bodega}</span>
        </span>

        {hasAnada && (
          <span
            style={{
              flex: "0 0 auto",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "var(--gold-muted)",
              background: "rgba(201,168,106,0.12)",
              border: "1px solid rgba(201,168,106,0.22)",
              padding: "6px 8px",
              borderRadius: 999,
            }}
          >
            {String(wine.anada)}
          </span>
        )}
      </div>

      {/* Nombre */}
      <h3
        style={{
          margin: 0,
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 14,
          lineHeight: 1.32,
          fontWeight: 700,
          color: "var(--ink)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 54,
        }}
      >
        {wine.nombre_completo_visible}
      </h3>

      {/* Precio + acción */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingTop: 8,
          borderTop: "1px solid var(--line)",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: "var(--navy)",
          }}
        >
          {formatARS(wine.precio)}
        </span>
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "var(--navy)",
            color: "var(--paper-warm)",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
          }}
        >
          ›
        </span>
      </div>

      {/* Representación editorial sutil (no foto de botella inventada) */}
      <div
        aria-hidden
        style={{
          position: "relative",
          height: 1,
          background: `linear-gradient(90deg, rgba(201,168,106,0.0), rgba(201,168,106,0.22), rgba(201,168,106,0.0))`,
          marginTop: 2,
        }}
      />
    </article>
  );
}
