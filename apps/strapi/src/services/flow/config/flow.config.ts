import { IFlowConfig } from "../types/flow.types";

export const FLOW_DEFAULT_CONFIG: Partial<IFlowConfig> = {
  apiKey: process.env.FLOW_API_KEY || undefined,
  secretKey: process.env.FLOW_SECRET_KEY || undefined,
  apiBaseUrl: process.env.FLOW_API_BASE_URL || undefined,
  // Add other Flow config variables if needed, e.g., environment URL
  // environment: process.env.FLOW_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
};
