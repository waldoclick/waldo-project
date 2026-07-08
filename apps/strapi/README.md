# Strapi

Backend API and CMS for the Waldo classified ads platform (Strapi v5).

## Prerequisites

- Node.js 18+
- Yarn 1.22.22
- PostgreSQL 14+ (or MySQL 8+)

## Environment Variables

See [../../docs/env-vars.md](../../docs/env-vars.md) for the full reference. Minimum required to boot:

| Variable              | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `DATABASE_HOST`       | Database server hostname                       |
| `DATABASE_PORT`       | Database server port                           |
| `DATABASE_NAME`       | Database name                                  |
| `DATABASE_USERNAME`   | Database user                                  |
| `DATABASE_PASSWORD`   | Database password                              |
| `APP_KEYS`            | Comma-separated list of 4 session signing keys |
| `API_TOKEN_SALT`      | Salt for API token generation                  |
| `ADMIN_JWT_SECRET`    | Secret for the Strapi admin panel JWT          |
| `TRANSFER_TOKEN_SALT` | Salt for transfer tokens                       |
| `JWT_SECRET`          | Secret for user authentication tokens          |

## Scripts

| Command        | What it does                                          |
| -------------- | ----------------------------------------------------- |
| `yarn develop` | Start development server with auto-reload (port 1337) |
| `yarn build`   | Build the Strapi admin panel for production           |
| `yarn start`   | Start in production mode (requires prior build)       |
| `yarn test`    | Run Jest unit tests                                   |
| `yarn lint`    | Run ESLint                                            |

## Port

1337 — `http://localhost:1337`

Admin panel: `http://localhost:1337/admin`

## Source Layout

See [CLAUDE.md](../../CLAUDE.md) for service file conventions. Key directories:

- `src/api/` — content type controllers, services, routes
- `src/extensions/` — Strapi plugin overrides (users-permissions)
- `src/middlewares/` — global and route-level middlewares
- `src/crons/` — scheduled jobs (adCron, userCron, backupCron, cleanupCron)
- `src/plugins/` — custom Strapi plugins
- `config/` — database, server, middlewares, cron configuration
- `tests/` — all test files (mirrors `src/` structure)

## Domain Documentation

- [Ad statuses and lifecycle](../../docs/ad-statuses.md)
- [Payment flow (Webpay + Oneclick)](../../docs/payment-flow.md)
- [Reservation system](../../docs/reservation-system.md)
- [Backend schema (data model)](../../docs/BSD.md)
- [API permissions](../../docs/permissions.md)
