import { IIndicadorService } from "./interfaces";
import { IndicadorService } from "./indicador.service";
import { HttpClient } from "./http-client";

/**
 * Fábrica para crear instancias del servicio de indicadores
 */
export class IndicadorFactory {
  /**
   * Crea una instancia del servicio de indicadores
   * @returns Una instancia del servicio de indicadores
   */
  static createIndicadorService(): IIndicadorService {
    const httpClient = new HttpClient();
    return new IndicadorService(httpClient);
  }
}
