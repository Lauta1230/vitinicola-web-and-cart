import { useEffect, useMemo, useRef, useState } from "react";
import type { Wine } from "../data/catalog";
import { allWines } from "../data/catalog";
import { useSelection } from "../context/SelectionContext";
import { useLocale } from "../context/LocaleContext";
import { formatPrice } from "../utils/formatPrice";
import { useTranslation } from "../hooks/useTranslation";
import type { ServiceMode } from "../hooks/useTableContext";
import {
  buildSelectionMessage,
  buildSelectionShareText,
  buildWhatsAppUrl,
  openWhatsAppExternal,
  resolveBusinessWhatsAppPhone,
  type SelectionLine,
} from "../utils/whatsapp";

/**
 * FASE 5B — Panel "Mi selección" (lista de preselección editorial).
 *
 * Consistente con WineSheet: mismo papel editorial, navy/gold, radios,
 * sombras, patrón de ESC/scroll-lock/foco inicial y click-fuera para cerrar.
 * Sin totales, sin cantidades, sin checkout: solo reconocer el vino y quitarlo.
 * La ficha completa sigue viviendo en WineSheet (que esta fase NO modifica).
 *
 * FASE 9 — Conversión (consultar → preparar solicitud → abrir WhatsApp):
 *  - "Consultar por WhatsApp" SOLO si hay vinos Y el negocio tiene número
 *    confirmado en config; si no, el CTA no existe (nunca un botón que falla).
 *  - "Compartir selección" (Web Share) o "Copiar selección" (fallback): la
 *    selección se comparte SIN mesa ni datos de sesión (B27).
 *  - El mensaje se construye SOLO al pulsar el CTA (B38) y la web NUNCA
 *    afirma que envió nada: abrir WhatsApp es todo lo que hace.
 */

// Índice id → vino creado UNA vez a nivel módulo (nunca por render).
const WINE_BY_ID: ReadonlyMap<string, Wine> = new Map(allWines.map((w) => [w.id, w]));

/** Duración de la animación de salida (ms). Debe coincidir con el CSS. */
const EXIT_MS = 140;

type Props = {
  /** CTA del empty state: cierra el panel y navega con la lógica existente de App. */
  onExplore?: () => void;
  /** Modo de servicio activo (App es la única fuente de verdad): ajusta el intro del mensaje. */
  serviceMode?: ServiceMode;
};

