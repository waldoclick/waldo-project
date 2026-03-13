import type { IGroqService, GroqRequest, GroqResponse } from "./groq.types";

interface GroqApiMessage {
  role: string;
  content: string;
}

interface GroqApiResponse {
  choices: Array<{
    message: GroqApiMessage;
  }>;
}

export class GroqService implements IGroqService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.groq.com/openai/v1/chat/completions";
  private readonly modelName = "llama-3.3-70b-versatile";

  constructor() {
    const apiKey = process.env.GROQ_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
  }

  async generate(request: GroqRequest): Promise<GroqResponse> {
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
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as GroqApiResponse;
    const text = data.choices[0]?.message?.content ?? "";
    return { text };
  }
}
