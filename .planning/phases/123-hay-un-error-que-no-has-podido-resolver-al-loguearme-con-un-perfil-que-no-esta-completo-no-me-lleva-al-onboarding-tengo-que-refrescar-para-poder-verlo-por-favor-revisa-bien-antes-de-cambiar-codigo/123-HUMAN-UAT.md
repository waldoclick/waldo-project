---
status: passed
phase: 123-onboarding-redirect-fix
source: [123-VERIFICATION.md]
started: 2026-04-11T00:00:00Z
updated: 2026-04-12T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Email+OTP login with incomplete profile
expected: After completing OTP verification, user is redirected immediately to /onboarding without needing to refresh the page
result: passed

### 2. Google login with incomplete profile
expected: After Google OAuth callback completes, user is redirected immediately to /onboarding without needing to refresh the page
result: passed

### 3. Facebook login with incomplete profile
expected: After Facebook OAuth callback completes, user is redirected immediately to /onboarding without needing to refresh the page
result: passed

### 4. Complete-profile login regression
expected: A user with a complete profile lands on /anuncios (or referer), never on /onboarding
result: passed

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
