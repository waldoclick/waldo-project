# Deploy Checklist & Recovery

Manual deploys, one app at a time. **Always deploy to staging first, validate, then production.**
Environment facts and rationale: `docs/deployment.md` and `docs/deployment-improvement-roadmap.md`.

Golden rules:
- Deploy production **only from `main`**, and only when the `ci` check is green.
- Never edit `main` directly — changes land via reviewed PR (see `docs/branch-protection.md`).
- Production DB is **MySQL** (`waldo_production`); Redis cache is **on**; Cloudflare zones are **per-environment**.

---

## Pre-flight (both apps)

1. The change is merged to `main` via a PR whose `ci` check passed.
2. It has been validated on **staging** (`develop` preview for the website; the staging Strapi for the API).
3. You know what changed — schema? env vars? cache-affecting? payment flow? Plan the extra steps below accordingly.

---

## Website (Vercel)

1. Deploy: promote the already-validated **staging/preview** deployment to production
   (`vercel promote <preview-url>`), or `vercel --prod` from `main`. Prefer promoting the exact artifact you validated over a fresh prod build.
2. Health check: `https://www.waldo.click/` loads; `https://www.waldo.click/dashboard` loads for a logged-in user.
3. Check Sentry (waldo-website) for new error spikes.

**Rollback (website):** Vercel dashboard → Deployments → pick the last-good production deployment → **Promote to Production** (or `vercel promote <good-url>`). Instant; no rebuild.

---

## Strapi (Forge — `api.waldo.click`, PM2 `waldo-api`)

Ordered for a safe release. Steps 1 and 5 matter most when the release changes the schema.

1. **Backup the database FIRST** (see "Database backup" below) — before anything else.
2. **Deploy** via Forge ("Deploy Now" / push to the deploy branch). Forge: pnpm install → `strapi build` → activate new release (`current` symlink) → reload PM2. Strapi syncs its content-type schema on boot.
3. **Health check:** `curl -fsS https://api.waldo.click/api/health` returns OK; `pm2 status` shows `waldo-api` **online** (not errored/restarting).
4. **Check Sentry** (Strapi project) and `pm2 logs waldo-api --lines 100` for boot errors.
5. **Purge Cloudflare cache** on the **production** zone (Redis is on, so stale cached API responses can survive a release). The purge uses `CLOUDFLARE_ZONE_ID` from the environment — confirm it is the prod zone (`306874b6…` for `waldo.click`), never the staging zone.

**Rollback (Strapi):**
1. In Forge, activate the previous release (swaps `current` back) and reload PM2 (`pm2 reload waldo-api`).
2. **If the bad release changed the schema/data:** restore the pre-deploy `mysqldump` first (see below), then activate the previous release.
3. Re-run the health check and purge Cloudflare.

---

## Database backup (MySQL) — required before every Strapi prod deploy

On the Forge server (`waldo-api` site), with the DB name `waldo_production`:

```bash
# Take a timestamped, compressed snapshot BEFORE deploying.
# Uses the site's own DB credentials from the Strapi .env.
cd /home/forge/api.waldo.click
export $(grep -E '^DATABASE_(NAME|USERNAME|PASSWORD)=' .env | xargs)
mkdir -p ~/db-backups
mysqldump --single-transaction --quick --routines --triggers \
  -u "$DATABASE_USERNAME" -p"$DATABASE_PASSWORD" "$DATABASE_NAME" \
  | gzip > ~/db-backups/waldo_production_$(date +%Y%m%d_%H%M%S).sql.gz
```

**Restore** (into the same DB during rollback, or into a scratch DB to verify):

```bash
# To a scratch DB (verification — does NOT touch production):
mysql -u "$DATABASE_USERNAME" -p"$DATABASE_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS waldo_restore_test"
gunzip < ~/db-backups/<dump>.sql.gz | mysql -u "$DATABASE_USERNAME" -p"$DATABASE_PASSWORD" waldo_restore_test
# sanity check, then drop it:
mysql -u "$DATABASE_USERNAME" -p"$DATABASE_PASSWORD" -e "SELECT COUNT(*) FROM waldo_restore_test.up_users; DROP DATABASE waldo_restore_test"

# To restore production during a rollback (DANGER — overwrites live data):
# gunzip < ~/db-backups/<dump>.sql.gz | mysql -u "$DATABASE_USERNAME" -p"$DATABASE_PASSWORD" waldo_production
```

> **One-time verification (owner action):** run the scratch-DB restore above once to confirm a dump
> actually restores cleanly, then automate the pre-deploy dump (or fold it into the Forge deploy script).
> This is the DEP-02 "verified restore" step — it needs live DB access, so it is not done automatically.

---

## When the release touches specific areas

- **Schema change:** backup → deploy Strapi → verify boot/schema → purge cache. Have the restore command ready.
- **Env var change:** update it in the platform (Vercel project / Forge site env) **before** deploying; never in committed files.
- **Payment flow:** confirm `WEBPAY_ENVIRONMENT=production` and `PRO_ENABLE` are correct; test on staging (`integration`) first.
- **Cache/response shape change:** purge Cloudflare after deploy; if Strapi Redis keys could be stale, they expire on TTL or on the next write to that collection.
