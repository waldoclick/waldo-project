import { Oneclick, Options, Environment } from "transbank-sdk";

const getEnvironment = (): Environment => {
  const environment = process.env.ONECLICK_ENVIRONMENT || "integration";
  return environment === "production"
    ? Environment.Production
    : Environment.Integration;
};

const inscription = new Oneclick.MallInscription(
  new Options(
    process.env.ONECLICK_COMMERCE_CODE,
    process.env.ONECLICK_API_KEY,
    getEnvironment()
  )
);

export default inscription;
