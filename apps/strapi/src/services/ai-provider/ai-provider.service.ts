import { generateText as generateWithCerebras } from "../cerebras";
import { generateText as generateWithGroq } from "../groq";
import { generateText as generateWithDeepSeek } from "../deepseek";
import { generateText as generateWithGemini } from "../gemini";
import { generateWithSearch as generateWithAnthropic } from "../anthropic";
import type {
  AiProviderName,
  IAiProviderResult,
  IAiProviderService,
} from "./ai-provider.types";

// Fixed fallback order — documented preference (D-02)
const FALLBACK_ORDER: AiProviderName[] = [
  "cerebras",
  "groq",
  "deepseek",
  "gemini",
  "anthropic",
];

const DEFAULT_PROVIDER: AiProviderName = "cerebras"; // D-01

// Uniform provider map — hides the generateText vs generateWithSearch naming inconsistency
const PROVIDERS: Record<
  AiProviderName,
  (prompt: string) => Promise<IAiProviderResult>
> = {
  cerebras: generateWithCerebras,
  groq: generateWithGroq,
  deepseek: generateWithDeepSeek,
  gemini: generateWithGemini,
  anthropic: generateWithAnthropic,
};

/**
 * Resolves the starting provider from the AI_PROVIDER env var (D-03).
 * Falls back to DEFAULT_PROVIDER if unset or invalid — never crashes on bad env value.
 */
function resolveProvider(): AiProviderName {
  const envValue = process.env.AI_PROVIDER;
  if (envValue && FALLBACK_ORDER.includes(envValue as AiProviderName)) {
    return envValue as AiProviderName;
  }
  return DEFAULT_PROVIDER;
}

/**
 * Builds the ordered list of providers to try.
 * The resolved provider comes first, followed by the remaining FALLBACK_ORDER entries (deduped).
 */
function buildAttemptOrder(selected: AiProviderName): AiProviderName[] {
  const rest = FALLBACK_ORDER.filter((p) => p !== selected);
  return [selected, ...rest];
}

/**
 * AI Provider Orchestrator Service.
 * Selects provider from AI_PROVIDER env var (default: cerebras) and falls back
 * across the fixed FALLBACK_ORDER chain on call-time failure.
 */
export class AiProviderService implements IAiProviderService {
  /**
   * Generic text generation — runs the full provider chain and returns the
   * first successful result. Both field-validation and article generation
   * delegate here so the fallback chain is defined exactly once.
   */
  async generate(prompt: string): Promise<IAiProviderResult> {
    // Resolve at call time so env overrides in tests take effect per-call
    const selectedProvider = resolveProvider();
    const attemptOrder = buildAttemptOrder(selectedProvider);

    for (const providerName of attemptOrder) {
      try {
        const result = await PROVIDERS[providerName](prompt);
        return result;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        strapi.log.error(`[ai-provider] ${providerName} failed: ${message}`);
      }
    }

    throw new Error("[ai-provider] all providers failed");
  }

  /** Article draft generation — delegates to the shared generate() method. */
  async generateArticleDraft(prompt: string): Promise<IAiProviderResult> {
    return this.generate(prompt);
  }
}
