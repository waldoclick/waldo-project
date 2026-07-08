# Branch Protection — `main`

`main` is the production branch (manual deploys ship from it). It must only change through a reviewed PR
whose CI check passed. Applying this requires **GitHub admin** on `waldoclick/waldo-project`, so it is a
manual step (Claude does not change repo governance automatically).

Prerequisite: the `ci` workflow (`.github/workflows/ci.yml`) must exist on `main` first, so the required
status-check contexts `ci (22)` and `ci (24)` (one per Node matrix version) are selectable. Merge the
Phase 1 PR before (or together with) enabling this.

## Option A — GitHub CLI (fastest)

```bash
gh api -X PUT repos/waldoclick/waldo-project/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["ci (22)", "ci (24)"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

What each setting does:
- `required_status_checks.contexts: ["ci (22)", "ci (24)"]` — both Node-matrix jobs must pass before merge. `strict: true` — the branch must be up to date with `main` first.
- `required_pull_request_reviews` (non-null, 0 approvals) — forces changes through a PR (no direct pushes). Raise `required_approving_review_count` to `1` if you want a human approval too.
- `enforce_admins: true` — admins are also blocked from pushing directly (the setting that actually stops direct pushes to `main`). Temporarily disable only for a genuine hotfix.
- `allow_force_pushes: false`, `allow_deletions: false` — protect `main` from force-push and deletion.

Verify:

```bash
gh api repos/waldoclick/waldo-project/branches/main/protection | jq '{checks: .required_status_checks.contexts, admins: .enforce_admins.enabled, pr: .required_pull_request_reviews}'
```

## Option B — GitHub UI

Settings → Branches → Add branch ruleset (or "Add rule") for `main`:
1. Require a pull request before merging (approvals optional).
2. Require status checks to pass → search and select **both `ci (22)` and `ci (24)`**. Enable "Require branches to be up to date before merging".
3. Do not allow bypassing the above settings (include administrators).
4. Block force pushes and deletions.

## Acceptance

- A direct `git push origin main` is rejected.
- A PR to `main` cannot be merged until both `ci (22)` and `ci (24)` checks are green.
