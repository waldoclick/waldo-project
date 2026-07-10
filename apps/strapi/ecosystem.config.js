// Two Strapi instances share one server: production (api.waldo.click) and
// staging (api.waldoclick.dev). Each Forge site has its own checkout, its own
// .env and its own database — the only things PM2 must keep apart are the
// process name and the port.
//
// Each site's deploy script MUST start only its own app, otherwise deploying
// one site restarts the other:
//
//   pm2 reload ecosystem.config.js --only waldo-api-prod    --update-env
//   pm2 reload ecosystem.config.js --only waldo-api-staging --update-env
//
// `cwd` is intentionally omitted: PM2 resolves it to the directory of this
// file, which is already the site's own checkout.
const baseApp = {
  script: "pnpm",
  args: "start",
  autorestart: true, // PM2 will restart if it crashes
  watch: false, // Set to true for development with autoreload
  max_memory_restart: "1G",
};

module.exports = {
  apps: [
    {
      ...baseApp,
      name: "waldo-api-prod",
      // PORT set here wins over the site's .env (dotenv never overrides an
      // already-set process.env), so the two instances can never collide.
      env: { NODE_ENV: "production", PORT: 1337 },
    },
    {
      ...baseApp,
      name: "waldo-api-staging",
      env: { NODE_ENV: "production", PORT: 1338 },
    },
  ],
};
