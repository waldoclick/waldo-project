/**
 * ia — single entry point for all AI usage.
 *
 * Consolidates: provider selection + fallback chain, Opik tracing, text
 * generation, and registration field validation. Everything that uses AI goes
 * through here, so every call is traced in Opik and the fallback chain is
 * defined once.
 *
 * Low-level per-provider adapters live in ../services/{cerebras,groq,...} and
 * are consumed here; the external Opik SDK is wrapped here too.
 */

import { Opik, OpikSpanType } from "opik";
import { generateText as generateWithCerebras } from "../services/cerebras";
import { generateText as generateWithGroq } from "../services/groq";
import { generateText as generateWithDeepSeek } from "../services/deepseek";
import { generateText as generateWithGemini } from "../services/gemini";
import { generateWithSearch as generateWithAnthropic } from "../services/anthropic";

export interface AiResult {
  text: string;
}
export type FieldMap = Record<string, string>;
export type ValidationResult = Record<string, boolean>;

type AiProviderName = "cerebras" | "groq" | "deepseek" | "gemini" | "anthropic";

const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// ───────────────────────────── Opik tracing ─────────────────────────────
// Best-effort and strictly fail-safe: a tracing failure can never break or
// block an AI call. No OPIK_API_KEY → tracing is a no-op passthrough.

let opikClient: Opik | null = null;
let opikInitialized = false;

function getOpik(): Opik | null {
  if (opikInitialized) return opikClient;
  opikInitialized = true;

  const apiKey = process.env.OPIK_API_KEY ?? "";
  if (!apiKey) {
    opikClient = null;
    return null;
  }
  try {
    opikClient = new Opik({
      apiKey,
      workspaceName: process.env.OPIK_WORKSPACE ?? "",
      projectName: process.env.OPIK_PROJECT_NAME ?? "waldo-project",
      apiUrl: process.env.OPIK_URL_OVERRIDE ?? "https://www.comet.com/opik/api",
    });
  } catch (error: unknown) {
    strapi.log.warn(`[ia] opik init: ${message(error)}`);
    opikClient = null;
  }
  return opikClient;
}

function finishTrace(
  client: Opik,
  trace: ReturnType<Opik["trace"]> | null,
  span: ReturnType<ReturnType<Opik["trace"]>["span"]> | null,
  output: Record<string, unknown>,
): void {
  try {
    span?.update({ output }).end();
    trace?.update({ output }).end();
    void client
      .flush()
      .catch((error: unknown) =>
        strapi.log.warn(`[ia] opik flush: ${message(error)}`),
      );
  } catch (error: unknown) {
    strapi.log.warn(`[ia] opik finish: ${message(error)}`);
  }
}

/** Wrap an AI call in an Opik trace. Fail-safe: Opik errors never affect the result. */
async function traced(
  name: string,
  prompt: string,
  fn: () => Promise<AiResult>,
): Promise<AiResult> {
  const client = getOpik();
  if (!client) return fn();

  const input = { prompt };
  let trace: ReturnType<Opik["trace"]> | null = null;
  let span: ReturnType<ReturnType<Opik["trace"]>["span"]> | null = null;
  try {
    trace = client.trace({ name, input });
    span = trace.span({ name, type: OpikSpanType.Llm, input });
  } catch (error: unknown) {
    strapi.log.warn(`[ia] opik trace-start: ${message(error)}`);
    return fn();
  }

  try {
    const result = await fn();
    finishTrace(client, trace, span, { text: result.text });
    return result;
  } catch (error: unknown) {
    // The AI call itself failed — record it then re-throw so the caller's own
    // fallback/fail-open logic decides. Opik must not swallow AI errors.
    finishTrace(client, trace, span, { error: message(error) });
    throw error;
  }
}

// ──────────────────────── Provider selection + fallback ────────────────────────

const FALLBACK_ORDER: AiProviderName[] = [
  "cerebras",
  "groq",
  "deepseek",
  "gemini",
  "anthropic",
];
const DEFAULT_PROVIDER: AiProviderName = "cerebras";

