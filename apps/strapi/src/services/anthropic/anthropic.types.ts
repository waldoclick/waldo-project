export interface WebSearchResult {
  title: string;
  url: string;
  description: string;
}

export interface AnthropicRequest {
  prompt: string;
}

export interface AnthropicResponse {
  text: string;
}

export interface IAnthropicService {
  generate(request: AnthropicRequest): Promise<AnthropicResponse>;
}
