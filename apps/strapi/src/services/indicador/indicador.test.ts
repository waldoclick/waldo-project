import { describe, it, expect, beforeEach } from "@jest/globals";
import { IndicadorService } from "./indicador.service";
import { HttpClient } from "./http-client";
import { ConversionError } from "./interfaces";
import path from "path";

describe("IndicadorService", () => {
  let service: IndicadorService;

  beforeEach(() => {
    service = new IndicadorService(new HttpClient());
  });

  it("debería devolver todos los indicadores en el formato correcto", async () => {
    const result = await service.getIndicators();

    expect(result).toBeDefined();
    expect(result.date).toBeDefined();
    expect(Array.isArray(result.indicators)).toBe(true);
    expect(result.indicators.length).toBeGreaterThan(0);

    // Verificar estructura de un indicador
    const firstIndicator = result.indicators[0];
    expect(firstIndicator.code).toBeDefined();
    expect(firstIndicator.name).toBeDefined();
    expect(firstIndicator.unit).toBeDefined();
    expect(typeof firstIndicator.value).toBe("number");
  });

  it("debería obtener un indicador específico por su código", async () => {
    // Intentar obtener el indicador UF directamente
    const ufIndicator = await service.getIndicator("uf");

    // Verificar que existe y tiene la estructura correcta
    expect(ufIndicator).toBeDefined();
    expect(ufIndicator).not.toBeNull();
    expect(ufIndicator?.code).toBe("uf");
    expect(ufIndicator?.name).toBeDefined();
    expect(ufIndicator?.unit).toBeDefined();
    expect(typeof ufIndicator?.value).toBe("number");
  });

  describe("Conversión de Monedas", () => {
    it("debería convertir de CLP a USD por defecto", async () => {
      const result = await service.convert(100000);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("debería convertir correctamente entre diferentes monedas", async () => {
      // Obtener los indicadores actuales para cálculos
      const indicators = await service.getIndicators();
      const dolar = indicators.indicators.find((i) => i.code === "dolar");
      const euro = indicators.indicators.find((i) => i.code === "euro");

      if (!dolar || !euro) {
        throw new Error("No se pudieron obtener los indicadores necesarios");
      }

      // Test CLP -> USD
      const clpToUsd = await service.convert(100000, "CLP", "USD");
      expect(clpToUsd).toBeCloseTo(100000 / dolar.value, 2);

      // Test USD -> EUR
      const usdToEur = await service.convert(100, "USD", "EUR");
      const expectedEur = (100 * dolar.value) / euro.value;
      expect(usdToEur).toBeCloseTo(expectedEur, 2);

      // Test EUR -> CLP
      const eurToClp = await service.convert(50, "EUR", "CLP");
      expect(eurToClp).toBeCloseTo(50 * euro.value, 2);
    });

    it("debería retornar el mismo monto si las monedas son iguales", async () => {
      const amount = 100000;
      const result = await service.convert(amount, "CLP", "CLP");
      expect(result).toBe(amount);
    });

    it("debería lanzar error si no se pueden obtener los indicadores", async () => {
      // Crear un servicio con un cliente HTTP que falle y un path de cache diferente
      const failingService = new IndicadorService(
        {
          get: async () => {
            throw new Error("API Error");
          },
        },
        path.join(__dirname, "test-cache.json")
      );

      // Intentar convertir
      await expect(failingService.convert(100000)).rejects.toThrow(
        ConversionError
      );
    });

    it("debería lanzar error si se proporciona una moneda no soportada", async () => {
      await expect(
        service.convert(100000, "CLP", "JPY" as any)
      ).rejects.toThrow(ConversionError);

      await expect(
        service.convert(100000, "GBP" as any, "USD")
      ).rejects.toThrow(ConversionError);
    });
  });
});
