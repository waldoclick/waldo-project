---
phase: quick
plan: 11
subsystem: website/forms
tags: [paste-sanitization, input-validation, numeric-fields, vee-validate]
dependency_graph:
  requires: []
  provides: [paste-sanitization for year and decimal fields in FormCreateFour]
  affects: [apps/website/app/components/FormCreateFour.vue]
tech_stack:
  added: []
  patterns: [DOM mutation + v-model sync for paste sanitization, split-on-dot for single-decimal enforcement]
key_files:
  created: []
  modified:
    - apps/website/app/components/FormCreateFour.vue
decisions:
  - handleYearInput uses /\D/g (via prettier normalization of /[^0-9]/g) to strip all non-digit chars on paste
  - handleDecimalInput splits on "." and rejoins to keep first dot, producing "1.23" from "1.2.3"
  - form.value sync uses Record<string, unknown> cast to avoid TypeScript keyof narrowing issues
metrics:
  duration: 72s
  completed: "2026-03-11"
  tasks_completed: 2
  files_modified: 1
---

# Quick Task 11: Sanitize Paste Input in Numeric Fields — Summary

**One-liner:** DOM-level paste sanitizers for year (integer-only) and decimal fields (digits + single dot) with immediate vee-validate v-model sync.

## What Changed

`apps/website/app/components/FormCreateFour.vue` received two input handler additions:

### `handleYearInput` (new)

```typescript
// Sanitize paste/autofill for the year field — integer only, no decimals
const handleYearInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const sanitized = input.value.replace(/\D/g, "");
  input.value = sanitized;
  form.value.year = sanitized === "" ? 0 : Number(sanitized);
};
```

- Strips everything that is not a digit: handles `e`, `E`, `+`, `-`, `.`, and any non-numeric character pasted in
- Syncs `form.value.year` so vee-validate receives the sanitized integer immediately
- Wired to the year `<Field>` via `@input="handleYearInput"` alongside the existing `@keydown="handleIntegerKeydown"`

### `handleDecimalInput` (upgraded)

```typescript
// Sanitize paste/autofill for decimal fields — allow digits and at most one dot
const handleDecimalInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Strip non-numeric non-dot chars
  const stripped = input.value.replace(/[^\d.]/g, "");
  // Keep only the first dot: split into [integer, decimals...] and rejoin with one dot
  const parts = stripped.split(".");
  const sanitized =
    parts.length > 1 ? parts[0] + "." + parts.slice(1).join("") : parts[0];
  input.value = sanitized;
  // Sync v-model so vee-validate sees the sanitized value
  const fieldName = input.name as keyof typeof form.value;
  if (fieldName in form.value) {
    (form.value as Record<string, unknown>)[fieldName] =
      sanitized === "" ? 0 : Number(sanitized);
  }
};
```

Replaces the prior implementation that only stripped a leading minus sign.

- `/[^\d.]/g` removes `e`, `E`, `+`, `-`, and all non-numeric non-dot characters in one pass
- Split on `.` then rejoin: `"1.2.3"` → parts `["1","2","3"]` → `"1" + "." + "23"` = `"1.23"`
- `input.name` keyed into `form.value` via `Record<string, unknown>` cast — syncs vee-validate immediately

## Behavior Verification

| Input       | Field   | Before         | After    |
|-------------|---------|----------------|----------|
| `1e5`       | year    | `1e5` (shown)  | `` (cleared) |
| `-5`        | year    | `-5` (shown)   | `` (cleared) |
| `abc`       | year    | `abc` (shown)  | `` (cleared) |
| `1e5`       | weight  | `1e5` (shown)  | `15`     |
| `1.2.3`     | weight  | `1.2.3` (shown)| `1.23`   |
| `-3.5`      | weight  | `-3.5` (shown) | `3.5`    |
| `+3`        | weight  | `+3` (shown)   | `3`      |

## Commits

- `a2aac53` — `feat(quick-11): add handleYearInput sanitizer to year field`
- `c2c5da8` — `feat(quick-11): upgrade handleDecimalInput to full paste sanitizer`

## TypeScript Verification

```
yarn workspace website typecheck — No errors in FormCreateFour.vue
```

Both tasks passed TypeScript checks with zero errors. Pre-commit hooks (Prettier + ESLint) passed on both commits.

## Deviations from Plan

None — plan executed exactly as written.

Note: Prettier normalized `/[^0-9]/g` → `/\D/g` and `/[^0-9.]/g` → `/[^\d.]/g` during pre-commit formatting. These are functionally identical — no behavior change.

## Self-Check: PASSED

- `apps/website/app/components/FormCreateFour.vue` — FOUND ✓
- Commit `a2aac53` — FOUND ✓
- Commit `c2c5da8` — FOUND ✓
