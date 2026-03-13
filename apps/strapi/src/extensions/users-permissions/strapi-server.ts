import {
  getUserDataWithFilters,
  getAuthenticatedUsers,
} from "./controllers/userController";
import {
  registerUserLocal,
  registerUserAuth,
  overrideAuthLocal,
} from "./controllers/authController";

export default function (plugin) {
  // --- Existing: User list endpoints ---
  // Override GET /api/users to apply server-side Authenticated role filter.
  // The content-API sanitizer strips `filters[role]` for regular JWTs — this
  // controller uses strapi.db.query directly, which bypasses that restriction.
  plugin.controllers.user.find = getUserDataWithFilters;

  // Add GET /api/users/authenticated — server-side role filter, minimal fields (GIFT-08)
  // info.pluginName required so getAction() resolves "user.authenticated" via plugin controller
  plugin.controllers.user.authenticated = getAuthenticatedUsers;
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/users/authenticated",
    handler: "user.authenticated",
    info: { pluginName: "users-permissions" },
    config: { policies: [] },
  });

  // --- Existing: Registration with ad-reservation creation ---
  plugin.controllers.auth.register = registerUserLocal(
    plugin.controllers.auth.register
  );

  // --- Existing: Google OAuth callback with ad-reservation creation ---
  plugin.controllers.auth.connect = registerUserAuth(
    plugin.controllers.auth.connect
  );

  // --- NEW: 2-Step login — override POST /api/auth/local ---
  plugin.controllers.auth.callback = overrideAuthLocal(
    plugin.controllers.auth.callback
  );

  // --- NEW: verify-code and resend-code are registered as a standard Strapi API ---
  // See: apps/strapi/src/api/auth-verify/ (controller + routes)
  // Reason: plugin.routes["content-api"] is a factory function in Strapi v5.
  // Routes pushed via .routes.push() are set as properties on the function object and are
  // ignored when instantiateRouterInputs calls the factory during server bootstrap.
  // Standard content-API routes (src/api/) do not have this limitation.

  return plugin;
}
