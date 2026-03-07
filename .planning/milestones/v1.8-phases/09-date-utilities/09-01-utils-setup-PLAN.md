---
phase: 09-date-utilities
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/utils/date.ts
  - apps/dashboard/tests/utils/date.test.ts
autonomous: true
requirements:
  - UTIL-01
must_haves:
  truths:
    - "app/utils/date.ts exists"
    - "formatDate exports relative time logic"
    - "formatDateShort exports absolute date logic"
    - "Tests pass for both functions"
  artifacts:
    - path: "apps/dashboard/app/utils/date.ts"
      provides: "Date formatting utilities"
      exports: ["formatDate", "formatDateShort"]
    - path: "apps/dashboard/tests/utils/date.test.ts"
      provides: "Unit tests for date utils"
  key_links: []
---

<objective>
Create the centralized date utility file with `formatDate` (relative time) and `formatDateShort` (absolute date), along with comprehensive unit tests.

Purpose: Centralize date formatting logic to ensure consistency and maintainability across the dashboard.
Output: `apps/dashboard/app/utils/date.ts` and `apps/dashboard/tests/utils/date.test.ts`.
</objective>

<execution_context>
@/home/gabriel/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/phases/09-date-utilities/09-CONTEXT.md
@.planning/REQUIREMENTS.md

# Existing pattern for relative time (if any) or standard Intl usage
# No specific existing relative time code found, implementing fresh using Intl.RelativeTimeFormat
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create date utilities</name>
  <files>apps/dashboard/app/utils/date.ts</files>
  <action>
    Create `apps/dashboard/app/utils/date.ts`.
    Implement two exported functions:
    
    1. `formatDate(dateString: string | undefined): string`
       - Returns "--" if input is undefined/null/empty.
       - Parses `dateString` (assume UTC ISO string).
       - Returns RELATIVE time string (e.g., "hace 2 horas", "hace 5 minutos") using `Intl.RelativeTimeFormat` ("es-CL").
       - Logic: Calculate difference between now and date. Choose appropriate unit (seconds, minutes, hours, days, months, years).
    
    2. `formatDateShort(dateString: string | undefined): string`
       - Returns "--" if input is undefined/null/empty.
       - Returns ABSOLUTE date string (e.g., "05 mar 2026") using `Intl.DateTimeFormat` ("es-CL").
       - Options: `{ day: "numeric", month: "short", year: "numeric" }`.
       - Ensure consistent casing (lowercase months in Spanish usually).
  </action>
  <verify>
    File exists.
    cat apps/dashboard/app/utils/date.ts | grep "export const formatDate"
  </verify>
  <done>
    File created with both functions correctly typed and exported.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create unit tests</name>
  <files>apps/dashboard/tests/utils/date.test.ts</files>
  <action>
    Create `apps/dashboard/tests/utils/date.test.ts`.
    Write tests using `vitest`:
    
    - Test `formatDate`:
      - Undefined/null/empty -> "--"
      - Recent date -> "hace X segundos/minutos"
      - Older date -> "hace X días"
    
    - Test `formatDateShort`:
      - Undefined/null/empty -> "--"
      - Valid date -> "DD mmm YYYY" (e.g. "5 mar 2026")
    
    Ensure you handle the directory creation if `apps/dashboard/tests/utils` does not exist.
  </action>
  <verify>
    <automated>cd apps/dashboard && npx vitest run tests/utils/date.test.ts</automated>
  </verify>
  <done>
    All tests pass.
  </done>
</task>

</tasks>

<verification>
Run `npx vitest run` in `apps/dashboard` to ensure clean environment.
</verification>

<success_criteria>
- `app/utils/date.ts` created.
- `formatDate` implements relative time.
- `formatDateShort` implements absolute date.
- Tests pass.
</success_criteria>

<output>
After completion, create `.planning/phases/09-date-utilities/09-01-SUMMARY.md`
</output>
