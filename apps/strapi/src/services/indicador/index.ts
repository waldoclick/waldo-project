/**
 * Módulo de indicadores económicos
 */

// Exportar interfaces
export * from "./interfaces";

// Exportar implementaciones
export * from "./http-client";
export * from "./indicador.service";
export * from "./factory";

// Exportar una instancia lista para usar
import { IndicadorFactory } from "./factory";

export const indicadorService = IndicadorFactory.createIndicadorService();
