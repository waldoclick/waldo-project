import axios from "axios";
import { IGoogleRecaptchaService } from "../types/google.types";

export class GoogleRecaptchaService implements IGoogleRecaptchaService {
  private readonly secretKey: string;
  private readonly verifyUrl: string =
    "https://www.google.com/recaptcha/api/siteverify";

  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRET_KEY || "";
  }

  async verifyToken(token: string, expectedAction?: string): Promise<boolean> {
    try {
      const response = await axios.post(this.verifyUrl, null, {
        params: {
          secret: this.secretKey,
          response: token,
        },
      });

      const { success, score, action, hostname } = response.data as {
        success: boolean;
        score: number;
        action?: string;
        hostname?: string;
      };

      // SEC2-AUTH: basic validity check
      if (!success || score <= 0.5) return false;

      // SEC2-AUTH: action binding — reject if caller specified an expected action and it doesn't match
      if (expectedAction && action !== expectedAction) return false;

      // SEC2-AUTH: hostname allowlist — reject tokens from disallowed origins
      const allowedHostnames = (
        process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "waldo.click,www.waldo.click"
      ).split(",");
      if (!allowedHostnames.includes(hostname ?? "")) return false;

      return true;
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error);
      return false;
    }
  }
}
