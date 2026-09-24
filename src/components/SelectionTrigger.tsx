import { useSelection } from "../context/SelectionContext";
import { useTranslation } from "../hooks/useTranslation";

/**
 * FASE 5B — Trigger compacto de "Mi selección".
 *
 * No asume posición: el contenedor (App) decide dónde ubicarlo.
 * Contador = cantidad de vinos DISTINCTOS (no botellas).
 * Representación compacta para cantidades grandes: 99+.
 */

function formatCount(n: number): string {
  if (n > 99) return "99+";
  return String(n);
}

function BookmarkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21 12 16.5 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

type Props = {
  /** Override opcional del contador (p.ej. para previews). Por defecto usa el contexto. */
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
};

export function SelectionTrigger({ count, onClick, disabled = false }: Props) {
  const { selectedCount, open } = useSelection();
  const { t } = useTranslation();
  const n = count ?? selectedCount;

  return (
    <button
      type="button"
      className="sel-trigger"
      onClick={onClick ?? open}
      disabled={disabled}
      aria-label={`${t("selection.openAria")}, ${t("selection.countMany", { count: n })}`}
    >
      <BookmarkIcon />
      <span className="sel-trigger-label">{t("selection.title")}</span>
      <span className="sel-trigger-sep" aria-hidden>
        ·
      </span>
      {/* key reinicia la micro-animación de actualización del contador */}
      <span key={n} className="sel-trigger-count" aria-hidden>
        {formatCount(n)}
      </span>
    </button>
  );
}
