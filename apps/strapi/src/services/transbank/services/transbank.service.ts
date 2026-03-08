import {
  IWebpayCommitResponse,
  IWebpayInitResponse,
  IWebpayError,
} from "../types";
import webpay from "../config/transbank.config";
import logger from "../../../utils/logtail";

export class TransbankService {
  public async createTransaction(
    amount: number,
    orderId: string,
    sessionId: string,
    returnUrl: string
  ): Promise<IWebpayInitResponse> {
    try {
      // Log de envío a Transbank
      logger.info("🚀 ENVIANDO A TRANSBANK:", {
        amount,
        orderId,
        sessionId,
        returnUrl,
        timestamp: new Date().toISOString(),
      });

      const response = await webpay.create(
        orderId,
        sessionId,
        amount,
        returnUrl
      );

      return {
        success: true,
        token: response.token,
        url: response.url,
      };
    } catch (error) {
      // Log de respuesta de error Transbank
      logger.error("❌ RESPUESTA DE ERROR TRANSBANK:", {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        orderId,
        returnUrl,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error,
      };
    }
  }

  public async commitTransaction(
    token: string
  ): Promise<IWebpayCommitResponse> {
    try {
      const response = await webpay.commit(token);

      return {
        success: true,
        response,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  private handleError(error: unknown): IWebpayError {
    const e = error as Record<string, unknown>;
    return {
      code: typeof e?.code === "string" ? e.code : "UNKNOWN_ERROR",
      message:
        typeof e?.message === "string"
          ? e.message
          : "An unknown error occurred",
    };
  }
}
