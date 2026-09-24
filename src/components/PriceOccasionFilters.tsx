import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useLocale } from "../context/LocaleContext";
import { MIN_PRICE, MAX_PRICE } from "../data/priceBands";
import type { OccasionFilter } from "../data/priceBands";
import { formatPrice } from "../utils/formatPrice";

type Props = {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  occasion: OccasionFilter;
  onOccasionChange: (occ: OccasionFilter) => void;
};

export function PriceOccasionFilters({ priceRange, onPriceRangeChange, occasion, onOccasionChange }: Props) {
  const { t } = useTranslation();
  const { currency, rateType } = useLocale();
  const [minInput, setMinInput] = useState(String(priceRange[0]));
  const [maxInput, setMaxInput] = useState(String(priceRange[1]));
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMinInput(String(priceRange[0]));
    setMaxInput(String(priceRange[1]));
  }, [priceRange]);

  const handleMinChange = (v: number) => {
    const clamped = Math.max(MIN_PRICE, Math.min(v, priceRange[1] - 1000));
    onPriceRangeChange([clamped, priceRange[1]]);
  };
  const handleMaxChange = (v: number) => {
    const clamped = Math.min(MAX_PRICE, Math.max(v, priceRange[0] + 1000));
    onPriceRangeChange([priceRange[0], clamped]);
  };

  const handleMinInputBlur = () => {
    const v = parseInt(minInput.replace(/\D/g, ""), 10);
    if (isNaN(v)) {
      setMinInput(String(priceRange[0]));
      return;
    }
    const clamped = Math.max(MIN_PRICE, Math.min(v, priceRange[1] - 1000));
    onPriceRangeChange([clamped, priceRange[1]]);
    setMinInput(String(clamped));
  };
  const handleMaxInputBlur = () => {
    const v = parseInt(maxInput.replace(/\D/g, ""), 10);
    if (isNaN(v)) {
      setMaxInput(String(priceRange[1]));
      return;
    }
    const clamped = Math.min(MAX_PRICE, Math.max(v, priceRange[0] + 1000));
    onPriceRangeChange([priceRange[0], clamped]);
    setMaxInput(String(clamped));
  };

  // Slider positions for visual track
  const minPercent = ((priceRange[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const maxPercent = ((priceRange[1] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  // Display range in ARS (base) — currency only affects catalog prices, not filter
  const displayMin = formatPrice(priceRange[0], "ARS", "official");
  const displayMax = formatPrice(priceRange[1], "ARS", "official");
  // Also show converted if currency != ARS for reference
  const convertedMin = currency !== "ARS" ? formatPrice(priceRange[0], currency, rateType) : null;
  const convertedMax = currency !== "ARS" ? formatPrice(priceRange[1], currency, rateType) : null;

  return (
    <div
      style={{
        background: "var(--paper-warm)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "12px 12px 10px",
        boxShadow: "var(--shadow)",
        display: "grid",
        gap: 12,
      }}
    >
      {/* Ocasión */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: "0.10em", fontWeight: 800, color: "var(--gold-muted)", marginBottom: 8 }}>
          {t("price.occasionTitle")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {(["everyday", "gift", "collection"] as OccasionFilter[]).map((key) => {
            const isActive = occasion === key;
            const short =
              key === "everyday" ? t("price.everydayShort") : key === "gift" ? t("price.giftShort") : t("price.collectionShort");
            const label =
              key === "everyday" ? t("price.everyday") : key === "gift" ? t("price.gift") : t("price.collection");
            return (
              <button
                key={key}
                onClick={() => onOccasionChange(isActive ? "all" : key)}
                aria-pressed={isActive}
                style={{
                  minHeight: 56,
                  padding: "8px 6px",
                  borderRadius: 12,
                  border: isActive ? "1px solid var(--navy)" : "1px solid var(--line)",
                  background: isActive ? "var(--navy)" : "var(--white)",
                  color: isActive ? "var(--paper-warm)" : "var(--ink-soft)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  textAlign: "center",
                  boxShadow: isActive ? "0 4px 12px rgba(15,46,64,0.12)" : "none",
                  transform: isActive ? "translateY(-1px)" : "none",
                  transition: "all 120ms ease",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.04em" }}>{short}</span>
                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 600, lineHeight: 1.1 }}>{label}</span>
                <span style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>
                  {key === "everyday"
                    ? t("price.everydayDesc")
                    : key === "gift"
                    ? t("price.giftDesc")
                    : t("price.collectionDesc")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--line)", opacity: 0.9 }} />

      {/* Precio */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.10em", fontWeight: 800, color: "var(--gold-muted)" }}>
            {t("price.title").toUpperCase()}
          </span>
          <span style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600 }}>
            {t("price.rangeSelected")}: {displayMin} — {displayMax}
          </span>
        </div>

        {/* Slider track */}
        <div style={{ position: "relative", height: 44, display: "flex", alignItems: "center" }} ref={trackRef}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 4,
              background: "var(--line)",
              borderRadius: 999,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
              height: 4,
              background: "var(--gold)",
              borderRadius: 999,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          {/* Min thumb */}
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={1000}
            value={priceRange[0]}
            onChange={(e) => handleMinChange(parseInt(e.target.value, 10))}
            aria-label={t("price.from")}
            style={{
              position: "absolute",
              width: "100%",
              height: 44,
              appearance: "none",
              WebkitAppearance: "none",
              background: "transparent",
              pointerEvents: "none",
              margin: 0,
            }}
          />
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={1000}
            value={priceRange[1]}
            onChange={(e) => handleMaxChange(parseInt(e.target.value, 10))}
            aria-label={t("price.to")}
            style={{
              position: "absolute",
              width: "100%",
              height: 44,
              appearance: "none",
              WebkitAppearance: "none",
              background: "transparent",
              pointerEvents: "none",
              margin: 0,
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              -webkit-appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 999px;
              background: var(--navy);
              border: 2px solid var(--gold);
              box-shadow: 0 2px 8px rgba(15,46,64,0.18);
              cursor: pointer;
              pointer-events: auto;
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 999px;
              background: var(--navy);
              border: 2px solid var(--gold);
              box-shadow: 0 2px 8px rgba(15,46,64,0.18);
              cursor: pointer;
              pointer-events: auto;
            }
            @media (prefers-reduced-motion: reduce) {
              * { transition: none !important; }
            }
          `}</style>
        </div>

        {/* Inputs Desde/Hasta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.06em", fontWeight: 700, color: "var(--ink-muted)" }}>{t("price.from")}</span>
            <input
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={handleMinInputBlur}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              inputMode="numeric"
              style={{
                height: 36,
                padding: "0 10px",
                borderRadius: 10,
                border: "1px solid var(--line-strong)",
                background: "var(--white)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
                outline: "none",
                width: "100%",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.06em", fontWeight: 700, color: "var(--ink-muted)" }}>{t("price.to")}</span>
            <input
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={handleMaxInputBlur}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              inputMode="numeric"
              style={{
                height: 36,
                padding: "0 10px",
                borderRadius: 10,
                border: "1px solid var(--line-strong)",
                background: "var(--white)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
                outline: "none",
                width: "100%",
              }}
            />
          </label>
        </div>

        {convertedMin && convertedMax && (
          <div style={{ marginTop: 6, fontSize: 10, color: "var(--ink-muted)", textAlign: "center" }}>
            {convertedMin} — {convertedMax} <span style={{ opacity: 0.7 }}>({currency} · {t("settings.referenceNote")})</span>
          </div>
        )}

        {(priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <button
              onClick={() => onPriceRangeChange([MIN_PRICE, MAX_PRICE])}
              style={{
                height: 28,
                padding: "0 12px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "var(--white)",
                color: "var(--ink-muted)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("price.clearRange")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
