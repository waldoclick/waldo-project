export interface GroqRequest {
  prompt: string;
}

export interface GroqResponse {
  text: string;
}

export interface IGroqService {
  generate(request: GroqRequest): Promise<GroqResponse>;
}
