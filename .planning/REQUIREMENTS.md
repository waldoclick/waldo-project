# Requirements: Waldo Project — v1.7 Cron Reliability

**Defined:** 2026-03-06
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.7 Requirements

Requirements for milestone v1.7 Cron Reliability. All cron files live in `apps/strapi/`.

### Bug Fixes

- [x] **CRON-01**: `user.cron.ts` deactivates ALL expired free ads for a user, not just the first one per user per run
- [ ] **CRON-02**: `backup.cron.ts` accesses the Strapi v5 database config via the correct path (`strapi.config.get('database').connection`)
- [ ] **CRON-03**: `backup.cron.ts` does not log the database password in plaintext (shell command is logged with password redacted or omitted)
- [ ] **CRON-04**: `cleanup.cron.ts` folder filter correctly retrieves files from the `ads` folder using a Strapi v5-compatible query approach
- [x] **CRON-05**: Unused `PaymentUtils` import is removed from `user.cron.ts`

### Documentation

- [ ] **DOC-01**: `cron-tasks.ts` has English comments documenting each job's purpose, schedule, and timezone
- [ ] **DOC-02**: `ad.cron.ts` has English comments explaining deduplication via `remainings`, deactivation on zero days, and daily report email
- [x] **DOC-03**: `user.cron.ts` has English comments explaining the multi-ad flow, user deduplication intent, reservation restore logic, and the 3-reservation guarantee
- [ ] **DOC-04**: `cleanup.cron.ts` has English comments explaining the audit-only approach, folder query strategy, and orphan detection logic
- [ ] **DOC-05**: `backup.cron.ts` has English comments explaining config path, command construction, compression, rotation, and the password-redaction approach

## Future Requirements

### Cron Monitoring

- **MON-01**: Cron jobs emit structured log events (start, end, duration, count of records affected) compatible with Logtail
- **MON-02**: Failed cron runs send an alert email to `ADMIN_EMAILS`

### Cleanup Enhancement

- **CLEA-01**: `cleanup.cron.ts` optionally deletes orphan images when `DELETE_ORPHANS=true` env var is set

## Out of Scope

| Feature | Reason |
|---------|--------|
| Unit tests for cron jobs | Testing milestone deferred; same policy as rest of codebase |
| Cron UI / admin panel | Out of scope for this project |
| Distributed cron locking | Single-instance deployment on Forge; no concurrent runs possible |
| Changing backup destination (S3, etc.) | `process.cwd()/backups` is sufficient for current Forge deploy |
| Auto-delete orphan images | Audit-only is the safe default; deletion deferred to CLEA-01 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRON-01 | Phase 20 | Complete |
| CRON-02 | Phase 21 | Pending |
| CRON-03 | Phase 21 | Pending |
| CRON-04 | Phase 22 | Pending |
| CRON-05 | Phase 20 | Complete |
| DOC-01 | Phase 23 | Pending |
| DOC-02 | Phase 23 | Pending |
| DOC-03 | Phase 20 | Complete |
| DOC-04 | Phase 22 | Pending |
| DOC-05 | Phase 21 | Pending |

**Coverage:**
- v1.7 requirements: 10 total
- Mapped to phases: 10 ✓
- Unmapped: 0

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 after initial definition*
