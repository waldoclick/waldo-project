import type { FieldMap } from "./field-validation.types";

/** Timeout in milliseconds for AI validation calls (D-07: 3-4s range). */
export const TIMEOUT_MS = 3500;

/**
 * Builds the validation prompt for the AI.
 * Instructs the model to judge whether each value is a plausibly real human/business value
 * and to respond with ONLY a JSON object mapping each key to a boolean.
 */
export function buildValidationPrompt(fields: FieldMap): string {
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