export function SelectionSheet({ onExplore, serviceMode = "takeaway" }: Props) {
  const { selectedIds, selectedCount, remove, clear, isOpen, close } = useSelection();
  const { currency, rateType } = useLocale();
  const { t } = useTranslation();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollYRef = useRef<number>(0);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<"copied" | "error" | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  // Cierre con animación de salida corta; luego cierra el estado real.
  const requestClose = () => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      close();
      return;
    }
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setClosing(false);
      close();
    }, EXIT_MS);
  };

  useEffect(
    () => () => {
      // Limpieza si el componente se desmonta a mitad de la animación.
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    },
    []
  );

  // Patrón idéntico a WineSheet: ESC, lock de scroll del body con restauración
  // exacta y foco inicial sin desplazar el documento.
  useEffect(() => {
    if (!isOpen) return;

    scrollYRef.current = window.scrollY;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      sheetRef.current?.focus({ preventScroll: true } as unknown as FocusOptions);
    });

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      const y = scrollYRef.current;
      if (Math.abs(window.scrollY - y) > 2) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
    };
    // requestClose es estable por fase (recreado por render); ESC solo necesita cerrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // IDs → vinos, memoizado; ID faltante del catálogo se filtra en silencio.
  const items = useMemo(
    () =>
      selectedIds
        .map((id) => WINE_BY_ID.get(id))
        .filter((w): w is Wine => w !== undefined),
    [selectedIds]
  );

  if (!isOpen) return null;

  const countLabel =
    selectedCount === 1 ? t("selection.countOne") : t("selection.countMany", { count: selectedCount });

  // El CTA se difiere hasta que el sheet restauró el overflow del body,
  // para que la navegación existente de App (scroll suave al ancla) funcione.
  const handleExploreCta = () => {
    window.setTimeout(() => onExplore?.(), 120);
    requestClose();
  };

  // ── FASE 9: conversión (todo se construye SOLO al pulsar el CTA) ──

  /** Teléfono del negocio ya normalizado; `null` → CTA comercial oculto. */
  const waPhone = resolveBusinessWhatsAppPhone();
  const canWebShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  /** Líneas del mensaje: SOLO datos reales (nombre, bodega, precio en moneda activa). */
  const selectionLines = (): SelectionLine[] =>
    items.map((w) => ({
      nombre: w.nombre_completo_visible,
      bodega: w.bodega ?? w.categoria_carta,
      precio: formatPrice(w.precio, currency, rateType),
    }));

  const showCopyFeedback = (state: "copied" | "error") => {
    setCopyFeedback(state);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      copyTimerRef.current = null;
      setCopyFeedback(null);
    }, 2200);
  };

  /** Fallback B26/B28: copiar al portapapeles con feedback honesto. */
  const handleCopyText = (text: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      showCopyFeedback("error");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => showCopyFeedback("copied"))
      .catch(() => showCopyFeedback("error"));
  };

  /** B26/B50: Web Share si existe; cancelar NO es error; fallo → copiar. */
  const handleShareSelection = () => {
    if (items.length === 0) return;
    const text = buildSelectionShareText({ t, wines: selectionLines() });
    if (canWebShare) {
      navigator
        .share({ text })
        .catch((err: unknown) => {
          if ((err as DOMException)?.name === "AbortError") return;
          handleCopyText(text);
        });
      return;
    }
    handleCopyText(text);
  };

  /** B6/B10: consulta al negocio. La web solo construye y abre: nunca "enviado". */
  const handleConsultWhatsApp = () => {
    if (waPhone === null || items.length === 0) return;
    const message = buildSelectionMessage({ t, wines: selectionLines(), currency, intent: serviceMode });
    const url = buildWhatsAppUrl(waPhone, message);
    if (url !== null) openWhatsAppExternal(url);
    // Sin feedback posterior (B36): el cambio de contexto a WhatsApp basta.
  };

  return (
    <div
      className={`sel-overlay${closing ? " is-closing" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className="sel-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sel-title"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="sel-handle" aria-hidden>
          <span />
        </div>

        <header className="sel-header">
          <div style={{ minWidth: 0 }}>
            <h2 id="sel-title" className="sel-title">
              {t("selection.title")}
            </h2>
            <p className="sel-count" aria-live="polite">
              {countLabel}
            </p>
          </div>
          <button type="button" className="sel-close" aria-label={t("settings.close")} onClick={requestClose}>
            ✕
          </button>
        </header>

        {items.length > 0 && (
          <div className="sel-toolbar">
            <span aria-hidden />
            <button type="button" className="sel-clear" onClick={clear}>
              {t("selection.clear")}
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="sel-empty">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M8 21h8" />
              <path d="M12 15v6" />
              <path d="M7 3h10l-.7 8.05A4.7 4.7 0 0 1 12 15a4.7 4.7 0 0 1-4.3-3.95L7 3Z" />
            </svg>
            <p className="sel-empty-title">{t("selection.emptyTitle")}</p>
            <p className="sel-empty-desc">{t("selection.emptyDesc")}</p>
            {onExplore && (
              <button type="button" className="sel-cta" onClick={handleExploreCta}>
                {t("hero.cta")}
              </button>
            )}
          </div>
        ) : (
          <ul className="sel-list">
            {items.map((wine) => {
              const priceLabel = formatPrice(wine.precio, currency, rateType);
              return (
                <li key={wine.id} className="sel-item">
                  <div className="sel-item-info">
                    <span className="sel-item-bodega">{wine.bodega ?? wine.categoria_carta}</span>
                    <span className="sel-item-name">{wine.nombre_completo_visible}</span>
                    <span className="sel-item-price">
                      {priceLabel} <em>{currency}</em>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="sel-item-remove"
                    aria-label={t("selection.removeAria", {
                      nombre: wine.nombre_completo_visible,
                      nome: wine.nombre_completo_visible,
                      name: wine.nombre_completo_visible,
                    })}
                    onClick={() => remove(wine.id)}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="sel-conv">
            {/* CTA comercial SOLO con número confirmado (B10/B31/B37): sin config no existe */}
            {waPhone !== null && (
              <button
                type="button"
                className="sel-consult"
                aria-label={t("whatsapp.consultAria")}
                onClick={handleConsultWhatsApp}
              >
                <span aria-hidden>💬</span> {t("whatsapp.consultSelection")}
              </button>
            )}
            {/* B26: compartir con terceros (sin mesa ni sesión, B27); sin Web Share → copiar */}
            <button
              type="button"
              className="sel-share"
              aria-label={canWebShare ? t("whatsapp.shareAria") : t("whatsapp.copySelection")}
              onClick={handleShareSelection}
            >
              {canWebShare ? t("whatsapp.shareSelection") : t("whatsapp.copySelection")}
            </button>
            <p className="sel-conv-feedback" aria-live="polite">
              {copyFeedback === "copied"
                ? t("whatsapp.copied")
                : copyFeedback === "error"
                  ? t("whatsapp.copyError")
                  : "\u00A0"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
