import { business } from "../data/business";
import { useTranslation } from "../hooks/useTranslation";
import { useLocale } from "../context/LocaleContext";

type HeroProps = {
  onExplore: () => void;
  totalWines: number;
  totalBodegas: number;
};

export function Hero({ onExplore }: HeroProps) {
  const { t } = useTranslation();
  const { currency, rateType } = useLocale();

  // Mostrar badge dinámico con moneda y tipo de cambio
  const currencyLabel = currency === "ARS" ? "ARS" : currency === "BRL" ? "BRL" : "USD";
  const rateLabel = currency === "ARS" ? "" : rateType === "official" ? " · OFICIAL" : " · BLUE";

  return (
    <section
      style={{
        background: `radial-gradient(900px 500px at 80% -10%, rgba(201,168,106,0.18), transparent 60%),
                     radial-gradient(800px 600px at 10% 120%, rgba(15,46,64,0.08), transparent 60%),
                     linear-gradient(180deg, #0F2E40 0%, #0A2230 100%)`,
        color: "var(--paper-warm)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='600' viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C9A86A' stroke-width='1.2'%3E%3Cpath d='M120 420 C140 360 180 320 220 300 C260 280 300 290 320 320 C340 350 330 390 300 410 C270 430 230 430 200 410 C170 390 140 360 120 420 Z'/%3E%3Cpath d='M220 300 C210 240 230 200 270 180 C310 160 350 170 360 210'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "720px",
          backgroundPosition: "right -120px top -80px",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          paddingTop: 28,
          paddingBottom: 28,
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--gold-light)",
            fontWeight: 600,
          }}
        >
          <span style={{ width: 28, height: 1, background: "var(--gold-muted)", display: "inline-block" }} />
          {t("hero.eyebrow")}
          <span style={{ width: 28, height: 1, background: "var(--gold-muted)", display: "inline-block" }} />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "ui-serif, Georgia, serif",
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "clamp(36px, 8vw, 56px)",
                letterSpacing: "0.08em",
                color: "var(--paper-warm)",
              }}
            >
              {business.heroTitle}
            </span>
            <span
              style={{
                display: "block",
                fontFamily: "ui-serif, Georgia, serif",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(28px, 7vw, 44px)",
                color: "var(--gold)",
                marginTop: 4,
              }}
            >
              {business.heroSubtitle}
            </span>
          </h1>
          <p
            style={{
              margin: 0,
              marginTop: 8,
              fontSize: "clamp(15px, 3.6vw, 18px)",
              color: "rgba(255,253,248,0.92)",
              fontWeight: 400,
              lineHeight: 1.45,
              maxWidth: 520,
            }}
          >
            {t("hero.claim")} — {t("hero.subclaim")}
            <br />
            <span style={{ color: "rgba(255,253,248,0.72)", fontSize: 13 }}>{t("hero.hours")}</span>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
            marginTop: 4,
          }}
        >
          <button
            onClick={onExplore}
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 999,
              border: "1px solid var(--gold)",
              background: "var(--gold)",
              color: "var(--navy-deep)",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "0.06em",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(201,168,106,0.28)",
            }}
          >
            {t("hero.cta")} →
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "rgba(255,253,248,0.84)",
              fontSize: 12,
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(6px)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#4ADE80",
                  boxShadow: "0 0 0 4px rgba(74,222,128,0.18)",
                }}
              />
              {t("hero.badge")} · {currencyLabel}
              {rateLabel}
            </span>
            <span style={{ opacity: 0.7 }}>•</span>
            <span>{t("hero.qr")}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            maxWidth: 560,
          }}
        >
          {[
            { k: t("hero.stats1k"), v: t("hero.stats1kLabel") },
            { k: t("hero.statsOff"), v: t("hero.statsOffLabel") },
            { k: t("hero.statsDegus"), v: t("hero.statsDegusLabel") },
          ].map((s) => (
            <div
              key={s.k}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                padding: "10px 12px",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontWeight: 800, color: "var(--gold-light)", fontSize: 14, lineHeight: 1 }}>{s.k}</div>
              <div style={{ fontSize: 11, color: "rgba(255,253,248,0.72)", letterSpacing: "0.06em", marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
