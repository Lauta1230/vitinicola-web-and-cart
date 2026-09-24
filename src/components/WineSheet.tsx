import { useEffect, useRef } from "react";
import type { Wine } from "../data/catalog";
import { formatARS } from "../utils/formatPrice";
import { business } from "../data/business";

type Props = {
  wine: Wine | null;
  onClose: () => void;
};

export function WineSheet({ wine, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wine) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [wine, onClose]);

  if (!wine) return null;

  const shareText = encodeURIComponent(
    `Te recomiendo de ${business.name}: ${wine.nombre_completo_visible} — ${wine.bodega} — ${formatARS(wine.precio)} — ${business.maps}`
  );
  const waHref = `https://wa.me/?text=${shareText}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={wine.nombre_completo_visible}
      onClick={onClose}
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
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "86vh",
          background: "var(--paper-warm)",
          borderRadius: "20px 20px 16px 16px",
          boxShadow: "var(--shadow-strong)",
          border: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <span style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line-strong)", display: "block" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 16px 12px", borderBottom: "1px solid var(--line)", background: "var(--paper-warm)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  letterSpacing: "0.10em",
                  fontWeight: 800,
                  color: "var(--gold-muted)",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--gold)", display: "inline-block" }} />
                {wine.bodega}
                {wine.anada ? ` · ${wine.anada}` : ""}
              </div>
              <h2
                style={{
                  margin: "6px 0 0",
                  fontFamily: "ui-serif, Georgia, serif",
                  fontSize: 20,
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: "var(--navy)",
                }}
              >
                {wine.nombre_completo_visible}
              </h2>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "var(--navy)",
                    color: "var(--paper-warm)",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {formatARS(wine.precio)}
                  <span style={{ opacity: 0.7, fontWeight: 600, fontSize: 11 }}>ARS</span>
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--ink-muted)",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  CARTA OCTUBRE · pág. {wine.pagina_carta}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                flex: "0 0 auto",
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "var(--white)",
                color: "var(--ink-soft)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflow: "auto", padding: 16, display: "grid", gap: 14, WebkitOverflowScrolling: "touch" }}>
          {/* Info disponible */}
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: 14,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)" }}>DETALLE DE CARTA</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>BODEGA</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{wine.bodega}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>CATEGORÍA</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{wine.categoria_carta}</div>
              </div>
              {wine.anada && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>AÑADA</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{String(wine.anada)}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>PÁGINA CARTA</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{wine.pagina_carta}</div>
              </div>
            </div>

            {/* Nota editorial: no mostrar campos vacíos */}
            <div
              style={{
                marginTop: 4,
                padding: "10px 12px",
                borderRadius: 12,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                fontSize: 12,
                color: "var(--ink-soft)",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "var(--navy)" }}>Fuente de verdad:</strong> Carta de La Vinícola (Octubre). Precio y nombre exactamente como aparecen en la carta. Sin descripciones ni puntajes añadidos en esta fase.
              {wine.notas_validacion && (
                <>
                  <br />
                  <span style={{ color: "var(--ink-muted)" }}>Nota:</span> {wine.notas_validacion}
                </>
              )}
            </div>
          </div>

          {/* Espacios estructurales reservados para futuras fases — NO se muestran vacíos. Solo un hint sutil. */}
          <div
            style={{
              display: "grid",
              gap: 8,
              opacity: 0.92,
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)" }}>PRÓXIMAMENTE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: "Cepa", soon: true },
                { label: "Estilo", soon: true },
                { label: "Maridaje", soon: true },
                { label: "Ocasión", soon: true },
                { label: "Pack", soon: true },
              ].map((chip) => (
                <span
                  key={chip.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 10px",
                    borderRadius: 999,
                    border: "1px dashed var(--line-strong)",
                    background: "rgba(255,255,255,0.6)",
                    color: "var(--ink-muted)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {chip.label} <span style={{ fontSize: 10, opacity: 0.7 }}>PRONTO</span>
                </span>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: "grid", gap: 10 }}>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 12,
                background: "#25D366",
                color: "white",
                fontWeight: 800,
                fontSize: 14,
                border: "1px solid #1FB955",
                textDecoration: "none",
              }}
            >
              <span aria-hidden>💬</span> Compartir por WhatsApp
            </a>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <a
                href={business.maps}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  borderRadius: 12,
                  background: "var(--white)",
                  border: "1px solid var(--line-strong)",
                  color: "var(--navy)",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                📍 Cómo llegar
              </a>
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  borderRadius: 12,
                  background: "var(--navy)",
                  border: "1px solid var(--navy-soft)",
                  color: "var(--paper-warm)",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Instagram
              </a>
            </div>
          </div>

          <div style={{ fontSize: 11, color: "var(--ink-muted)", textAlign: "center", lineHeight: 1.4 }}>
            ID {wine.id} · Carta pág. {wine.pagina_carta} · Precio ARS · Stock consultar en tienda
          </div>
        </div>
      </div>
    </div>
  );
}
