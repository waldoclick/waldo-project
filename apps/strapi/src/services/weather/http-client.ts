import axios, { isAxiosError } from "axios";

export class HttpClient {
  async get<T>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as { message?: string };
        throw new Error(
          `API Error: ${data.message || error.response.statusText}`
        );
      }
      throw new Error("Network error");
    }
  }
}
