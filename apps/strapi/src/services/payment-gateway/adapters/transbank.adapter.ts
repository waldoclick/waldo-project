import { TransbankService } from "../../transbank/services/transbank.service";
import {
  IPaymentGateway,
  IGatewayInitResponse,
  IGatewayCommitResponse,
} from "../types/gateway.interface";

export class TransbankAdapter implements IPaymentGateway {
  private service: TransbankService;

  constructor() {
    this.service = new TransbankService();
  }

  async createTransaction(
    amount: number,
    orderId: string,
    sessionId: string,
    returnUrl: string
  ): Promise<IGatewayInitResponse> {
    const result = await this.service.createTransaction(
      amount,
      orderId,
      sessionId,
      returnUrl
    );
    return {
      success: result.success,
      gatewayRef: result.token,
      url: result.url,
      error: result.error,
    };
  }

  async commitTransaction(gatewayRef: string): Promise<IGatewayCommitResponse> {
    return this.service.commitTransaction(gatewayRef);
  }
}
