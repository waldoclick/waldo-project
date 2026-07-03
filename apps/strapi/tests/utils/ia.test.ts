// Mock the 5 provider adapters and the Opik SDK so AI + tracing are controlled.
jest.mock("../../src/services/cerebras", () => ({ generateText: jest.fn() }));
jest.mock("../../src/services/groq", () => ({ generateText: jest.fn() }));
jest.mock("../../src/services/deepseek", () => ({ generateText: jest.fn() }));
jest.mock("../../src/services/gemini", () => ({ generateText: jest.fn() }));
jest.mock("../../src/services/anthropic", () => ({
  generateWithSearch: jest.fn(),
}));
jest.mock("opik", () => ({ Opik: jest.fn(), OpikSpanType: { Llm: "llm" } }));

import { generateText as cerebrasGen } from "../../src/services/cerebras";
import { generateText as groqGen } from "../../src/services/groq";
import { generateText as deepseekGen } from "../../src/services/deepseek";
import { generateText as geminiGen } from "../../src/services/gemini";
import { generateWithSearch as anthropicGen } from "../../src/services/anthropic";
import {
  generate,
  validateFields,
  VALIDATION_TIMEOUT_MS,
} from "../../src/utils/ia";

const mockCerebras = cerebrasGen as jest.Mock;
const mockGroq = groqGen as jest.Mock;
const mockDeepSeek = deepseekGen as jest.Mock;
const mockGemini = geminiGen as jest.Mock;
const mockAnthropic = anthropicGen as jest.Mock;

const stubStrapi = () => {
  (
    global as unknown as {
      strapi: { log: { error: jest.Mock; warn: jest.Mock } };
    }
  ).strapi = { log: { error: jest.fn(), warn: jest.fn() } };
};

let savedProvider: string | undefined;

beforeEach(() => {
  jest.resetAllMocks();
  stubStrapi();
  // Disable Opik tracing entirely (no key → passthrough)
  delete process.env.OPIK_API_KEY;
  savedProvider = process.env.AI_PROVIDER;
  delete process.env.AI_PROVIDER; // default: cerebras
});

afterEach(() => {
  if (savedProvider === undefined) delete process.env.AI_PROVIDER;
  else process.env.AI_PROVIDER = savedProvider;
});

describe("generate — provider selection + fallback", () => {
  it("uses the default provider (cerebras) and returns its result", async () => {
    mockCerebras.mockResolvedValue({ text: "ok" });
    const result = await generate("hi");
    expect(result).toEqual({ text: "ok" });
    expect(mockCerebras).toHaveBeenCalledTimes(1);
    expect(mockGroq).not.toHaveBeenCalled();
  });

  it("falls back to the next provider when the first fails", async () => {
    mockCerebras.mockRejectedValue(new Error("down"));
    mockGroq.mockResolvedValue({ text: "from groq" });
    const result = await generate("hi");
    expect(result).toEqual({ text: "from groq" });
    expect(mockCerebras).toHaveBeenCalledTimes(1);
    expect(mockGroq).toHaveBeenCalledTimes(1);
  });

  it("honors AI_PROVIDER env override as the first provider", async () => {
    process.env.AI_PROVIDER = "groq";
    mockGroq.mockResolvedValue({ text: "groq first" });
    const result = await generate("hi");
    expect(result).toEqual({ text: "groq first" });
    expect(mockGroq).toHaveBeenCalledTimes(1);
    expect(mockCerebras).not.toHaveBeenCalled();
  });

  it("throws when all providers fail", async () => {
    mockCerebras.mockRejectedValue(new Error("x"));
    mockGroq.mockRejectedValue(new Error("x"));
    mockDeepSeek.mockRejectedValue(new Error("x"));
    mockGemini.mockRejectedValue(new Error("x"));
    mockAnthropic.mockRejectedValue(new Error("x"));
    await expect(generate("hi")).rejects.toThrow(/all providers failed/);
  });
});

