/**
 * HTTP client for Zoho CRM API
 */

import axios, { AxiosAdapter, AxiosInstance } from "axios";
import { ZohoConfig } from "./interfaces";

export class ZohoHttpClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(private config: ZohoConfig, adapter?: AxiosAdapter) {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
      ...(adapter ? { adapter } : {}),
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      if (!this.accessToken) {
        await this.refreshAccessToken();
      }
      config.headers.Authorization = `Zoho-oauthtoken ${this.accessToken}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.accessToken = null;
          await this.refreshAccessToken();
          originalRequest.headers[
            "Authorization"
          ] = `Zoho-oauthtoken ${this.accessToken}`;
          return this.client(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken() {
    try {
      const response = await axios.post(
        "https://accounts.zoho.com/oauth/v2/token",
        null,
        {
          params: {
            refresh_token: this.config.refreshToken,
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            grant_type: "refresh_token",
          },
        }
      );
      this.accessToken = response.data.access_token;
    } catch (error) {
      throw new Error("Failed to refresh Zoho access token");
    }
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }
}
