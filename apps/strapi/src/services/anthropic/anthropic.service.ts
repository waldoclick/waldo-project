import Anthropic from "@anthropic-ai/sdk";
import type {
  IAnthropicService,
  AnthropicRequest,
  AnthropicResponse,
  WebSearchResult,
} from "./anthropic.types";

export class AnthropicService implements IAnthropicService {
  private readonly client: Anthropic;
  private readonly modelName = "claude-sonnet-4-5";
  private readonly braveApiKey: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }
    const braveKey = process.env.BRAVE_SEARCH_API_KEY ?? "";
    if (!braveKey) {
      throw new Error("BRAVE_SEARCH_API_KEY environment variable is required");
    }
    this.client = new Anthropic({ apiKey });
    this.braveApiKey = braveKey;
  }

  async generate(request: AnthropicRequest): Promise<AnthropicResponse> {
    const tools: Anthropic.Tool[] = [
      {
        name: "web_search",
        description: "Search the web for current information",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
    ];

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: request.prompt },
    ];

    while (true) {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 4096,
        tools,
        messages,
      });

      if (response.stop_reason === "end_turn") {
        const textBlock = response.content.find(
          (b): b is Anthropic.Messages.TextBlock => b.type === "text"
        );
        const text = textBlock?.text ?? "";
        return { text };
      }

      if (response.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: response.content });

        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
        );

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          if (block.name === "web_search") {
            const input = block.input as { query: string };
            const results = await this.executeBraveSearch(input.query);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(results),
            });
          }
        }

        messages.push({ role: "user", content: toolResults });
        continue;
      }

      throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
    }
  }

  private async executeBraveSearch(query: string): Promise<WebSearchResult[]> {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
      query
    )}&count=5`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": this.braveApiKey,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Brave Search API error: ${response.status} ${response.statusText}`
      );
    }
    const data = (await response.json()) as {
      web?: { results?: WebSearchResult[] };
    };
    return data.web?.results ?? [];
  }
}
