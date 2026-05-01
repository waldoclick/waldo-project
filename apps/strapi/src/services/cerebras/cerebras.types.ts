export interface CerebrasRequest {
  prompt: string;
}

export interface CerebrasResponse {
  text: string;
}

export interface ICerebrasService {
  generate(_request: CerebrasRequest): Promise<CerebrasResponse>;
}
