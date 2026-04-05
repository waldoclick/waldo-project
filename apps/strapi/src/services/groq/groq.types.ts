export interface GroqRequest {
  prompt: string;
}

export interface GroqResponse {
  text: string;
}

export interface IGroqService {
  generate(_request: GroqRequest): Promise<GroqResponse>;
}
