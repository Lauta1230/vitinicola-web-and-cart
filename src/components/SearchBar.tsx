type Props = {
  value: string;
  onChange: (v: string) => void;
  total: number;
  filteredCount: number;
  bodegaActiva: string | null;
  onClearBodega: () => void;
};

export function SearchBar({ value, onChange, total, filteredCount, bodegaActiva, onClearBodega }: Props) {
  const hasQuery = value.trim().length > 0;
  const showingFiltered = filteredCount !== total || bodegaActiva;

  return (
    <div
      style={{
        background: "var(--paper-warm)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 12,
        boxShadow: "var(--shadow)",
      }}
    >
      <label htmlFor="search-vinos" style={{ position: "absolute", left: -9999, top: -9999 }}>
        Buscar vinos
      </label>
      <div style={{ position: "relative" }}>
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-muted)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20 L16.5 16.5" />
          </svg>
        </span>

        <input
          id="search-vinos"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar vino o bodega… Ej: Quimera, Catena, Malbec"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%",
            height: 44,
            padding: "0 44px 0 40px",
            borderRadius: 12,
            border: "1px solid var(--line-strong)",
            background: "var(--white)",
            color: "var(--ink)",
            fontSize: 15,
            outline: "none",
          }}
        />

        {value && (
          <button
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink-soft)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Meta */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--ink-muted)",
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 999,
              background: showingFiltered ? "var(--navy)" : "var(--paper-dark)",
              color: showingFiltered ? "var(--paper-warm)" : "var(--ink-soft)",
              border: `1px solid ${showingFiltered ? "var(--navy-soft)" : "var(--line)"}`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: showingFiltered ? "var(--gold)" : "var(--ink-muted)",
              }}
            />
            {filteredCount} de {total}
          </span>
          <span style={{ opacity: 0.6 }}>{hasQuery ? `para "${value}"` : bodegaActiva ? `en ${bodegaActiva}` : "etiquetas"}</span>
        </div>

        {bodegaActiva && (
          <button
            onClick={onClearBodega}
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 999,
              border: "1px solid var(--line-strong)",
              background: "var(--white)",
              color: "var(--navy)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ✕ {bodegaActiva}
          </button>
        )}
      </div>

      {hasQuery && (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-muted)", letterSpacing: "0.04em" }}>
          Tip: probá <strong style={{ color: "var(--ink-soft)" }}>"Quimera"</strong> → encuentra{" "}
          <em style={{ color: "var(--ink-soft)" }}>Achaval Ferrer Quimera Blend Blanco</em>
        </div>
      )}
    </div>
  );
}
