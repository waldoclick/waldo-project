import { describe, it, expect } from "vitest";
import { ordersTocsv } from "../../app/utils/csv";

const HEADER = `"ID","Cliente","Email","Anuncio","Monto","Método de Pago","Tipo","Fecha"`;

describe("CSV Utilities", () => {
  describe("ordersTocsv", () => {
    it("should return only the header row for an empty array", () => {
      const result = ordersTocsv([]);
      expect(result).toBe(HEADER);
    });

    it("should return header plus one data row for a complete order", () => {
      const order = {
        id: 42,
        documentId: "abc123",
        amount: 9990,
        payment_method: "webpay",
        is_invoice: false,
        createdAt: "2026-01-15T10:00:00.000Z",
        user: {
          username: "johndoe",
          email: "john@example.com",
          firstname: "John",
          lastname: "Doe",
          phone: "123456789",
        },
        ad: { id: 1, name: "Auto usado" },
      };
      const result = ordersTocsv([order]);
      const lines = result.split("\r\n");
      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe(HEADER);
      expect(lines[1]).toBe(
        `"42","johndoe","john@example.com","Auto usado","9990","webpay","Boleta","2026-01-15T10:00:00.000Z"`,
      );
    });

    it("should return empty strings for null user and null ad", () => {
      const order = {
        id: 7,
        amount: 5000,
        payment_method: "transfer",
        is_invoice: false,
        createdAt: "2026-02-01T08:00:00.000Z",
        user: undefined,
        ad: null,
      };
      const result = ordersTocsv([order]);
      const lines = result.split("\r\n");
      expect(lines[1]).toBe(
        `"7","","","","5000","transfer","Boleta","2026-02-01T08:00:00.000Z"`,
      );
    });

    it("should escape double-quotes in cell values", () => {
      const order = {
        id: 3,
        amount: 1000,
        payment_method: "webpay",
        is_invoice: false,
        createdAt: "2026-03-01T00:00:00.000Z",
        user: {
          username: 'john"doe',
          email: "j@example.com",
          firstname: "John",
          lastname: "Doe",
          phone: "",
        },
        ad: { id: 2, name: 'Ad "special"' },
      };
      const result = ordersTocsv([order]);
      const lines = result.split("\r\n");
      expect(lines[1]).toBe(
        `"3","john""doe","j@example.com","Ad ""special""","1000","webpay","Boleta","2026-03-01T00:00:00.000Z"`,
      );
    });

    it("should map is_invoice=true to Factura and is_invoice=false to Boleta", () => {
      const invoice = {
        id: 10,
        amount: 2000,
        payment_method: "transfer",
        is_invoice: true,
        createdAt: "2026-04-01T00:00:00.000Z",
      };
      const receipt = {
        id: 11,
        amount: 3000,
        payment_method: "transfer",
        is_invoice: false,
        createdAt: "2026-04-02T00:00:00.000Z",
      };
      const result = ordersTocsv([invoice, receipt]);
      const lines = result.split("\r\n");
      expect(lines[1]).toContain('"Factura"');
      expect(lines[2]).toContain('"Boleta"');
    });

    it("should convert amount as string and as number to string representation", () => {
      const numericAmount = {
        id: 20,
        amount: 15000,
        payment_method: "webpay",
        is_invoice: false,
        createdAt: "2026-05-01T00:00:00.000Z",
      };
      const stringAmount = {
        id: 21,
        amount: "8500",
        payment_method: "webpay",
        is_invoice: false,
        createdAt: "2026-05-02T00:00:00.000Z",
      };
      const result = ordersTocsv([numericAmount, stringAmount]);
      const lines = result.split("\r\n");
      expect(lines[1]).toContain('"15000"');
      expect(lines[2]).toContain('"8500"');
    });
  });
});
