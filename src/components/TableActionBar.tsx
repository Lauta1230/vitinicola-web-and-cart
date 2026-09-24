import { useState } from "react";
import type { ServiceMode } from "../hooks/useTableContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  buildTableActionMessage,
  buildWhatsAppUrl,
  openWhatsAppExternal,
  resolveBusinessWhatsAppPhone,
  type TableIntent,
} from "../utils/whatsapp";

/**
 * FASE 5D — Barra de acciones contextuales de mesa.
 *
 * Visible SOLO con mesa válida + serviceMode "bar" (Tomar acá).
 * Cuatro acciones de servicio: Otra copa · Otra botella · Acompañamiento · Cuenta.
 *
 * Representa únicamente INTENCIÓN local del visitante (qué acción marcó).
 * NO simula pedido enviado/recibido/en camino.
 * Sin datos comerciales (precios, disponibilidad): solo acciones de servicio.
 *
 * FASE 9 — Cuando hay una intención activa Y el negocio tiene WhatsApp
 * confirmado en config, se ofrece "Continuar en WhatsApp": construye el
 * mensaje de consulta de mesa (solo al click) y abre wa.me. La web nunca
 * afirma que el mozo recibió nada. Sin número confirmado la barra funciona
 * exactamente como en Fase 5D (selector de intención, sin CTA que falle).
 *
 * Estado: `activeAction` exclusivo (una sola acción o ninguna). El componente
 * se monta condicionalmente desde App: al cambiar a "Llevar / Regalar" se
 * desmonta y el estado se descarta → al volver al modo mesa reaparece limpio.
 *
 * La mesa proviene EXCLUSIVAMENTE de useTableContext (parser seguro de 5A):
 * sin URLSearchParams propios, sin copias de mesa, sin HTML interpretado.
 * Precio/barra: barra es agnóstica de moneda e idioma salvo textos i18n.
 */

/** Acciones exactas de la barra (sin quinta acción). */
export type TableAction = "another-cup" | "another-bottle" | "accompaniment" | "bill";

/** Visibilidad pura (testeable): solo mesa válida + modo bar. */
export function isTableBarVisible(tableId: string | null, serviceMode: ServiceMode): boolean {
  return tableId !== null && serviceMode === "bar";
}

/** Toggle exclusivo puro (testeable): misma acción → null; distinta → reemplaza. */
export function nextActiveAction(current: TableAction | null, action: TableAction): TableAction | null {
  return current === action ? null : action;
}

// ── Iconografía local: SVG inline monocromáticos 16px (sin librerías) ──

function GlassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 21h8" />
      <path d="M12 15v6" />
      <path d="M7 3h10l-.7 8.05A4.7 4.7 0 0 1 12 15a4.7 4.7 0 0 1-4.3-3.95L7 3Z" />
    </svg>
  );
}

function BottleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 2h4v4c0 1.2.5 1.8 1.1 2.5A5.6 5.6 0 0 1 16.5 12v7a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-7c0-1.4.5-2.6 1.4-3.5C9.5 7.8 10 7.2 10 6V2Z" />
      <path d="M10 2h4" />
    </svg>
  );
}

function PlateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  );
}

function BillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z" />
      <path d="M9.5 8.5h5" />
      <path d="M9.5 12.5h5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const ACTIONS: TableAction[] = ["another-cup", "another-bottle", "accompaniment", "bill"];

type Props = {
  tableId: string | null;
  serviceMode: ServiceMode;
};

/**
 * FIX SERVICE MODE — la barra recibe mesa/modo por PROPS desde App (la misma
 * instancia de estado que maneja ServiceModeSwitch). Antes instanciaba
 * useTableContext() por su cuenta: una SEGUNDA copia de serviceMode que solo
 * coincidía gracias al montaje condicional. Ahora existe una única fuente de
 * verdad y la visibilidad no puede divergir del selector.
 */
export function TableActionBar({ tableId, serviceMode }: Props) {
  const { t } = useTranslation();
  const [activeAction, setActiveAction] = useState<TableAction | null>(null);

  if (!isTableBarVisible(tableId, serviceMode)) return null;

  // FASE 9: CTA de conversión solo con intención activa + número confirmado.
  const waPhone = resolveBusinessWhatsAppPhone();

  /** B15–B19: mensaje construido SOLO al click, con el tableId ya validado. */
  const handleContinueWhatsApp = () => {
    if (activeAction === null || waPhone === null || tableId === null) return;
    const message = buildTableActionMessage({ t, tableId, action: activeAction as TableIntent });
    const url = buildWhatsAppUrl(waPhone, message ?? "");
    if (url !== null) openWhatsAppExternal(url);
    // Sin feedback posterior (B36) y sin limpiar la intención (B55: el
    // visitante puede volver del navegador y su estado sigue intacto).
  };

  const labelOf = (a: TableAction): string =>
    a === "another-cup"
      ? t("tableActions.anotherCup")
      : a === "another-bottle"
        ? t("tableActions.anotherBottle")
        : a === "accompaniment"
          ? t("tableActions.accompaniment")
          : t("tableActions.bill");

  const iconOf = (a: TableAction) =>
    a === "another-cup" ? <GlassIcon /> : a === "another-bottle" ? <BottleIcon /> : a === "accompaniment" ? <PlateIcon /> : <BillIcon />;

  return (
    <nav className="tbar" aria-label={t("tableActions.navAria")}>
      <div className="tbar-inner">
        {/* Microconfirmación de intención: nunca afirma envío/recepción */}
        <p className="tbar-status" aria-live="polite">
          {activeAction ? t("tableActions.selected", { action: labelOf(activeAction) }) : "\u00A0"}
        </p>
        <div className="tbar-row">
          {ACTIONS.map((a) => {
            const active = activeAction === a;
            return (
              <button
                key={a}
                type="button"
                className={`tbar-btn${active ? " is-active" : ""}`}
                aria-pressed={active}
                onClick={() => setActiveAction((cur) => nextActiveAction(cur, a))}
              >
                {active ? <CheckIcon /> : iconOf(a)}
                <span className="tbar-btn-label">{labelOf(a)}</span>
              </button>
            );
          })}
        </div>
        {/* FASE 9 — B25/B43: sin mezclar la selección del visitante con la
            intención de mesa ("otra botella" NO adjunta Mi selección) y sin
            CTA si el negocio no tiene WhatsApp confirmado. */}
        {activeAction !== null && waPhone !== null && (
          <button type="button" className="tbar-wa" onClick={handleContinueWhatsApp}>
            <span aria-hidden>💬</span> {t("whatsapp.continue")}
          </button>
        )}
      </div>
    </nav>
  );
}
