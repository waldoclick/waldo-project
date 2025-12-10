import * as soap from "soap";
import { IFactoConfig } from "../types";

export class FactoConfig {
  private static instance: FactoConfig;
  private client: any;
  private config: IFactoConfig;

  private constructor() {
    this.config = {
      url: process.env.FACTO_URL || "",
      user: process.env.FACTO_USER || "",
      password: process.env.FACTO_PASSWORD || "",
    };
    console.log("Configuración de Facto:", {
      url: this.config.url,
      user: this.config.user,
      password: this.config.password,
    });
  }

  public static getInstance(): FactoConfig {
    if (!FactoConfig.instance) {
      FactoConfig.instance = new FactoConfig();
    }
    return FactoConfig.instance;
  }

  public async initializeClient(): Promise<void> {
    if (!this.client) {
      const wsdl = this.config.url;
      console.log("Inicializando cliente SOAP con URL:", wsdl);

      return new Promise((resolve, reject) => {
        soap.createClient(wsdl, {}, (err, client) => {
          if (err) {
            console.error("Error al crear cliente SOAP:", err);
            reject(err);
            return;
          }

          console.log("Configurando credenciales en el cliente");
          client.setSecurity(
            new soap.BasicAuthSecurity(this.config.user, this.config.password)
          );

          this.client = client;
          resolve();
        });
      });
    }
  }

  public getClient(): any {
    if (!this.client) {
      throw new Error(
        "Cliente SOAP no inicializado. Llame a initializeClient primero."
      );
    }
    return this.client;
  }
}
