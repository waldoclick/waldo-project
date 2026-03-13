import {
  getUserDataWithFilters,
  getAuthenticatedUsers,
} from "./controllers/userController";

export default function (plugin) {
  // Override GET /api/users to apply server-side Authenticated role filter.
  // The content-API sanitizer strips `filters[role]` for regular JWTs — this
  // controller uses strapi.db.query directly, which bypasses that restriction.
  plugin.controllers.user.find = getUserDataWithFilters;

  // Add GET /api/users/authenticated — server-side role filter, minimal fields (GIFT-08)
  plugin.controllers.user.authenticated = getAuthenticatedUsers;
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/users/authenticated",
    handler: "user.authenticated",
    config: { policies: [] },
  });

  return plugin;
}
