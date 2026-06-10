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
