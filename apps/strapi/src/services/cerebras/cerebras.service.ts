import type {
  ICerebrasService,
  CerebrasRequest,
  CerebrasResponse,
} from "./cerebras.types";

interface CerebrasApiMessage {
  role: string;
  content: string;
}

interface CerebrasApiResponse {
  choices: Array<{
    message: CerebrasApiMessage;
  }>;
}

export class CerebrasService implements ICerebrasService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.cerebras.ai/v1/chat/completions";
  private readonly modelName = "llama-3.3-70b";

  constructor() {
    const apiKey = process.env.CEREBRAS_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("CEREBRAS_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
  }

  async generate(request: CerebrasRequest): Promise<CerebrasResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [{ role: "user", content: request.prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Cerebras API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as CerebrasApiResponse;
    const text = data.choices[0]?.message?.content ?? "";
    return { text };
  }
}
