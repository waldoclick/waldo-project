export interface Indicator {
  code: string;
  name: string;
  unit: string;
  value: number;
}

export interface ConvertParams {
  amount: number;
  from?: "CLP" | "USD" | "EUR";
  to?: "CLP" | "USD" | "EUR";
}

export interface ConvertResponse {
  amount: number;
  from: string;
  to: string;
  result: number;
}
