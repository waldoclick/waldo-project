import {
  Oneclick,
  Options,
  Environment,
  TransactionDetail,
} from "transbank-sdk";
import inscription from "../config/oneclick.config";
import logger from "../../../utils/logtail";
import {
  IOneclickStartResponse,
  IOneclickFinishResponse,
  IOneclickAuthorizeResponse,
  buildOneclickUsername,
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

  /**
   * Authorizes a monthly charge against a user's stored Oneclick inscription.
   * Calls SDK MallTransaction.authorize() and returns a structured response.
   * Instantiates MallTransaction per call (not singleton) per research recommendation.
   */
  async authorizeCharge(
    userDocumentId: string,
    tbkUser: string,
    amount: number,
    parentBuyOrder: string,
    childBuyOrder: string
  ): Promise<IOneclickAuthorizeResponse> {
    try {
      const transaction = new Oneclick.MallTransaction(
        new Options(
          process.env.ONECLICK_COMMERCE_CODE,
          process.env.ONECLICK_API_KEY,
          process.env.ONECLICK_ENVIRONMENT === "production"
            ? Environment.Production
            : Environment.Integration
        )
      );
      const detail = new TransactionDetail(
        amount,
        process.env.ONECLICK_CHILD_COMMERCE_CODE!,
        childBuyOrder
      );
      const response = await transaction.authorize(
        buildOneclickUsername(userDocumentId),
        tbkUser,
        parentBuyOrder,
        [detail]
      );
      const approved = response?.details?.[0]?.response_code === 0;
      return {
        success: approved,
        authorizationCode: response?.details?.[0]?.authorization_code,
        responseCode: response?.details?.[0]?.response_code,
        rawResponse: response,
      };
    } catch (error) {
      logger.error("OneclickService.authorizeCharge failed", { error });
      return { success: false, error };
    }
  }
}
