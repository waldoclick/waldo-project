import type {
  IDeepSeekService,
  DeepSeekRequest,
  DeepSeekResponse,
} from "./deepseek.types";

interface DeepSeekApiMessage {
  role: string;
  content: string;
}

interface DeepSeekApiResponse {
  choices: Array<{
    message: DeepSeekApiMessage;
  }>;
}

export class DeepSeekService implements IDeepSeekService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.deepseek.com/chat/completions";
  private readonly modelName = "deepseek-chat";

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
  }

  async generate(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [{ role: "user", content: request.prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `DeepSeek API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as DeepSeekApiResponse;
    const text = data.choices[0]?.message?.content ?? "";
    return { text };
  }
}
