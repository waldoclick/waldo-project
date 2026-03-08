export interface ITransbankConfig {
  commerceCode: string;
  apiKey: string;
  environment: "production" | "integration";
  timeout?: number;
}

export interface IWebpayCommitData {
  status?: string;
  buy_order?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface IWebpayInitResponse {
  success: boolean;
  token?: string;
  url?: string;
  error?: unknown;
}

export interface IWebpayCommitResponse {
  success: boolean;
  response?: IWebpayCommitData;
  error?: unknown;
}

export interface IWebpayError {
  code: string;
  message: string;
}
