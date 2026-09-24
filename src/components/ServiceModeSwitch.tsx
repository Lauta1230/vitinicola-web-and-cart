import type { ServiceMode } from "../hooks/useTableContext";
import { useTranslation } from "../hooks/useTranslation";

/**
 * FASE 5A — Selector de contexto de servicio (segmented control)
 *
 * "Tomar acá" (bar) / "Llevar / Regalar" (takeaway).
 * Compacto, editorial, táctil (≥44px). Sin modal ni overlay.
 * Estados: default / hover / pressed / focus / selected / disabled (CSS en global.css).
 * Señal de selección NO solo cromática: puldeslizante + peso tipográfico + aria-pressed.
 * El cambio de modo es puro estado: no filtra, no scrollea, no toca locale.
 */

type Props = {
  mode: ServiceMode;
  onChange: (mode: ServiceMode) => void;
  disabled?: boolean;
};

function GlassIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="svc-ico"
    >
      <path d="M8 21h8" />
      <path d="M12 15v6" />
      <path d="M7 3h10l-.7 8.05A4.7 4.7 0 0 1 12 15a4.7 4.7 0 0 1-4.3-3.95L7 3Z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="svc-ico"
    >
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M12 10v10" />
      <path d="M4 10h16" />
      <path d="M12 10c-4.5 0-6-1.8-6-3.4C6 5.1 7.2 4 8.6 4 10.6 4 12 6.4 12 10Z" />
      <path d="M12 10c4.5 0 6-1.8 6-3.4C18 5.1 16.8 4 15.4 4 13.4 4 12 6.4 12 10Z" />
    </svg>
  );
}

export function ServiceModeSwitch({ mode, onChange, disabled = false }: Props) {
  const { t } = useTranslation();

  return (
    <div className="svc-wrap">
      <span className="svc-prompt" id="svc-prompt">
        {t("service.prompt")}
      </span>
      <div className="svc-switch" role="group" aria-labelledby="svc-prompt">
        <span className="svc-thumb" data-pos={mode} aria-hidden />
        <button
          type="button"
          className="svc-btn"
          aria-pressed={mode === "bar"}
          disabled={disabled}
          onClick={() => onChange("bar")}
        >
          <GlassIcon />
          <span className="svc-label">{t("service.here")}</span>
        </button>
        <button
          type="button"
          className="svc-btn"
          aria-pressed={mode === "takeaway"}
          disabled={disabled}
          onClick={() => onChange("takeaway")}
        >
          <GiftIcon />
          <span className="svc-label">{t("service.takeaway")}</span>
        </button>
      </div>
    </div>
  );
}
