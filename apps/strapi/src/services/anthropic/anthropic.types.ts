export interface AnthropicRequest {
  prompt: string;
}

export interface AnthropicResponse {
  text: string;
}

export interface IAnthropicService {
  generate(_request: AnthropicRequest): Promise<AnthropicResponse>;
}
