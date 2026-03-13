import {
  getUserDataWithFilters,
  getAuthenticatedUsers,
} from "./controllers/userController";
import {
  registerUserLocal,
  registerUserAuth,
  overrideAuthLocal,
  verifyCode,
  resendCode,
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

  // --- NEW: Verify code endpoint ---
  // NOTE: info.pluginName must be set explicitly here — registerPluginRoutes sets info on
  // existing routes during bootstrap, but routes pushed after that never get pluginName injected.
  // Without it, getAction() cannot resolve "auth.verifyCode" to plugin('users-permissions').controller('auth').
  plugin.controllers.auth.verifyCode = verifyCode;
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/verify-code",
    handler: "auth.verifyCode",
    info: { pluginName: "users-permissions" },
    config: { policies: [], middlewares: [] },
  });

  // --- NEW: Resend code endpoint ---
  plugin.controllers.auth.resendCode = resendCode;
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/resend-code",
    handler: "auth.resendCode",
    info: { pluginName: "users-permissions" },
    config: { policies: [], middlewares: [] },
  });

  return plugin;
}
