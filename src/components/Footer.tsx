import { business } from "../data/business";
import { useTranslation } from "../hooks/useTranslation";
import { useLocale } from "../context/LocaleContext";

export function Footer() {
  const { t } = useTranslation();
  const { currency } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: 32,
        background: "var(--navy-deep)",
        color: "var(--paper-warm)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="container" style={{ paddingTop: 28, paddingBottom: 28 }}>
        <div
          style={{
            display: "grid",
            gap: 18,
            gridTemplateColumns: "1fr",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "ui-serif, Georgia, serif",
                fontWeight: 800,
                letterSpacing: "0.10em",
                color: "var(--paper-warm)",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "var(--gold)",
                  color: "var(--navy-deep)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                }}
              >
                V
              </span>
              {business.name}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,253,248,0.72)", lineHeight: 1.5 }}>
              {t("footer.address")} · {t("footer.hours")}
              <br />
              {t("footer.description")}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a
              href={business.maps}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 40,
                padding: "0 14px",
                borderRadius: 999,
                background: "var(--paper-warm)",
                color: "var(--navy)",
                fontWeight: 800,
                fontSize: 13,
                border: "1px solid var(--line)",
              }}
            >
              📍 {t("footer.viewMaps")}
            </a>
            <a
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 40,
                padding: "0 14px",
                borderRadius: 999,
                background: "transparent",
                color: "var(--paper-warm)",
                fontWeight: 700,
                fontSize: 13,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              Instagram {business.instagramHandle}
            </a>
          </div>

          <div
            style={{
              paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 10,
              fontSize: 11,
              color: "rgba(255,253,248,0.62)",
              letterSpacing: "0.06em",
            }}
          >
            <span>{t("footer.rights", { year })}</span>
            <span>
              {t("footer.source")} {currency !== "ARS" ? ` · ${currency} · ${t("settings.referenceNote")}` : ""}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
