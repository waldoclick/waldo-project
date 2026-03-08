import { IWebpayCommitData } from "../../transbank/types";

export interface IGatewayInitResponse {
  success: boolean;
  gatewayRef?: string;
  url?: string;
  error?: unknown;
}

export interface IGatewayCommitResponse {
  success: boolean;
  response?: IWebpayCommitData;
  error?: unknown;
}

export interface IPaymentGateway {
  createTransaction(
    amount: number,
    orderId: string,
    sessionId: string,
    returnUrl: string
  ): Promise<IGatewayInitResponse>;

  commitTransaction(gatewayRef: string): Promise<IGatewayCommitResponse>;
}
