// Exportar tipos
export * from "./types/google.types";

// Exportar configuraciones
export * from "./config/google.config";

// Exportar servicios
export * from "./services/google-auth.service";
export * from "./services/google-sheets.service";
export * from "./services/google-recaptcha.service";

// Exportar factories
export * from "./factories/google-sheets.factory";

// Exportar instancias por defecto
import { GoogleSheetsFactory } from "./factories/google-sheets.factory";
const GoogleServices = {
  sheets: GoogleSheetsFactory.createService(),
  recaptcha: GoogleSheetsFactory.createRecaptchaService(),
};
export default GoogleServices;
