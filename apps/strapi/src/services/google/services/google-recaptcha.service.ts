import axios from "axios";
import { IGoogleRecaptchaService } from "../types/google.types";

export class GoogleRecaptchaService implements IGoogleRecaptchaService {
  private readonly secretKey: string;
  private readonly verifyUrl: string =
    "https://www.google.com/recaptcha/api/siteverify";

  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRET_KEY || "";
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(this.verifyUrl, null, {
        params: {
          secret: this.secretKey,
          response: token,
        },
      });

      const { success, score } = response.data;

      return success && score > 0.5;
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error);
      return false;
    }
  }
}
