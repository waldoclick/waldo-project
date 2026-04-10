import { ICloudflareService } from "../types/cloudflare.types";

export class CloudflareService implements ICloudflareService {
  private apiToken: string;
  private zoneId: string;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || "";

    if (!this.apiToken) {
      throw new Error("CLOUDFLARE_API_TOKEN is required");
    }
    if (!this.zoneId) {
      throw new Error("CLOUDFLARE_ZONE_ID is required");
    }
  }
}
