import type { FieldMap, ValidationResult } from "./field-validation.types";

// Stub — fails all tests in RED phase (returns empty to demonstrate they're needed)
export async function validateFields(
  _fields: FieldMap,
): Promise<ValidationResult> {
  return {};
}
