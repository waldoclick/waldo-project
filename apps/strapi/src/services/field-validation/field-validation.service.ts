import { generate } from "../ai-provider";
import { TIMEOUT_MS, buildValidationPrompt } from "./field-validation.config";
import type { FieldMap, ValidationResult } from "./field-validation.types";

/**
 * Returns a ValidationResult with every requested field set to true.
 * Used as the fail-open default whenever the AI call fails for any reason (D-07).
 */
function allTrue(fields: FieldMap): ValidationResult {
  return Object.keys(fields).reduce<ValidationResult>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
}

/**
 * Strips leading/trailing Markdown code fences (```json ... ``` or ``` ... ```)
 * so that fallback-provider responses that wrap JSON in a fence can still be parsed.
 * Non-Cerebras providers often return fenced JSON (see STATE.md 02-01 caveat).
 */
function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/**
 * Wraps an async call in a Promise.race with a timeout.
 * The timer is always cleared via finally — no dangling handles.
 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("[field-validation] AI call timed out"));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Validates a map of free-text field values using the AI provider.
 *
 * Returns a per-field boolean map:
 *   - true  → field value is plausibly real (or AI could not be reached)
 *   - false → field value is explicitly rejected by the AI
 *
 * This function NEVER throws. Any failure (network error, timeout, unparseable JSON,
 * missing field in response) results in true for the affected field — fail-open (D-07).
 *
 * @param fields - Map of field names to their free-text values to validate.
 *                 The service is GENERIC — it validates whatever fields the caller provides.
 * @returns Promise resolving to a ValidationResult (never rejects).
 */
export async function validateFields(
  fields: FieldMap,
): Promise<ValidationResult> {
  // Short-circuit empty input — no AI call needed
  if (Object.keys(fields).length === 0) {
    return {};
  }

  try {
    const aiResult = await withTimeout(
      generate(buildValidationPrompt(fields)),
      TIMEOUT_MS,
    );

    // Parse the AI response — strip fences first (fallback providers may fence JSON)
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(stripFences(aiResult.text)) as Record<
        string,
        unknown
      >;
    } catch {
      strapi.log.error("[field-validation] failed to parse AI response JSON");
      return allTrue(fields);
    }

    // Build result by iterating REQUESTED keys — only literal false blocks a registration
    return Object.keys(fields).reduce<ValidationResult>((acc, key) => {
      acc[key] = parsed[key] !== false;
      return acc;
    }, {});
  } catch (error: unknown) {
    // Fail-open: any error (network, timeout, all providers failed) → all true (D-07)
    const message = error instanceof Error ? error.message : String(error);
    strapi.log.error(`[field-validation] AI call failed: ${message}`);
    return allTrue(fields);
  }
}
