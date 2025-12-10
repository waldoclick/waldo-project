import cronTasks from "./cron-tasks";

export default ({ env }) => ({
  url: env("APP_URL", "http://localhost:1337"),
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
  proxy: {
    koa: true,
  },
  cron: {
    enabled: env.bool("CRON_ENABLED", true),
    tasks: cronTasks,
  },
});
