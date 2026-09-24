import { useCallback } from "react";
import { useLocale } from "../context/LocaleContext";
import { t as translate } from "../data/translations";

export function useTranslation() {
  const { lang } = useLocale();
  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => translate(lang, path, params),
    [lang]
  );
  return { t, lang };
}