describe("validateFields — per-field boolean, fail-open", () => {
  it("preserves explicit false for a field", async () => {
    mockCerebras.mockResolvedValue({
      text: '{"firstname":true,"lastname":false}',
    });
    const result = await validateFields({
      firstname: "John",
      lastname: "akhsdgKAJHSDGH",
    });
    expect(result).toEqual({ firstname: true, lastname: false });
  });

  it("returns all-true when AI returns all true", async () => {
    mockCerebras.mockResolvedValue({
      text: '{"firstname":true,"lastname":true}',
    });
    const result = await validateFields({
      firstname: "John",
      lastname: "Smith",
    });
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  it("fail-open (all-true) when every provider fails, never throws", async () => {
    mockCerebras.mockRejectedValue(new Error("x"));
    mockGroq.mockRejectedValue(new Error("x"));
    mockDeepSeek.mockRejectedValue(new Error("x"));
    mockGemini.mockRejectedValue(new Error("x"));
    mockAnthropic.mockRejectedValue(new Error("x"));
    const result = await validateFields({
      firstname: "John",
      lastname: "Smith",
    });
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  it("fail-open (all-true) on timeout", async () => {
    jest.useFakeTimers();
    mockCerebras.mockImplementation(() => new Promise(() => undefined));
    const resultPromise = validateFields({
      firstname: "John",
      lastname: "Smith",
    });
    jest.advanceTimersByTime(VALIDATION_TIMEOUT_MS + 100);
    const result = await resultPromise;
    jest.useRealTimers();
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  it("fail-open (all-true) on unparseable JSON", async () => {
    mockCerebras.mockResolvedValue({ text: "not json at all" });
    const result = await validateFields({
      firstname: "John",
      lastname: "Smith",
    });
    expect(result).toEqual({ firstname: true, lastname: true });
  });

  it("strips markdown fences and parses", async () => {
    mockCerebras.mockResolvedValue({
      text: '```json\n{"firstname":false}\n```',
    });
    const result = await validateFields({ firstname: "akhsdgKAJHSDGH" });
    expect(result).toEqual({ firstname: false });
  });

  it("defaults a missing field to true", async () => {
    mockCerebras.mockResolvedValue({ text: '{"firstname":false}' });
    const result = await validateFields({
      firstname: "akhsdgKAJHSDGH",
      lastname: "Smith",
    });
    expect(result).toEqual({ firstname: false, lastname: true });
  });

  it("returns empty object for empty input without calling a provider", async () => {
    const result = await validateFields({});
    expect(result).toEqual({});
    expect(mockCerebras).not.toHaveBeenCalled();
  });

  it("uses person-oriented wording by default (no context)", async () => {
    mockCerebras.mockResolvedValue({ text: '{"firstname":true}' });
    await validateFields({ firstname: "John" });
    const prompt = mockCerebras.mock.calls[0][0] as string;
    expect(prompt).toMatch(/REAL human value/);
    expect(prompt).not.toMatch(/Razón Social/);
  });

  it("uses business-oriented wording when isCompany is true", async () => {
    mockCerebras.mockResolvedValue({
      text: '{"firstname":true,"lastname":true}',
    });
    await validateFields(
      { firstname: "Comercial Rios Ltda", lastname: "Venta de repuestos" },
      { isCompany: true },
    );
    const prompt = mockCerebras.mock.calls[0][0] as string;
    expect(prompt).toMatch(/REAL business value/);
    expect(prompt).toMatch(/legal\/trade name/);
    expect(prompt).not.toMatch(/REAL human value/);
  });

  it("treats a non-boolean value as true (only literal false blocks)", async () => {
    mockCerebras.mockResolvedValue({ text: '{"firstname":"maybe"}' });
    const result = await validateFields({ firstname: "John" });
    expect(result).toEqual({ firstname: true });
  });
});
