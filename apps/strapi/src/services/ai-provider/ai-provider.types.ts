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
  generateArticleDraft(prompt: string): Promise<IAiProviderResult>;
}
