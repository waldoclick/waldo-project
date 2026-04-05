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
    _amount: number,
    _orderId: string,
    _sessionId: string,
    _returnUrl: string
  ): Promise<IGatewayInitResponse>;

  commitTransaction(_gatewayRef: string): Promise<IGatewayCommitResponse>;
}
