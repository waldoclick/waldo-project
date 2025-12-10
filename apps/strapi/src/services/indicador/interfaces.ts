/**
 * Interfaces para el servicio de indicadores económicos
 */

// Interfaz base para todos los indicadores
export interface Indicador {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

// Interfaces específicas para cada tipo de indicador
export interface IndicadorUF extends Indicador {}
export interface IndicadorDolar extends Indicador {}
export interface IndicadorUTM extends Indicador {}
export interface IndicadorIPC extends Indicador {}
export interface IndicadorEuro extends Indicador {}

// Respuesta de la API
export interface IndicadorResponse {
  version: string;
  autor: string;
  fecha: string;
  uf?: IndicadorUF;
  dolar?: IndicadorDolar;
  utm?: IndicadorUTM;
  ipc?: IndicadorIPC;
  euro?: IndicadorEuro;
}

// Cliente HTTP para obtener los datos
export interface IHttpClient {
  get<T>(url: string): Promise<T>;
}

// Interfaz para el formato de respuesta en inglés
export interface Indicator {
  code: string;
  name: string;
  unit: string;
  value: number;
}

export interface IndicatorsResponse {
  lastUpdate: string;
  indicators: Indicator[];
}

/**
 * Monedas soportadas para conversión
 */
export type Currency = "CLP" | "USD" | "EUR";

/**
 * Error personalizado para conversiones de moneda
 */
export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversionError";
  }
}

/**
 * Servicio principal de indicadores
 */
export interface IIndicadorService {
  getIndicators(): Promise<IndicatorsResponse>;
  getIndicator(code: string): Promise<Indicator | null>;
  convert(amount: number, from: Currency, to: Currency): Promise<number>;
}
