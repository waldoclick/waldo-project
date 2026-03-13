import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  IGeminiService,
  GeminiRequest,
  GeminiResponse,
} from "./gemini.types";

export class GeminiService implements IGeminiService {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName = "gemini-2.0-flash-lite";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(request.prompt);
    const text = result.response.text();
    return { text };
  }
}
