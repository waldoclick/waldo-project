import {
  IHttpClient,
  IIndicadorService,
  IndicadorResponse,
  Indicator,
  IndicatorsResponse,
  Currency,
  ConversionError,
} from "./interfaces";
import fs from "fs";
import path from "path";
import { HttpClient } from "./http-client";

/**
 * Servicio para obtener indicadores económicos de mi-indicador.cl
 */
export class IndicadorService implements IIndicadorService {
  private readonly baseUrl: string = "https://mindicador.cl/api";
  private readonly cachePath: string;
  private cachedIndicators: Indicator[] = [];
  private initializationPromise: Promise<void>;

  constructor(private readonly httpClient: IHttpClient, cachePath?: string) {
    const dataDir = "data";
    const dataFile = "indicators.json";
    this.cachePath = cachePath || path.join(process.cwd(), dataDir, dataFile);

    // Asegurar que el directorio data existe
    if (!fs.existsSync(path.join(process.cwd(), dataDir))) {
      fs.mkdirSync(path.join(process.cwd(), dataDir));
    }

    this.initializationPromise = this.initializeCache();
  }

  /**
   * Inicializa el cache de indicadores
   */
  private async initializeCache(): Promise<void> {
    try {
      // Verificar si el archivo existe
      const exists = await fs.promises
        .access(this.cachePath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        // Si no existe, crear el cache con datos frescos
        await this.updateAndGetIndicators();
        return;
      }

      // Leer datos existentes
      const cachedData = await this.readCachedData();

      // Verificar si necesita actualización
      if (this.needsUpdate(cachedData.lastUpdate, cachedData.indicators)) {
        await this.updateAndGetIndicators();
      } else {
        this.cachedIndicators = cachedData.indicators;
      }
    } catch (error) {
      // Si hay algún error, intentar obtener datos frescos
      await this.updateAndGetIndicators();
    }
  }

  /**
   * Obtiene todos los indicadores en formato estandarizado
   * @returns Array de indicadores con sus valores actuales
   */
  public async getIndicators(): Promise<IndicatorsResponse> {
    // Esperar a que el cache esté inicializado
    await this.initializationPromise;

    return {
      lastUpdate: new Date().toISOString(),
      indicators: this.cachedIndicators,
    };
  }

  /**
   * Obtiene un indicador específico por su código
   * @param code Código del indicador (ej: 'uf', 'dolar', 'euro', 'utm', 'ipc')
   * @returns El indicador solicitado o null si no existe
   */
  public async getIndicator(code: string): Promise<Indicator | null> {
    // Esperar a que el cache esté inicializado
    await this.initializationPromise;
    return (
      this.cachedIndicators.find((indicator) => indicator.code === code) ?? null
    );
  }

  /**
   * Lee los datos del archivo de cache
   */
  private async readCachedData(): Promise<{
    lastUpdate: string;
    indicators: Indicator[];
  }> {
    try {
      const data = await fs.promises.readFile(this.cachePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe o está corrupto, devolver datos vacíos
      return {
        lastUpdate: "2000-01-01T00:00:00.000Z",
        indicators: [],
      };
    }
  }

  /**
   * Verifica si los datos necesitan actualización
   */
  private needsUpdate(lastUpdate: string, indicators: Indicator[]): boolean {
    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();

    // Si no hay indicadores o la última actualización fue ayer o antes
    return (
      indicators.length === 0 ||
      lastUpdateDate.getDate() < now.getDate() ||
      lastUpdateDate.getMonth() < now.getMonth() ||
      lastUpdateDate.getFullYear() < now.getFullYear()
    );
  }

  /**
   * Actualiza el cache y devuelve los nuevos datos
   */
  private async updateAndGetIndicators(): Promise<IndicatorsResponse> {
    try {
      // Obtener datos frescos de la API
      const response = await this.httpClient.get<IndicadorResponse>(
        this.baseUrl
      );

      const indicators: Indicator[] = [];

      // Procesar cada indicador si existe
      if (response.uf)
        indicators.push(this.transformToEnglishFormat(response.uf));
      if (response.dolar)
        indicators.push(this.transformToEnglishFormat(response.dolar));
      if (response.euro)
        indicators.push(this.transformToEnglishFormat(response.euro));
      if (response.utm)
        indicators.push(this.transformToEnglishFormat(response.utm));
      if (response.ipc)
        indicators.push(this.transformToEnglishFormat(response.ipc));

      // Actualizar los indicadores en memoria
      this.cachedIndicators = indicators;

      const result = {
        lastUpdate: response.fecha,
        indicators,
      };

      // Guardar en cache
      await this.saveToCache(result);

      return result;
    } catch (error) {
      throw new ConversionError(
        "No se pudieron obtener los indicadores necesarios para la conversión"
      );
    }
  }

  /**
   * Guarda los datos en el archivo de cache
   */
  private async saveToCache(data: IndicatorsResponse): Promise<void> {
    const cacheData = {
      lastUpdate: data.lastUpdate,
      indicators: data.indicators,
    };

    // Asegurar que el directorio existe
    await fs.promises.mkdir(path.dirname(this.cachePath), { recursive: true });

    // Guardar datos
    await fs.promises.writeFile(
      this.cachePath,
      JSON.stringify(cacheData, null, 2),
      "utf-8"
    );
  }

  /**
   * Transforma un indicador al formato en inglés
   * @param data Indicador en formato original
   * @returns Indicador en formato estandarizado
   */
  private transformToEnglishFormat(data: any): Indicator {
    return {
      code: data.codigo,
      name: data.nombre,
      unit: data.unidad_medida,
      value: data.valor,
    };
  }

  /**
   * Convierte un monto entre diferentes monedas
   * @param amount Monto a convertir
   * @param from Moneda de origen ('CLP', 'USD', 'EUR'), por defecto 'CLP'
   * @param to Moneda de destino ('CLP', 'USD', 'EUR'), por defecto 'USD'
   * @returns El monto convertido
   * @throws ConversionError si no se pueden obtener los indicadores o las monedas no son válidas
   */
  public async convert(
    amount: number,
    from: Currency = "CLP",
    to: Currency = "USD"
  ): Promise<number> {
    // Si las monedas son iguales, retornar el mismo monto
    if (from === to) return amount;

    // Esperar a que el cache esté inicializado
    await this.initializationPromise;

    // Obtener los indicadores necesarios
    const dolar = this.cachedIndicators.find((i) => i.code === "dolar");
    const euro = this.cachedIndicators.find((i) => i.code === "euro");

    if (!dolar || !euro) {
      throw new ConversionError(
        "No se pudieron obtener los indicadores necesarios para la conversión"
      );
    }

    // Convertir todo a CLP primero
    let clpAmount: number;
    switch (from) {
      case "CLP":
        clpAmount = amount;
        break;
      case "USD":
        clpAmount = amount * dolar.value;
        break;
      case "EUR":
        clpAmount = amount * euro.value;
        break;
      default:
        throw new ConversionError(`Moneda de origen no soportada: ${from}`);
    }

    // Convertir de CLP a la moneda destino
    switch (to) {
      case "CLP":
        return clpAmount;
      case "USD":
        return clpAmount / dolar.value;
      case "EUR":
        return clpAmount / euro.value;
      default:
        throw new ConversionError(`Moneda de destino no soportada: ${to}`);
    }
  }
}
