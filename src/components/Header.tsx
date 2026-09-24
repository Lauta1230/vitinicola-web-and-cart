import { business } from "../data/business";

export function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(248, 245, 239, 0.96)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="container"
        style={{
          height: "var(--header-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <a
          href="#"
          aria-label="La Vinícola Mendoza - inicio"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--navy)",
              color: "var(--gold)",
              display: "grid",
              placeItems: "center",
              fontFamily: "ui-serif, Georgia, serif",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "0.04em",
              flex: "0 0 auto",
            }}
          >
            V
          </span>
          <span style={{ minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontFamily: "ui-serif, Georgia, serif",
                fontWeight: 800,
                fontSize: 12.5,
                letterSpacing: "0.14em",
                lineHeight: 1,
                color: "var(--navy)",
              }}
            >
              LA VINÍCOLA
            </span>
            <span
              style={{
                display: "block",
                fontSize: 10,
                letterSpacing: "0.10em",
                color: "var(--ink-muted)",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              MENDOZA · PEATONAL 110
            </span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
          <a
            href={business.maps}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir en Google Maps"
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
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span aria-hidden>📍</span>
            <span className="hide-mobile">Cómo llegar</span>
          </a>
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram La Vinícola"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "var(--navy)",
              color: "var(--gold-light)",
              border: "1px solid var(--navy-soft)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 641px) {
          .hide-mobile { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
