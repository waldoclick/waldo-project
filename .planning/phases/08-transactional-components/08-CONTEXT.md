# Phase 8: Transactional Components - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove the redundant `onMounted` data-loading hook from all four transactional components:
`ReservationsFree.vue`, `ReservationsUsed.vue`, `FeaturedFree.vue`, `FeaturedUsed.vue`.

Each component already triggers its fetch via `watch({ immediate: true })`, making `onMounted` a duplicate that fires a second identical network request on every mount. This is purely subtractive — no new code is added.

</domain>

<decisions>
## Implementation Decisions

### Data-loading trigger
- `watch({ immediate: true })` is the sole correct trigger — established in v1.1 and applied in Phase 7
- Remove `onMounted` import and call from all four components
- Do NOT add any guard state (hasMounted, isFetching) to compensate

### searchParams type
- Change `searchParams: any` → `searchParams: Record<string, unknown>` in all four components
- This is the Strapi SDK v5 cast pattern locked in v1.1 (Key Decisions in PROJECT.md)

### ReservationsUsed.vue — special case
- This component uses **client-side pagination**: fetches all 1000 records (`pageSize: 1000`), then filters/paginates in memory via computed properties
- It has a **secondary watch** on `totalPages.value` for page bounds enforcement — this watch must NOT be touched
- Only the `onMounted(() => { fetchUsedReservations(); })` block is removed
- The `searchParams: any` fix still applies

### Shared store section keys (known, do not change)
- Both Reservations* share `section = "reservations"` — this is pre-existing, not introduced here
- Both Featured* share `section = "featured"` — same
- Consolidation of these shared keys is explicitly deferred to COMP-05 (Future Requirements)

### Build gate
- `yarn build` in `apps/dashboard` must exit 0 with `typeCheck: true` clean — same gate as Phase 7

</decisions>

<specifics>
## Specific Ideas

No specific requirements — the pattern is fully established. Apply Phase 7 approach identically to these four components.

Per-component change summary:

**ReservationsFree.vue (DFX-07):**
- Import: remove `onMounted` from `import { ref, computed, onMounted, watch }`
- Delete: `onMounted(() => { fetchFreeReservations(); });` (lines ~230-232)
- Fix: `searchParams: any` → `searchParams: Record<string, unknown>` (line ~123)

**ReservationsUsed.vue (DFX-08):**
- Import: remove `onMounted` from `import { ref, computed, onMounted, watch }`
- Delete: `onMounted(() => { fetchUsedReservations(); });` (lines ~264-266)
- Fix: `searchParams: any` → `searchParams: Record<string, unknown>` (line ~123)
- Keep: secondary watch on `totalPages.value` (lines ~254-261) — untouched

**FeaturedFree.vue (DFX-09):**
- Import: remove `onMounted` from `import { ref, computed, onMounted, watch }`
- Delete: `onMounted(() => { fetchFreeFeatured(); });` (lines ~247-249)
- Fix: `searchParams: any` → `searchParams: Record<string, unknown>` (line ~122)

**FeaturedUsed.vue (DFX-10):**
- Import: remove `onMounted` from `import { ref, computed, onMounted, watch }`
- Delete: `onMounted(() => { fetchUsedFeatured(); });` (lines ~256-258)
- Fix: `searchParams: any` → `searchParams: Record<string, unknown>` (line ~127)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Canonical pattern: `AdsTable.vue` — `watch({ immediate: true })` as sole data-loading trigger, no `onMounted`
- Phase 7 PLAN (07-01-PLAN.md) — exact task structure to replicate for this phase

### Established Patterns
- `watch({ immediate: true })` — the only correct data-loading trigger (v1.1 decision, locked)
- `searchParams: Record<string, unknown>` — Strapi SDK v5 cast pattern (v1.1 decision, locked)
- `response.data as T[]` — Strapi response cast pattern (already used in all four components)
- Server-side pagination (ReservationsFree, FeaturedFree, FeaturedUsed): Strapi handles page/pageCount/total via `paginationMeta`
- Client-side pagination (ReservationsUsed): fetch all 1000, filter in computed, paginate in computed

### Integration Points
- `useSettingsStore()` — settings store provides `reservations.*` and `featured.*` section keys
- `useStrapi()` — Strapi SDK called inside fetch functions (auto-import, already working)
- `strapi.find("ad-reservations", ...)` and `strapi.find("ad-featured-reservations", ...)` — endpoints unchanged

</code_context>

<deferred>
## Deferred Ideas

- COMP-05: Consolidate Reservations*/Featured* (shared store keys conflict) — explicitly out of scope, in Future Requirements
- None from discussion — phase scope was clear from the start

</deferred>

---

*Phase: 08-transactional-components*
*Context gathered: 2026-03-05*
