import { GoogleConfig } from "../config/google.config";
import { GoogleAuthService } from "../services/google-auth.service";
import { GoogleSheetsService } from "../services/google-sheets.service";
import { GoogleRecaptchaService } from "../services/google-recaptcha.service";

export class GoogleSheetsFactory {
  private static config = new GoogleConfig();
  private static authService = new GoogleAuthService(this.config);

  static createService(): GoogleSheetsService {
    return new GoogleSheetsService(this.authService);
  }

  static createRecaptchaService(): GoogleRecaptchaService {
    return new GoogleRecaptchaService();
  }
}
