import { useTranslation } from "../hooks/useTranslation";

/**
 * FASE 5A — Badge contextual de mesa
 *
 * Metadata discreta (ej: "MESA 4"), nunca título principal.
 * Sin mesa (null o inválida) no renderiza nada.
 * Pill con borde dorado fino sobre paper warm: identidad navy/gold/paper.
 */
export function TableContextBadge({ tableId }: { tableId: string | null | undefined }) {
  const { t } = useTranslation();
  if (!tableId) return null;
  return (
    <span className="table-badge" role="status" aria-label={`${t("service.table")} ${tableId}`}>
      {t("service.table")} {tableId}
    </span>
  );
}
