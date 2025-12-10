import { WebpayPlus, Options, Environment } from "transbank-sdk";

// Determinar el ambiente basado en variables de entorno
const getEnvironment = (): Environment => {
  const environment = process.env.WEBPAY_ENVIRONMENT || "integration";
  return environment === "production"
    ? Environment.Production
    : Environment.Integration;
};

// Configurar Webpay con credenciales dinámicas según el ambiente
const webpay = new WebpayPlus.Transaction(
  new Options(
    process.env.WEBPAY_COMMERCE_CODE,
    process.env.WEBPAY_API_KEY,
    getEnvironment()
  )
);

export default webpay;
