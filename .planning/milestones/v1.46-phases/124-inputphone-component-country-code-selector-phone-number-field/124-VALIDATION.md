---
phase: 124
slug: inputphone-component-country-code-selector-phone-number-field
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 124 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @vue/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace @waldo/website vitest run tests/components/InputPhone.test.ts` |
| **Full suite command** | `yarn workspace @waldo/website vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace @waldo/website vitest run tests/components/InputPhone.test.ts`
- **After every plan wave:** Run `yarn workspace @waldo/website vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 124-01-01 | 01 | 1 | PHONE-01 | unit | `vitest run tests/components/InputPhone.test.ts` | ❌ W0 | ⬜ pending |
| 124-01-02 | 01 | 1 | PHONE-02 | unit | `vitest run tests/components/InputPhone.test.ts` | ❌ W0 | ⬜ pending |
| 124-01-03 | 01 | 1 | PHONE-03 | static/grep | `grep -r "libphonenumber\|intl-tel-input" apps/` | ✅ | ⬜ pending |
| 124-02-01 | 02 | 2 | PHONE-04 | static/grep | `grep -n 'handlePhoneInput' apps/website/app/components/FormProfile.vue apps/website/app/components/FormCreateThree.vue apps/website/app/components/FormContact.vue` | ✅ | ⬜ pending |
| 124-02-02 | 02 | 2 | PHONE-05 | static/grep | `grep -n 'type="phone"\|type="tel"' apps/website/app/components/FormProfile.vue` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/components/InputPhone.test.ts` — stubs for PHONE-01, PHONE-02 (created in Plan 124-01 Task 2)
- [ ] `apps/website/app/data/countries.json` — data file needed before component implementation (created in Plan 124-01 Task 1)
- [ ] `apps/website/app/scss/components/_input.scss` — new SCSS file for website input styles (created in Plan 124-01 Task 1)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chile (+56) pre-selected visually | PHONE-01 | Visual default state | Open any form with `<InputPhone>` in browser, confirm Chile flag/code is selected |
| Existing phone value decomposes correctly | PHONE-02 | Requires real browser render | Set user phone to `+56912345678`, open FormProfile, confirm selector shows +56 and number shows 912345678 |
| Submit with new country code | PHONE-04 | Requires form submission | Change dial code to +54, type number, submit FormCreateThree, confirm Strapi receives `+54XXXXXXXXX` |

---

## Test Cases Reference

```typescript
// apps/website/tests/components/InputPhone.test.ts
describe('InputPhone', () => {
  describe('PHONE-01: Initial render', () => {
    it('renders a select and an input')
    it('defaults selected dial code to +56 (Chile) when modelValue is empty')
    it('shows Chile as first option in select')
  })

  describe('PHONE-02: v-model decomposition', () => {
    it('parses +56912345678 into dialCode=+56 and localNumber=912345678')
    it('parses +54912345678 into dialCode=+54 and localNumber=912345678')
    it('uses longest-match: +1868912345 parses as +1868 not +1')
    it('falls back to +56 when value has no matching prefix')
    it('falls back to +56 when value does not start with +')
  })

  describe('PHONE-02: Emit behavior', () => {
    it('emits update:modelValue with combined string when select changes')
    it('emits update:modelValue with combined string when input changes')
    it('emits dialCode + empty string when localNumber is cleared')
  })
})
```
