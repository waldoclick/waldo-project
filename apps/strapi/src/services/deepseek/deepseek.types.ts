export interface DeepSeekRequest {
  prompt: string;
}

export interface DeepSeekResponse {
  text: string;
}

export interface IDeepSeekService {
  generate(_request: DeepSeekRequest): Promise<DeepSeekResponse>;
}
