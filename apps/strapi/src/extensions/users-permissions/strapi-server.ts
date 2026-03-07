import { getUserDataWithFilters } from "./controllers/userController";

export default function (plugin) {
  // Override GET /api/users to apply server-side Authenticated role filter.
  // The content-API sanitizer strips `filters[role]` for regular JWTs — this
  // controller uses strapi.db.query directly, which bypasses that restriction.
  plugin.controllers.user.find = getUserDataWithFilters;
  return plugin;
}
