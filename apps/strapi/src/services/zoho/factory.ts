/**
 * Factory for creating Zoho CRM service instances
 */

import { IZohoService } from "./interfaces";
import { ZohoService } from "./zoho.service";
import { ZohoHttpClient } from "./http-client";

export class ZohoFactory {
  static createZohoService(config: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    apiUrl: string;
  }): IZohoService {
    const httpClient = new ZohoHttpClient(config);
    return new ZohoService(httpClient);
  }
}
