import { FlowService } from "../services/flow.service";
import { FLOW_DEFAULT_CONFIG } from "../config/flow.config";
import { IFlowConfig } from "../types/flow.types";

// Use 'any' for Strapi type if the specific import is causing issues
type Strapi = any;

export function flowServiceFactory(
  strapi: Strapi,
  customConfig?: Partial<IFlowConfig>
): FlowService {
  const config = { ...FLOW_DEFAULT_CONFIG, ...customConfig };
  // Ensure required keys are present
  if (!config.apiKey || !config.secretKey || !config.apiBaseUrl) {
    throw new Error(
      "Flow API Key, Secret Key, and API Base URL must be configured."
    );
  }
  // After the check, we know the config properties are defined.
  // Cast to IFlowConfig to satisfy the FlowService constructor.
  return new FlowService(config as IFlowConfig, strapi);
}
