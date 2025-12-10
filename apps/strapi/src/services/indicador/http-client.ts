import axios from "axios";
import { IHttpClient } from "./interfaces";

/**
 * Implementación del cliente HTTP usando axios
 */
export class HttpClient implements IHttpClient {
  /**
   * Realiza una petición HTTP GET
   * @param url URL a la que se realizará la petición
   * @returns Respuesta de la petición
   */
  async get<T>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error en la petición HTTP: ${error.message}`);
      }
      throw error;
    }
  }
}
