import { useEffect, useMemo, useRef, useState } from "react";
import { bodegaList } from "../data/catalog";
import { useTranslation } from "../hooks/useTranslation";

type Props = {
  totalBodegas: number;
  activeBodega: string | null;
  onSelect: (name: string | null) => void;
};

export function WineryExplorer({ totalBodegas, activeBodega, onSelect }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!q) return bodegaList;
    return bodegaList.filter((b) => b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const b of filtered) {
      const letter = b.name[0]?.toUpperCase() ?? "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(b);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      const input = sheetRef.current?.querySelector("input") as HTMLElement | null;
      input?.focus({ preventScroll: true } as unknown as FocusOptions);
    });
    return () => {
      document.body.style.overflow = prevOverflow;
      if (Math.abs(window.scrollY - scrollY) > 2) {
        window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
      }
    };
  }, [open]);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "var(--paper-warm)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow: "var(--shadow)",
        }}
      >
        <button
          onClick={() => setOpen(true)}
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "0 14px",
            borderRadius: 12,
            border: "1px solid var(--line-strong)",
            background: "var(--white)",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--navy)",
                color: "var(--gold)",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              113
            </span>
            <span style={{ minWidth: 0, textAlign: "left" }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: "var(--navy)", lineHeight: 1 }}>
                {activeBodega ? activeBodega : t("winery.explore")}
              </span>
              <span style={{ display: "block", fontSize: 11, color: "var(--ink-muted)", lineHeight: 1, marginTop: 2 }}>
                {activeBodega ? t("winery.exploreActive") : t("winery.subtitle", { total: totalBodegas })}
              </span>
            </span>
          </span>
          <span style={{ color: "var(--ink-muted)", fontSize: 12 }}>▾</span>
        </button>

        <button
          onClick={() => onSelect(null)}
          style={{
            flex: "0 0 auto",
            height: 40,
            padding: "0 14px",
            borderRadius: 12,
            border: `1px solid ${activeBodega ? "var(--line)" : "var(--navy)"}`,
            background: activeBodega ? "var(--white)" : "var(--navy)",
            color: activeBodega ? "var(--ink-soft)" : "var(--paper-warm)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t("winery.all")}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            fontWeight: 700,
            color: "var(--ink-muted)",
            marginBottom: 8,
            paddingLeft: 2,
          }}
        >
          {t("winery.featured")}
        </div>
        <div
          ref={listRef}
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: 6,
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch",
          }}
          onWheel={(e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            const el = listRef.current;
            if (!el) return;
            if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
              el.scrollLeft += e.deltaY;
              const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
              const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
              if (!atStart && !atEnd) e.preventDefault();
            }
          }}
        >
          {[
            "Catena Zapata",
            "Viña Cobos",
            "Zuccardi",
            "El Enemigo",
            "Luigi Bosca",
            "Rutini",
            "Trapiche",
            "Salentein",
            "Bemberg",
            "Susana Balbo",
          ]
            .map((name) => {
              const alias: Record<string, string> = {
                Zuccardi: "Familia Zuccardi",
                "El Enemigo": "Enemigo Wines",
              };
              const real = alias[name] ?? name;
              return bodegaList.find((b) => b.name === real || b.name.includes(name))?.name ?? null;
            })
            .filter(Boolean)
            .slice(0, 8)
            .map((name) => {
              const isActive = activeBodega === name;
              return (
                <button
                  key={name!}
                  onClick={() => onSelect(name!)}
                  style={{
                    flex: "0 0 auto",
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 999,
                    border: `1px solid ${isActive ? "var(--navy)" : "var(--line-strong)"}`,
                    background: isActive ? "var(--navy)" : "var(--white)",
                    color: isActive ? "var(--paper-warm)" : "var(--ink-soft)",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              );
            })}
          <button
            onClick={() => setOpen(true)}
            style={{
              flex: "0 0 auto",
              height: 32,
              padding: "0 12px",
              borderRadius: 999,
              border: "1px dashed var(--line-strong)",
              background: "transparent",
              color: "var(--ink-muted)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("winery.viewAll")}
          </button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("winery.title")}
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
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
              maxHeight: "84vh",
              background: "var(--paper-warm)",
              borderRadius: "20px 20px 16px 16px",
              boxShadow: "var(--shadow-strong)",
              border: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--line)", background: "var(--paper-warm)" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <span style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line-strong)", display: "block" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "ui-serif, Georgia, serif", fontWeight: 800, color: "var(--navy)", fontSize: 16, lineHeight: 1 }}>
                    {t("winery.title")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{t("winery.subtitle", { total: totalBodegas })} · {filtered.length} {t("common.etiquetas")}</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t("winery.close")}
                  style={{
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

              <div style={{ position: "relative", marginTop: 12 }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--ink-muted)",
                  }}
                >
                  ⌕
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("winery.filterPlaceholder")}
                  autoFocus
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 12px 0 36px",
                    borderRadius: 12,
                    border: "1px solid var(--line-strong)",
                    background: "var(--white)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 999,
                    border: activeBodega === null ? "1px solid var(--navy)" : "1px solid var(--line)",
                    background: activeBodega === null ? "var(--navy)" : "var(--white)",
                    color: activeBodega === null ? "var(--paper-warm)" : "var(--ink-soft)",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {t("winery.allBodegas")}
                </button>
                {activeBodega && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      height: 32,
                      padding: "0 10px",
                      borderRadius: 999,
                      background: "var(--paper-dark)",
                      border: "1px solid var(--line)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {t("winery.active")} {activeBodega}
                  </span>
                )}
              </div>
            </div>

            <div style={{ overflow: "auto", padding: "8px 8px 16px", WebkitOverflowScrolling: "touch" }}>
              {grouped.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--ink-muted)", fontSize: 14 }}>{t("winery.noResults", { query })}</div>
              ) : (
                grouped.map(([letter, items]) => (
                  <div key={letter} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "var(--paper-warm)",
                        padding: "6px 8px",
                        fontSize: 11,
                        letterSpacing: "0.10em",
                        fontWeight: 800,
                        color: "var(--gold-muted)",
                        borderBottom: "1px solid var(--line)",
                        marginBottom: 6,
                      }}
                    >
                      {letter}
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {items.map((b) => {
                        const isActive = activeBodega === b.name;
                        return (
                          <button
                            key={b.name}
                            onClick={() => {
                              onSelect(b.name);
                              setOpen(false);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 10,
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 12px",
                              borderRadius: 14,
                              border: `1px solid ${isActive ? "var(--navy)" : "var(--line)"}`,
                              background: isActive ? "var(--navy)" : "var(--white)",
                              cursor: "pointer",
                              boxShadow: isActive ? "0 6px 16px rgba(15,46,64,0.12)" : "none",
                            }}
                          >
                            <span style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: isActive ? "var(--paper-warm)" : "var(--ink)",
                                  lineHeight: 1.2,
                                }}
                              >
                                {b.name}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 11,
                                  color: isActive ? "rgba(255,253,248,0.72)" : "var(--ink-muted)",
                                  marginTop: 2,
                                }}
                              >
                                {t("winery.countEtiquetas", { count: b.count })} · {t("common.pagina")} {b.pagina}
                              </span>
                            </span>
                            <span
                              style={{
                                flex: "0 0 auto",
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                display: "grid",
                                placeItems: "center",
                                background: isActive ? "var(--gold)" : "var(--paper-dark)",
                                color: isActive ? "var(--navy)" : "var(--ink-muted)",
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              {isActive ? "✓" : "›"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                padding: "10px 16px 16px",
                borderTop: "1px solid var(--line)",
                background: "var(--paper-warm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.4 }}>{t("winery.tip")}</div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: "0 0 auto",
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
                {t("winery.done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
