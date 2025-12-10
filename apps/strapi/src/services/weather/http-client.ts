import axios from "axios";

export class HttpClient {
  async get<T>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `API Error: ${
            error.response.data.message || error.response.statusText
          }`
        );
      }
      throw new Error("Network error");
    }
  }
}
