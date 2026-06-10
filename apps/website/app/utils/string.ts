export const formatFullName = (
  firstname?: string | null,
  lastname?: string | null,
): string => {
  if (!firstname && !lastname) return "--";
  return [firstname, lastname].filter(Boolean).join(" ");
};

export const formatAddress = (
  address?: string | null,
  addressNumber?: string | number | null,
): string => {
  if (!address) return "--";
  return addressNumber ? `${address} ${addressNumber}` : address;
};

export const formatBoolean = (value?: boolean | null): string => {
  return value ? "Sí" : "No";
};

export const formatDays = (days?: number | null): string => {
  if (days === undefined || days === null) return "--";
  return `${days} días`;
};

export const getPaymentMethod = (method?: string | null): string => {
  if (!method) return "--";
  return method === "webpay" ? "WebPay" : method;
};
