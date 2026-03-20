import inscription from "../config/oneclick.config";
import logger from "../../../utils/logtail";
import {
  IOneclickStartResponse,
  IOneclickFinishResponse,
} from "../types/oneclick.types";

export class OneclickService {
  /**
   * Starts the Oneclick Mall card inscription flow.
   * Calls SDK inscription.start() and returns the token + redirect URL.
   */
  async startInscription(
    username: string,
    email: string,
    responseUrl: string
  ): Promise<IOneclickStartResponse> {
    try {
      const response = await inscription.start(username, email, responseUrl);
      return {
        success: true,
        token: response.token,
        urlWebpay: response.url_webpay,
      };
    } catch (error) {
      logger.error("OneclickService.startInscription failed", { error });
      return { success: false, error };
    }
  }

  /**
   * Finishes the Oneclick Mall card inscription flow.
   * Calls SDK inscription.finish() and returns the tbkUser + card details.
   * Logs the full raw response at info level in integration for field name verification.
   */
  async finishInscription(token: string): Promise<IOneclickFinishResponse> {
    try {
      const response = await inscription.finish(token);

      // Log raw SDK response in integration to verify field names (research open question 1)
      if (process.env.ONECLICK_ENVIRONMENT !== "production") {
        logger.info("OneclickService.finishInscription raw SDK response", {
          response,
        });
      }

      return {
        success: true,
        tbkUser: response.tbk_user,
        cardType: response.card_type,
        last4CardDigits: response.card_number,
      };
    } catch (error) {
      logger.error("OneclickService.finishInscription failed", { error });
      return { success: false, error };
    }
  }
}
