import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Currency, Lang, RateType } from "../data/translations";

type LocaleContextValue = {
  lang: Lang;
  currency: Currency;
  rateType: RateType;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  setRateType: (r: RateType) => void;
};

const STORAGE_LANG = "lv_locale_lang";
const STORAGE_CURRENCY = "lv_locale_currency";
const STORAGE_RATE = "lv_locale_rate";

const defaultValue: LocaleContextValue = {
  lang: "es",
  currency: "ARS",
  rateType: "official",
  setLang: () => {},
  setCurrency: () => {},
  setRateType: () => {},
};

const LocaleContext = createContext<LocaleContextValue>(defaultValue);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG) as Lang | null;
      if (saved && ["es", "pt", "en"].includes(saved)) return saved;
    } catch {}
    return "es";
  });
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENCY) as Currency | null;
      if (saved && ["ARS", "BRL", "USD"].includes(saved)) return saved;
    } catch {}
    return "ARS";
  });
  const [rateType, setRateTypeState] = useState<RateType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RATE) as RateType | null;
      if (saved && ["official", "blue"].includes(saved)) return saved;
    } catch {}
    return "official";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_LANG, l);
    } catch {}
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_CURRENCY, c);
    } catch {}
  }, []);

  const setRateType = useCallback((r: RateType) => {
    setRateTypeState(r);
    try {
      localStorage.setItem(STORAGE_RATE, r);
    } catch {}
  }, []);

  // Persist rateType even when currency is ARS (se mantiene independiente)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RATE, rateType);
    } catch {}
  }, [rateType]);

  const value = useMemo(
    () => ({ lang, currency, rateType, setLang, setCurrency, setRateType }),
    [lang, currency, rateType, setLang, setCurrency, setRateType]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