const PROVIDERS: Record<AiProviderName, (prompt: string) => Promise<AiResult>> =
  {
    cerebras: generateWithCerebras,
    groq: generateWithGroq,
    deepseek: generateWithDeepSeek,
    gemini: generateWithGemini,
    anthropic: generateWithAnthropic,
  };

/** Provider from AI_PROVIDER env, default cerebras. Never crashes on a bad value. */
function resolveProvider(): AiProviderName {
  const envValue = process.env.AI_PROVIDER;
  if (envValue && FALLBACK_ORDER.includes(envValue as AiProviderName)) {
    return envValue as AiProviderName;
  }
  return DEFAULT_PROVIDER;
}

/** Run the provider chain (selected first, then the rest) and return the first success. */
async function runProviders(prompt: string): Promise<AiResult> {
  const selected = resolveProvider();
  const order = [selected, ...FALLBACK_ORDER.filter((p) => p !== selected)];

  for (const name of order) {
    try {
      return await PROVIDERS[name](prompt);
    } catch (error: unknown) {
      strapi.log.error(`[ia] ${name} failed: ${message(error)}`);
    }
  }
  throw new Error("[ia] all providers failed");
}

// ──────────────────────────── Public AI API ────────────────────────────

/** Generate text via the provider chain, traced in Opik. */
export const generate = (
  prompt: string,
  traceName = "ai.generate",
): Promise<AiResult> => traced(traceName, prompt, () => runProviders(prompt));

/** Article draft generation — same chain, distinct trace name. */
export const generateArticleDraft = (prompt: string): Promise<AiResult> =>
  generate(prompt, "article.generate");

// ───────────────────── Registration field validation ─────────────────────
// Asks the AI whether free-text values are plausibly real, per field. Fail-open
// (D-07): any error/timeout/unparseable response ⇒ true; only explicit false blocks.

/** Timeout in ms for the validation AI call (D-07: 3-4s range). */
export const VALIDATION_TIMEOUT_MS = 3500;

function buildValidationPrompt(fields: FieldMap): string {
  const fieldEntries = Object.entries(fields)
    .map(([key, value]) => `  "${key}": "${value}"`)
    .join(",\n");

  return `You are a data quality validator for a classified ads platform.

Your task: evaluate whether each of the following field values is a plausibly REAL human or business value.
A REAL value is something a genuine person would enter (e.g. a real name is "John", "María", "Smith" — not "akhsdgKAJHSDGH", "asdf", "123456789" or random characters).

Fields to validate:
{
${fieldEntries}
}

Respond with ONLY a JSON object (no prose, no markdown, no code fences) mapping each key to true (plausible) or false (not plausible).
Example response: {"firstname":true,"lastname":false}`;
}

function allTrue(fields: FieldMap): ValidationResult {
  return Object.keys(fields).reduce<ValidationResult>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
}

/** Strip leading/trailing markdown code fences so fenced JSON still parses. */
function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/** Race a promise against a timeout; always clears the timer. */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("[ia] AI call timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Validate a map of free-text field values. Returns a per-field boolean:
 *   true  → plausibly real (or AI unreachable — fail-open)
 *   false → explicitly rejected by the AI
 * NEVER throws.
 */
export async function validateFields(
  fields: FieldMap,
): Promise<ValidationResult> {
  if (Object.keys(fields).length === 0) return {};

  try {
    const aiResult = await withTimeout(
      generate(buildValidationPrompt(fields), "register.field-validation"),
      VALIDATION_TIMEOUT_MS,
    );

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(stripFences(aiResult.text)) as Record<
        string,
        unknown
      >;
    } catch {
      strapi.log.error("[ia] failed to parse validation response JSON");
      return allTrue(fields);
    }

    // Only a literal false blocks; missing/non-boolean ⇒ true (fail-open).
    return Object.keys(fields).reduce<ValidationResult>((acc, key) => {
      acc[key] = parsed[key] !== false;
      return acc;
    }, {});
  } catch (error: unknown) {
    strapi.log.error(`[ia] field validation failed: ${message(error)}`);
    return allTrue(fields);
  }
}
