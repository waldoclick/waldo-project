export interface ITransbankConfig {
  commerceCode: string;
  apiKey: string;
  environment: "production" | "integration";
  timeout?: number;
}

export interface IWebpayInitResponse {
  success: boolean;
  token?: string;
  url?: string;
  error?: any;
}

export interface IWebpayCommitResponse {
  success: boolean;
  response?: any;
  error?: any;
}

export interface IWebpayError {
  code: string;
  message: string;
}
