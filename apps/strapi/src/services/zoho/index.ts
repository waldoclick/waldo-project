/**
 * Zoho CRM module
 */

// Export interfaces
export * from "./interfaces";

// Export implementations
export * from "./http-client";
export * from "./zoho.service";
export * from "./factory";

// Export a ready-to-use instance
import { ZohoFactory } from "./factory";

export const zohoService = ZohoFactory.createZohoService({
  clientId: process.env.ZOHO_CLIENT_ID || "",
  clientSecret: process.env.ZOHO_CLIENT_SECRET || "",
  refreshToken: process.env.ZOHO_REFRESH_TOKEN || "",
  apiUrl: process.env.ZOHO_API_URL || "https://www.zohoapis.com",
});
