import { IPaymentGateway } from "./types/gateway.interface";
import { TransbankAdapter } from "./adapters/transbank.adapter";

const GATEWAY_ENV_REQUIREMENTS: Record<string, string[]> = {
  transbank: ["WEBPAY_COMMERCE_CODE", "WEBPAY_API_KEY"],
};

const GATEWAY_FACTORIES: Record<string, () => IPaymentGateway> = {
  transbank: () => new TransbankAdapter(),
};

export function getPaymentGateway(): IPaymentGateway {
  const id = process.env.PAYMENT_GATEWAY ?? "transbank";

  const factory = GATEWAY_FACTORIES[id];
  if (!factory) {
    throw new Error(
      `Unknown payment gateway: "${id}". Valid options: ${Object.keys(
        GATEWAY_FACTORIES
      ).join(", ")}`
    );
  }

  const requiredVars = GATEWAY_ENV_REQUIREMENTS[id] ?? [];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    throw new Error(
      `Payment gateway "${id}" is missing required environment variables: ${missingVars.join(
        ", "
      )}`
    );
  }

  return factory();
}
