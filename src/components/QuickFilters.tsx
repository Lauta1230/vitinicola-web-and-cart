import { useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import type { FacetKey } from "../data/styleFacets";

type Props = {
  active: FacetKey;
  onSelect: (f: FacetKey) => void;
  counts: Record<FacetKey, number>;
};

const ORDER: FacetKey[] = [
  "all",
  "malbec",
  "cabernetSauvignon",
  "whiteOrRose",
  "sparkling",
  "authorBoutique",
];

const LABEL_KEY: Record<FacetKey, string> = {
  all: "filters.all",
  malbec: "filters.malbec",
  cabernetSauvignon: "filters.cabernet",
  whiteOrRose: "filters.whiteRose",
  sparkling: "filters.sparkling",
  authorBoutique: "filters.author",
};

export function QuickFilters({ active, onSelect, counts }: Props) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      style={{
        background: "var(--paper-warm)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "10px 10px 8px",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.10em",
          fontWeight: 800,
          color: "var(--gold-muted)",
          marginBottom: 8,
          paddingLeft: 2,
        }}
      >
        {t("filters.barTitle")}
      </div>

      <div
        ref={scrollRef}
        role="tablist"
        aria-label={t("filters.barTitle")}
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 4,
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
        onWheel={(e) => {
          const el = scrollRef.current;
          if (!el) return;
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
          if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
            el.scrollLeft += e.deltaY;
            const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
            if (!atStart && !atEnd) e.preventDefault();
          }
        }}
      >
        {ORDER.map((key) => {
          const isActive = active === key;
          const label = t(LABEL_KEY[key]);
          // Mostrar conteo solo como aria, no visual para mantener estética carta
          const count = counts[key];
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-pressed={isActive}
              onClick={() => onSelect(key)}
              style={{
                flex: "0 0 auto",
                height: 34,
                padding: "0 14px",
                borderRadius: 999,
                border: `1px solid ${isActive ? "var(--navy)" : "var(--line-strong)"}`,
                background: isActive ? "var(--navy)" : "var(--white)",
                color: isActive ? "var(--paper-warm)" : "var(--ink-soft)",
                fontSize: 13,
                fontWeight: isActive ? 800 : 700,
                whiteSpace: "nowrap",
                cursor: "pointer",
                letterSpacing: isActive ? "0.02em" : "0em",
                boxShadow: isActive ? "0 4px 12px rgba(15,46,64,0.12)" : "none",
                transition: "background 0.12s, color 0.12s, border-color 0.12s, transform 0.12s",
                transform: isActive ? "translateY(-1px)" : "none",
              }}
              title={`${label} · ${count} ${t("common.etiquetas")}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
