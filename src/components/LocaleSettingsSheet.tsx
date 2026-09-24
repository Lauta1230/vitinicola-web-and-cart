import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const isARS = currency === "ARS";

  // Posicionamiento contextual anclado al botón
  const updatePosition = () => {
    const btn = buttonRef.current;
    const pop = popoverRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const gap = 8;
    const popH = pop ? pop.offsetHeight : 260;

    // Ancho: min(92vw, 320px)
    const width = Math.min(Math.floor(viewportW * 0.92), 320);

    // Horizontal: alineado al borde derecho del botón
    let left = rect.right - width;
    // No salir por laterales
    left = Math.max(8, Math.min(left, viewportW - width - 8));

    // Vertical: debajo del botón
    let top = rect.bottom + gap;
    // Si no entra debajo, reposicionar arriba
    if (top + popH + 8 > viewportH) {
      const above = rect.top - popH - gap;
      if (above >= 8) top = above;
      else top = Math.max(8, viewportH - popH - 8);
    }

    setPos({ top, left, width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    // Calcular en próximo frame para tener medidas
    const id = requestAnimationFrame(() => updatePosition());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => updatePosition();
    const onScroll = () => {
      // Header es sticky, el botón no se mueve con scroll vertical de la página,
      // pero si el usuario hace scroll, el popover debe seguir anclado.
      // Como usamos fixed y Header es sticky, la posición sigue válida sin recalcular
      // en cada scroll; solo recalculamos en resize.
      // Para seguridad, recalculamos en scroll también, pero sin forzar layout excesivo.
      updatePosition();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  // ESC + click fuera
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true } as any);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Focus sin mover viewport
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const first = popoverRef.current?.querySelector("button") as HTMLElement | null;
      first?.focus({ preventScroll: true } as any);
    });
  }, [open]);

  const currentLabel = `${langLabels[lang].split(" ")[0]} ${lang.toUpperCase()} · ${currency === "ARS" ? "$" : currency === "BRL" ? "R$" : "U$S"} ${currency}`;

  const popover = open ? (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={t("settings.title")}
      tabIndex={-1}
      style={{
        position: "fixed",
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        width: pos ? pos.width : 320,
        maxWidth: "min(92vw, 320px)",
        background: "var(--paper-warm)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(15,46,64,0.14), 0 2px 8px rgba(15,46,64,0.08)",
        zIndex: 100,
        overflow: "hidden",
        outline: "none",
        opacity: pos ? 1 : 0,
        transform: pos ? "translateY(0)" : "translateY(-4px)",
        transition: "opacity 150ms ease, transform 150ms ease",
        // Para no heredar stacking del Header
        filter: "none",
        backdropFilter: "none",
      }}
    >
      <div style={{ padding: "12px 12px 10px", display: "grid", gap: 12 }}>
        {/* IDIOMA */}
        <section>
          <div style={{ fontSize: 10, letterSpacing: "0.10em", fontWeight: 800, color: "var(--gold-muted)", marginBottom: 8 }}>
            {t("settings.language").toUpperCase()}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {(["es", "pt", "en"] as Lang[]).map((l) => {
              const active = lang === l;
              const flag = l === "es" ? "🇦🇷" : l === "pt" ? "🇧🇷" : "🇺🇸";
              const name = l === "es" ? "Español" : l === "pt" ? "Português" : "English";
              return (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={active}
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 10px",
                    borderRadius: 10,
                    border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                    background: active ? "var(--navy)" : "var(--white)",
                    color: active ? "var(--paper-warm)" : "var(--ink)",
                    fontWeight: active ? 800 : 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{flag}</span>
                    <span>{name}</span>
                  </span>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background: active ? "var(--gold)" : "transparent",
                      color: active ? "var(--navy)" : "transparent",
                      border: active ? "1px solid var(--gold)" : "1px solid var(--line)",
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                    aria-hidden
                  >
                    {active ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div style={{ height: 1, background: "var(--line)", opacity: 0.9 }} />

        {/* MONEDA */}
        <section>
          <div style={{ fontSize: 10, letterSpacing: "0.10em", fontWeight: 800, color: "var(--gold-muted)", marginBottom: 8 }}>
            {t("settings.currency").toUpperCase()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {(["ARS", "BRL", "USD"] as Currency[]).map((c) => {
              const active = currency === c;
              return (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  aria-pressed={active}
                  style={{
                    height: 38,
                    borderRadius: 10,
                    border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                    background: active ? "var(--navy)" : "var(--white)",
                    color: active ? "var(--paper-warm)" : "var(--ink-soft)",
                    fontWeight: active ? 800 : 700,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{c === "ARS" ? "$" : c === "BRL" ? "R$" : "U$S"}</span>
                  <span style={{ fontSize: 10, opacity: active ? 0.9 : 0.7 }}>{c}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div style={{ height: 1, background: "var(--line)", opacity: 0.9 }} />

        {/* TIPO DE CAMBIO */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.10em", fontWeight: 800, color: "var(--gold-muted)" }}>
              {t("settings.rate").toUpperCase()}
            </span>
            {isARS && (
              <span style={{ fontSize: 9, color: "var(--ink-muted)", background: "var(--paper-dark)", border: "1px solid var(--line)", padding: "1px 6px", borderRadius: 999 }}>
                {t("settings.rateDisabledHint")}
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, opacity: isARS ? 0.6 : 1 }}>
            {(["official", "blue"] as RateType[]).map((r) => {
              const active = rateType === r;
              return (
                <button
                  key={r}
                  onClick={() => setRateType(r)}
                  aria-pressed={active}
                  style={{
                    height: 34,
                    borderRadius: 10,
                    border: active ? "1px solid var(--navy)" : "1px solid var(--line)",
                    background: active ? "var(--navy)" : "var(--white)",
                    color: active ? "var(--paper-warm)" : "var(--ink-soft)",
                    fontWeight: 800,
                    fontSize: 11,
                    cursor: isARS ? "not-allowed" : "pointer",
                    opacity: isARS && !active ? 0.7 : 1,
                  }}
                >
                  {r === "official" ? t("settings.rateOfficial") : t("settings.rateBlue")}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Nota compacta opcional, sutil */}
      <div
        style={{
          padding: "6px 12px 10px",
          fontSize: 10,
          color: "var(--ink-muted)",
          borderTop: "1px solid var(--line)",
          background: "rgba(201,168,106,0.06)",
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        {t("settings.referenceNote")}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          div[role="dialog"] { transition: none !important; }
        }
      `}</style>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
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
          border: open ? "1px solid var(--navy)" : "1px solid var(--line-strong)",
          background: open ? "var(--navy)" : "var(--white)",
          color: open ? "var(--paper-warm)" : "var(--navy)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.06em",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flex: "0 0 auto",
          boxShadow: open ? "0 2px 8px rgba(15,46,64,0.12)" : "none",
        }}
      >
        <span aria-hidden>{lang === "es" ? "🇦🇷" : lang === "pt" ? "🇧🇷" : "🇺🇸"}</span>
        <span>{triggerLabel ?? currentLabel}</span>
        <span aria-hidden style={{ fontSize: 10, opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "transform 120ms" }}>
          ▾
        </span>
      </button>

      {open && typeof document !== "undefined" ? createPortal(popover, document.body) : null}
    </>
  );
}
