import { useEffect, useRef, useState } from "react";
import type { Wine } from "../data/catalog";
import { formatPrice } from "../utils/formatPrice";
import { business } from "../data/business";
import { useLocale } from "../context/LocaleContext";
import { useSelection, normalizeWineId } from "../context/SelectionContext";
import { useTranslation } from "../hooks/useTranslation";
import { buildWhatsAppUrl } from "../utils/whatsapp";

type Props = {
  wine: Wine | null;
  onClose: () => void;
};

export function WineSheet({ wine, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollYRef = useRef<number>(0);
  const { currency, rateType } = useLocale();
  const { t } = useTranslation();

  // FASE 5C — Mi selección: la única fuente de verdad es SelectionContext
  // (sin useState paralelo de selección). Solo hay feedback temporal local.
  const { isSelected, toggle } = useSelection();
  const [selFeedback, setSelFeedback] = useState<"added" | "removed" | null>(null);
  const selFeedbackTimer = useRef<number | null>(null);

  // Al cambiar de ficha: reset del feedback (sin mover foco ni scroll).
  useEffect(() => {
    setSelFeedback(null);
    if (selFeedbackTimer.current !== null) {
      window.clearTimeout(selFeedbackTimer.current);
      selFeedbackTimer.current = null;
    }
  }, [wine?.id]);

  // Limpieza del timer si el sheet se desmonta a mitad del feedback.
  useEffect(
    () => () => {
      if (selFeedbackTimer.current !== null) window.clearTimeout(selFeedbackTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!wine) return;

    scrollYRef.current = window.scrollY;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      sheetRef.current?.focus({ preventScroll: true } as unknown as FocusOptions);
    });

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      const y = scrollYRef.current;
      if (Math.abs(window.scrollY - y) > 2) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
    };
  }, [wine, onClose]);

  if (!wine) return null;

  const priceLabel = formatPrice(wine.precio, currency, rateType);

  // FASE 5C — toggle real contra el contexto compartido.
  // La deduplicación y la validación de ID ya viven en el reducer de 5B
  // (idempotente, IDs desconocidos = no-op); sin lógica paralela acá.
  // Si el vino llega sin ID válido: botón deshabilitado, sin estado inconsistente.
  const selectable = normalizeWineId(wine.id) !== null;
  const inSelection = selectable && isSelected(wine.id);

  // FASE 7 — Ficha de cata: SOLO campos explícitos en el dato. Si no existen,
  // se muestra el estado vacío discreto (cero información inventada).
  const tasting = wine.tasting;
  const tastingRows: Array<[string, string]> = tasting
    ? (
        [
          [t("wine.tastingPalate"), tasting.palate],
          [t("wine.tastingAcidity"), tasting.acidity],
          [t("wine.tastingTannins"), tasting.tannins],
          [t("wine.tastingBody"), tasting.body],
          [t("wine.tastingFinish"), tasting.finish],
          [t("wine.tastingTemperature"), tasting.temperature],
        ] as Array<[string, string | undefined]>
      ).filter((r): r is [string, string] => Boolean(r[1]))
    : [];
  const tastingAromas = tasting?.aromas?.filter(Boolean) ?? [];
  const tastingPairings = wine.pairings?.filter(Boolean) ?? [];
  const hasTastingContent =
    tastingRows.length > 0 || tastingAromas.length > 0 || tastingPairings.length > 0;
  const tastingSourceLabel =
    tasting?.source === "official"
      ? t("wine.tastingSourceOfficial")
      : tasting?.source === "business-approved"
        ? t("wine.tastingSourceBusiness")
        : null;

  const handleToggleSelection = () => {
    if (!selectable) return;
    toggle(wine.id);
    setSelFeedback(!inSelection ? "added" : "removed");
    if (selFeedbackTimer.current !== null) window.clearTimeout(selFeedbackTimer.current);
    selFeedbackTimer.current = window.setTimeout(() => {
      selFeedbackTimer.current = null;
      setSelFeedback(null);
    }, 1500);
  };

  // FASE 9 — comparte por WhatsApp sin teléfono (el usuario elige contacto):
  // misma URL que siempre (wa.me/?text=), ahora centralizada en el helper
  // único buildWhatsAppUrl (encode garantizado; null si el texto fuera vacío).
  const waHref = buildWhatsAppUrl(
    null,
    `Te recomiendo de ${business.name}: ${wine.nombre_completo_visible} — ${wine.bodega} — ${priceLabel} — ${business.maps}`
  );

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
        touchAction: "none",
      }}
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
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
          outline: "none",
          touchAction: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <span style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line-strong)", display: "block" }} />
        </div>

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
                  {priceLabel}
                  <span style={{ opacity: 0.7, fontWeight: 600, fontSize: 11 }}>{currency}</span>
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--ink-muted)",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  {t("wine.page").toUpperCase()} · {t("common.pagina")} {wine.pagina_carta}
                </span>
              </div>
              {currency !== "ARS" && (
                <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-muted)" }}>
                  {formatPrice(wine.precio, "ARS", "official")} ARS · {t("settings.rate")}: {rateType === "official" ? t("settings.rateOfficial") : t("settings.rateBlue")}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label={t("wine.close")}
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

        <div style={{ overflow: "auto", padding: 16, display: "grid", gap: 14, WebkitOverflowScrolling: "touch" }}>
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
            <div style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)" }}>{t("wine.detailTitle")}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>{t("wine.bodega")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{wine.bodega}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>{t("wine.categoria")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{wine.categoria_carta}</div>
              </div>
              {wine.anada && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>{t("wine.vintage")}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{String(wine.anada)}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>{t("wine.page")} CARTA</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{wine.pagina_carta}</div>
              </div>
            </div>

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
              <strong style={{ color: "var(--navy)" }}>{t("wine.sourceTitle")}</strong> {t("wine.sourceDesc")}
              {wine.notas_validacion && (
                <>
                  <br />
                  <span style={{ color: "var(--ink-muted)" }}>{t("wine.note")}</span> {wine.notas_validacion}
                </>
              )}
            </div>
          </div>

          {/* FASE 7 — Ficha de cata (render condicional por disponibilidad real) */}
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
            <div style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)" }}>
              {t("wine.tastingTitle")}
            </div>

            {hasTastingContent ? (
              <>
                {tastingAromas.length > 0 && (
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>
                      {t("wine.tastingAromas")}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {tastingAromas.map((a) => (
                        <span
                          key={a}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid var(--line-strong)",
                            background: "var(--paper)",
                            color: "var(--ink)",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tastingRows.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {tastingRows.map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginTop: 2, lineHeight: 1.4 }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tastingPairings.length > 0 && (
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.06em", fontWeight: 700 }}>
                      {t("wine.tastingPairings")}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {tastingPairings.map((pr) => (
                        <span
                          key={pr}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid var(--line-strong)",
                            background: "var(--paper)",
                            color: "var(--ink)",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {pr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tastingSourceLabel && (
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.4 }}>
                    ✓ {tastingSourceLabel}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                {t("wine.tastingEmpty")}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 8, opacity: 0.92 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)" }}>{t("wine.soon")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: t("wine.cepa"), soon: true },
                { label: t("wine.estilo"), soon: true },
                { label: t("wine.maridaje"), soon: true },
                { label: t("wine.ocasion"), soon: true },
                { label: t("wine.pack"), soon: true },
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
                  {chip.label} <span style={{ fontSize: 10, opacity: 0.7 }}>{t("wine.soonBadge")}</span>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <button
              type="button"
              className={`ws-sel-btn${inSelection ? " is-selected" : ""}`}
              onClick={handleToggleSelection}
              aria-pressed={inSelection}
              disabled={!selectable}
              aria-label={
                inSelection
                  ? t("selection.removeAria", {
                      nombre: wine.nombre_completo_visible,
                      nome: wine.nombre_completo_visible,
                      name: wine.nombre_completo_visible,
                    })
                  : t("selection.addAria", {
                      nombre: wine.nombre_completo_visible,
                      nome: wine.nombre_completo_visible,
                      name: wine.nombre_completo_visible,
                    })
              }
            >
              <SelectionBookmarkIcon filled={inSelection} />
              <span className="ws-sel-btn-label" aria-live="polite">
                {selFeedback === "added"
                  ? `✓ ${t("selection.added")}`
                  : selFeedback === "removed"
                    ? t("selection.removed")
                    : inSelection
                      ? t("selection.removeCta")
                      : t("selection.add")}
              </span>
            </button>

            {waHref !== null && (
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
                <span aria-hidden>💬</span> {t("wine.shareWA")}
              </a>
            )}

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
                📍 {t("wine.howToArrive")}
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
            {t("wine.stock", { id: wine.id, page: wine.pagina_carta, currency })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FASE 5C — Marcador del CTA: contorno (no seleccionado) / relleno (seleccionado).
 * Diferencia de estado no dependiente solo del color: figura + texto + aria-pressed.
 */
function SelectionBookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="ws-sel-btn-ico"
    >
      <path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
    </svg>
  );
}
