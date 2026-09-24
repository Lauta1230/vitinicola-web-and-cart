import { useEffect, useRef, useState } from "react";
import { useLocale } from "../context/LocaleContext";
import { useTranslation } from "../hooks/useTranslation";
import { langLabels } from "../data/translations";
import type { Currency, Lang, RateType } from "../data/translations";

type Props = {
  triggerLabel?: string;
};

export function LocaleSettingsSheet({ triggerLabel }: Props) {
  const { lang, currency, rateType, setLang, setCurrency, setRateType } = useLocale();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const isARS = currency === "ARS";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      sheetRef.current?.focus({ preventScroll: true } as unknown as FocusOptions);
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (Math.abs(window.scrollY - scrollY) > 2) {
        window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
      }
    };
  }, [open]);

  const currentLabel = `${langLabels[lang].split(" ")[0]} ${lang.toUpperCase()} · ${currency === "ARS" ? "$" : currency === "BRL" ? "R$" : "U$S"} ${currency}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("header.settings")}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 10px",
          borderRadius: 999,
          border: "1px solid var(--line-strong)",
          background: "var(--white)",
          color: "var(--navy)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.06em",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flex: "0 0 auto",
        }}
      >
        <span aria-hidden>{lang === "es" ? "🇦🇷" : lang === "pt" ? "🇧🇷" : "🇺🇸"}</span>
        <span>{triggerLabel ?? currentLabel}</span>
        <span aria-hidden style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("settings.title")}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 65,
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
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "84vh",
              background: "var(--paper-warm)",
              borderRadius: "20px 20px 16px 16px",
              boxShadow: "var(--shadow-strong)",
              border: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              outline: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
              <span style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line-strong)", display: "block" }} />
            </div>

            <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "ui-serif, Georgia, serif", fontWeight: 800, color: "var(--navy)", fontSize: 16, lineHeight: 1 }}>
                    {t("settings.title")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{t("settings.subtitle")}</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t("settings.close")}
                  style={{
                    width: 32,
                    height: 32,
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

            <div style={{ overflow: "auto", padding: 16, display: "grid", gap: 18, WebkitOverflowScrolling: "touch" }}>
              {/* Idioma */}
              <section>
                <div style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)", marginBottom: 8 }}>
                  {t("settings.language").toUpperCase()}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {(["es", "pt", "en"] as Lang[]).map((l) => {
                    const active = lang === l;
                    return (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        aria-pressed={active}
                        style={{
                          height: 44,
                          borderRadius: 12,
                          border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                          background: active ? "var(--navy)" : "var(--white)",
                          color: active ? "var(--paper-warm)" : "var(--ink)",
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{l === "es" ? "🇦🇷" : l === "pt" ? "🇧🇷" : "🇺🇸"}</span>
                        <span style={{ fontSize: 12 }}>{l.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Moneda */}
              <section>
                <div style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)", marginBottom: 8 }}>
                  {t("settings.currency").toUpperCase()}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {(["ARS", "BRL", "USD"] as Currency[]).map((c) => {
                    const active = currency === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        aria-pressed={active}
                        style={{
                          height: 44,
                          borderRadius: 12,
                          border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                          background: active ? "var(--navy)" : "var(--white)",
                          color: active ? "var(--paper-warm)" : "var(--ink)",
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 900 }}>{c === "ARS" ? "$" : c === "BRL" ? "R$" : "U$S"}</span>
                        <span style={{ fontSize: 11, opacity: active ? 0.9 : 0.7 }}>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Tipo de cambio */}
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.10em", fontWeight: 800, color: "var(--ink-muted)" }}>
                    {t("settings.rate").toUpperCase()}
                  </span>
                  {isARS && (
                    <span style={{ fontSize: 10, color: "var(--ink-muted)", background: "var(--paper-dark)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 999 }}>
                      {t("settings.rateDisabledHint")}
                    </span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, opacity: isARS ? 0.6 : 1 }}>
                  {(["official", "blue"] as RateType[]).map((r) => {
                    const active = rateType === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRateType(r)}
                        disabled={isARS && false} // no realmente deshabilitado, solo visual
                        aria-pressed={active}
                        style={{
                          height: 40,
                          borderRadius: 12,
                          border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                          background: active ? "var(--navy)" : "var(--white)",
                          color: active ? "var(--paper-warm)" : "var(--ink-soft)",
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: isARS ? "not-allowed" : "pointer",
                          opacity: isARS && !active ? 0.7 : 1,
                        }}
                      >
                        {r === "official" ? t("settings.rateOfficial") : t("settings.rateBlue")}
                      </button>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "rgba(201,168,106,0.10)",
                    border: "1px solid rgba(201,168,106,0.18)",
                    fontSize: 11,
                    color: "var(--ink-soft)",
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: "var(--navy)" }}>⚠</strong> {t("settings.referenceNote")}
                </div>
              </section>
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "1px solid var(--navy)",
                  background: "var(--navy)",
                  color: "var(--paper-warm)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t("settings.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
