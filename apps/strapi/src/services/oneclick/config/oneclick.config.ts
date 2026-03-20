import { Oneclick, Options, Environment } from "transbank-sdk";

// Determine environment based on the same env var used by Webpay Plus
const getEnvironment = (): Environment => {
  const environment = process.env.WEBPAY_ENVIRONMENT || "integration";
  return environment === "production"
    ? Environment.Production
    : Environment.Integration;
};

// MallInscription instance configured with Oneclick-specific credentials.
// Falls back to WEBPAY_API_KEY when ONECLICK_API_KEY is not set (shared key in integration).
const inscription = new Oneclick.MallInscription(
  new Options(
    process.env.ONECLICK_COMMERCE_CODE,
    process.env.ONECLICK_API_KEY || process.env.WEBPAY_API_KEY,
    getEnvironment()
  )
);

export default inscription;
