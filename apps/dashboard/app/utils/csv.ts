import type { Order } from "@/types/order";

const HEADERS = [
  "ID",
  "Cliente",
  "Email",
  "Anuncio",
  "Monto",
  "Método de Pago",
  "Tipo",
  "Fecha",
];

const escapeCell = (cell: string): string => `"${cell.replace(/"/g, '""')}"`;

export function ordersTocsv(orders: Order[]): string {
  const rows = orders.map((o) => [
    String(o.id),
    o.user?.username ?? "",
    o.user?.email ?? "",
    o.ad?.name ?? "",
    String(o.amount),
    o.payment_method ?? "",
    o.is_invoice ? "Factura" : "Boleta",
    o.createdAt,
  ]);

  return [HEADERS, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
    .join("\r\n");
}
