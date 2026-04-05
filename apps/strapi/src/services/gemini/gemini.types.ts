export interface GeminiRequest {
  prompt: string;
}

export interface GeminiResponse {
  text: string;
}

export interface IGeminiService {
  generate(_request: GeminiRequest): Promise<GeminiResponse>;
}
