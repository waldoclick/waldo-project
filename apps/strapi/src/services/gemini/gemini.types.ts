export interface GeminiRequest {
  prompt: string;
}

export interface GeminiResponse {
  text: string;
}

export interface IGeminiService {
  generate(request: GeminiRequest): Promise<GeminiResponse>;
}
