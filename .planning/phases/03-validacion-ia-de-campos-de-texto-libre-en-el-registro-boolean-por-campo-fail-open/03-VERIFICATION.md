---
phase: 03-validacion-ia-de-campos-de-texto-libre-en-el-registro-boolean-por-campo-fail-open
verified: 2026-06-15T22:55:00Z
status: passed
score: 6/6 must-haves verified
re_verification: false
---

# Phase 03: AI Field Validation at Registration — Verification Report

**Phase Goal:** AI semantic validation of free-text registration fields (firstname/lastname; for companies = Razón Social/Giro). The AI returns a per-field boolean; if a field is explicitly false the registration is rejected with a field-specific Spanish message. CRITICAL fail-open: any AI error/timeout/no-tokens/unparseable response assumes true and registration proceeds; only an explicit false blocks.

**Verified:** 2026-06-15T22:55:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | field-validation service exists with `validateFields` returning per-field booleans and is structurally fail-open (timeout + try/catch + parse-failure + missing-field → true; only explicit false stays false) | VERIFIED | `field-validation.service.ts` implements `withTimeout`, `allTrue`, `stripFences`; outer try/catch returns `allTrue` on any error; inner try/catch returns `allTrue` on parse failure; per-key logic `parsed[key] !== false` handles missing/non-boolean as true; 9-case Jest suite green |
| 2 | The gate is wired in `registerUserLocal` (authController.ts) BEFORE the built-in register, validating only firstname/lastname, rejecting with Spanish messages | VERIFIED | `authController.ts` lines 193–209: `fieldsToValidate` built with presence guards for firstname/lastname only; `validateFields` called before `ensureUniqueUsername` and `registerController`; Test A asserts `registerController` not called on explicit false |
| 3 | An end-to-end test proves a failing/rejecting AI provider still lets registration proceed (fail-open) | VERIFIED | `authController.register-failopen.test.ts` Test E: real `validateFields` + `generate` mock returning `mockRejectedValue(new Error("AI down"))` → `registerController` called once; suite passes |
| 4 | No residual address/business_* AI validation (Option A scope) | VERIFIED | `grep -rn "validateFields" apps/strapi/src` yields exactly 3 references: definition, index re-export, and one call site in `authController.ts`; `grep -rni "business_|razon_social|giro|\.address" apps/strapi/src | grep "validate|generate|ai-provider"` returns empty |
| 5 | `FormRegister.vue` surfaces the rejection message | VERIFIED | Lines 426–438: `err.error?.message` path → `else` branch displays `strapiMessage` verbatim; clarifying comment added: "Also surfaces AI free-text validation rejections from registerUserLocal" |
| 6 | Strapi + website typecheck clean; relevant Jest suites pass | VERIFIED | `npx tsc --noEmit` exits 0 (Strapi); `npx nuxt typecheck` exits clean (website, localhost URL warning only); 9/9 field-validation tests pass; 45/45 authController.test.ts pass; 1/1 fail-open test passes |

**Score:** 6/6 truths verified

