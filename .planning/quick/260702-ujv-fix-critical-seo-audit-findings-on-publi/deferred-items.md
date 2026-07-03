# Deferred Items — 260702-ujv

Out-of-scope discoveries logged during execution, not fixed (per SCOPE BOUNDARY rule
and the plan's explicit file list).

## 1. `apps/website/app/pages/blog/[slug].vue` still references `${config.public.baseUrl}/share.jpg`

- **Found during:** Task 2 (fix broken OG/social share image paths)
- **Lines:** 127, 141 (pre-edit line numbers)
- **Issue:** Same broken-image-path bug (404, no file at `/share.jpg`) that Task 2 fixes
  across 11 other files. `blog/[slug].vue` has the identical pattern but is absent from
  both Task 2's file list and the plan's explicit "out of scope" list — a genuine audit
  gap, not an intentional exclusion (blog/index.vue, the list page, WAS in scope and
  fixed; the detail page was missed).
- **Action taken:** Left untouched, per plan scope boundaries and the project's
  "only fix what's approved" convention. Flagging here for a future quick task or
  plan revision to close this gap.
- **Fix (when picked up):** Replace `${config.public.baseUrl}/share.jpg` with
  `${config.public.baseUrl}/images/share.jpg` at both occurrences, same as the rest
  of Task 2.

## 2. Plan's regression-test ad fixture (`alexandra-hester-1771545556625`) is stale

- **Found during:** Task 1 verification
- **Issue:** The plan listed this ad slug as a "currently 200 OK, must stay 200 OK"
  regression check. After the Task 1 fix, this slug correctly returns 404 — the ad
  no longer exists / is not accessible via the website's `/api/ads/slug/:slug` proxy
  route (confirmed directly: `{"error":{"status":404,"message":"Ad not found or
  access denied"}}`). The plan's original "200 OK" observation was itself an
  instance of the soft-404 bug being fixed — the buggy pre-fix code always returned
  HTTP 200 regardless of whether the ad data actually loaded, so the curl-based
  regression baseline captured in the plan never actually confirmed the ad was
  loadable.
- **Action taken:** Substituted a genuinely active ad slug
  (`maxine-pugh-1775416573859`, confirmed active via `/api/ads/catalog`) for the
  regression check. No code change required — this is a test-data/documentation
  issue only, not a defect in the fix.
