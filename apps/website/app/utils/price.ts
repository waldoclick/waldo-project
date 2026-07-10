import type { Indicator } from "@/types/indicator";

/**
 * Converts an amount between CLP/USD/EUR using already-fetched indicator
 * rates (see useIndicatorStore().fetchIndicators()) — no network call here.
 * Returns null if the required rate isn't in `indicators` (e.g. the
 * indicators fetch failed), so callers can degrade gracefully.
 */
export const convertCurrency = (
  amount: number,
  from: "CLP" | "USD" | "EUR",
  to: "CLP" | "USD" | "EUR",
  indicators: Indicator[],
): number | null => {
  if (from === to) return amount;

  const dolar = indicators.find((i) => i.code === "dolar");
  const euro = indicators.find((i) => i.code === "euro");

  let clpAmount: number;
  if (from === "CLP") {
    clpAmount = amount;
  } else if (from === "USD") {
    if (!dolar) return null;
    clpAmount = amount * dolar.value;
  } else {
    if (!euro) return null;
    clpAmount = amount * euro.value;
  }

  if (to === "CLP") return clpAmount;
  if (to === "USD") return dolar ? clpAmount / dolar.value : null;
  return euro ? clpAmount / euro.value : null;
};

export const formatCurrency = (
  amount: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
): string => {
  if (amount === null || amount === undefined) {
    return "--";
  }

  const numAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (Number.isNaN(numAmount)) {
    return "--";
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(numAmount);
};
