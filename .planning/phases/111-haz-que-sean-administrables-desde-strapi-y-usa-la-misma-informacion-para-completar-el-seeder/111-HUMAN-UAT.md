---
status: partial
phase: 111-haz-que-sean-administrables-desde-strapi-y-usa-la-misma-informacion-para-completar-el-seeder
source: [111-VERIFICATION.md]
started: 2026-04-04T00:00:00Z
updated: 2026-04-04T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Policy collection type visible en Strapi admin
expected: Strapi admin muestra un collection type "Policy" con campos title (string), text (richtext), order (integer)
result: [pending]

### 2. Seeder crea 16 registros
expected: Con APP_RUN_SEEDERS=true, al iniciar Strapi se crean exactamente 16 policy records
result: [pending]

### 3. Seeder es idempotente
expected: Correr el seeder una segunda vez no duplica registros
result: [pending]

### 4. Endpoint público accesible
expected: curl http://localhost:1337/api/policies retorna HTTP 200 (permisos Public habilitados)
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
