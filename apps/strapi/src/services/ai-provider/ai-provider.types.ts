export type AiProviderName =
  | "cerebras"
  | "groq"
  | "deepseek"
  | "gemini"
  | "anthropic";

export interface IAiProviderResult {
  text: string;
}

export interface IAiProviderService {
  generate(prompt: string): Promise<IAiProviderResult>;
  generateArticleDraft(prompt: string): Promise<IAiProviderResult>;
}
