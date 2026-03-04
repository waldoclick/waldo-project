export interface IGatewayInitResponse {
  success: boolean;
  gatewayRef?: string;
  url?: string;
  error?: any;
}

export interface IGatewayCommitResponse {
  success: boolean;
  response?: any;
  error?: any;
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