---

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `apps/strapi/src/services/field-validation/field-validation.service.ts` | VERIFIED | 98 lines; exports `validateFields`; imports `generate` from `../ai-provider`; `withTimeout`, `allTrue`, `stripFences` implemented; no `any` |
| `apps/strapi/src/services/field-validation/field-validation.config.ts` | VERIFIED | `TIMEOUT_MS = 3500`; `buildValidationPrompt(fields: FieldMap): string` present |
| `apps/strapi/src/services/field-validation/field-validation.types.ts` | VERIFIED | `FieldMap`, `ValidationResult`, `IFieldValidationService` exported |
| `apps/strapi/src/services/field-validation/index.ts` | VERIFIED | Re-exports `validateFields` and all types per CLAUDE.md convention |
| `apps/strapi/src/services/ai-provider/index.ts` | VERIFIED | `export const generate = (prompt: string) => getAiProviderService().generate(prompt)` present alongside `generateArticleDraft` |
| `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` | VERIFIED | Import at line 4; `FIELD_REJECTION_MESSAGES` constant at lines 9–12; gate at lines 193–209 with presence guards, `validateFields` call, failedField check, `ctx.badRequest` with Spanish message |
| `apps/strapi/tests/services/field-validation/field-validation.service.test.ts` | VERIFIED | 167 lines; all 9 behavior cases present and passing (explicit false, all-true, throw, timeout, unparseable, fence-strip, missing field, empty input, non-boolean) |
| `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` | VERIFIED | `describe("registerUserLocal AI validation gate")` at line 1133; Tests A/B/D implemented and passing; `jest.mock("../../../../src/services/field-validation")` at file top |
| `apps/strapi/tests/extensions/users-permissions/controllers/authController.register-failopen.test.ts` | VERIFIED | Test E present; `mockRejectedValue(new Error("AI down"))` at line 16; real `validateFields` (field-validation not mocked); `registerController` call asserted |
| `apps/website/app/components/FormRegister.vue` | VERIFIED | `err.error?.message` path present; clarifying comment at line 431 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `field-validation.service.ts` | `ai-provider/index.ts` | `import { generate } from "../ai-provider"` | WIRED | Line 1 of service; `generate(buildValidationPrompt(fields))` called inside `withTimeout` |
| `authController.ts` | `services/field-validation` | `import { validateFields } from "../../../services/field-validation"` | WIRED | Line 4; `validateFields(fieldsToValidate)` called at line 200 |
| `authController.ts` | `ctx.badRequest` | field-specific Spanish message on explicit false | WIRED | Lines 204–208: `if (failedField) return ctx.badRequest(FIELD_REJECTION_MESSAGES[failedField] ?? "Algunos datos no parecen válidos")` |
| `FormRegister.vue` catch | Spanish rejection message | `err.error?.message` in else branch | WIRED | Line 427 reads `err.error?.message`; else branch at line 430 displays it via `Swal.fire` verbatim |

---

### Requirements Coverage

No requirement IDs were mapped to this phase in REQUIREMENTS.md. N/A.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No stubs, placeholders, or empty returns found in phase artifacts |

**Notes:**
- `userController.test.ts` has 6 pre-existing failures unrelated to this phase (scoped out per SUMMARY 03-02). These failures predate this phase and are not caused by it.
- The word "any" appears in a code comment in `field-validation.service.ts` line 93 ("any error") — this is not a TypeScript `any` type usage.

---

### Human Verification Required

None. All critical behaviors are proven programmatically:

- Explicit false → rejection: Test A (mocked gate, checks `ctx.badRequest` called with exact string and `registerController` not called)
- All-true → proceed: Test B
- Only firstname/lastname sent to AI: Test D (asserts exact key set and no excluded fields)
- AI failure → registration proceeds: Test E (real service, rejecting provider, `registerController` called)
- Fence-stripping: Test 6 (```json wrapped response parsed to `{firstname: false}`)
- Timeout: Test 4 (fake timers, never-resolving promise, `TIMEOUT_MS + 100` advance → all-true)

The Spanish messages shown to users ("El nombre no parece válido", "El apellido no parece válido") are visible in `FIELD_REJECTION_MESSAGES` and asserted verbatim in Test A.

---

## Verification Summary

All 6 must-haves are fully satisfied:

1. **field-validation service** — Exists, substantive (98 lines, 4-file CLAUDE.md structure), wired (imported and called in authController). Fail-open is a structural property of the implementation: three independent failure paths (outer catch, inner parse catch, missing-key logic) all resolve to `allTrue`, never throw. Proven by 9 Jest tests.

2. **Gate in registerUserLocal** — Inserted at the correct position (after password validation, before `ensureUniqueUsername` and `registerController`). Presence guards prevent empty fields from reaching AI. Exactly and only firstname/lastname are sent. Explicit false triggers `ctx.badRequest` with field-specific Spanish message before the built-in register is ever called.

3. **End-to-end fail-open proof** — Dedicated sibling test file uses the real `validateFields` service with a rejecting `ai-provider.generate` mock. Asserts `registerController` is called despite AI downtime. The sibling file pattern is architecturally necessary (jest.mock hoisting conflict).

4. **No residual scope creep** — Only one call site for `validateFields` in the entire Strapi codebase. No business/address fields are sent to AI anywhere.

5. **Frontend surfacing** — `FormRegister.vue` existing `err.error?.message` path handles all `ctx.badRequest` strings verbatim, including the new AI rejection messages.

6. **Type safety and tests** — Strapi `tsc --noEmit` exits 0; Nuxt typecheck clean; all three relevant Jest suites pass (9 + 45 + 1 = 55 tests green).

---

_Verified: 2026-06-15T22:55:00Z_
_Verifier: Claude (gsd-verifier)_
