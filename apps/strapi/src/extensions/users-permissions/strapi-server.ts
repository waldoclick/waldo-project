import {
  getUserDataWithFilters,
  getAuthenticatedUsers,
} from "./controllers/userController";
import {
  registerUserLocal,
  registerUserAuth,
  overrideAuthLocal,
  overrideForgotPassword,
  overrideSendEmailConfirmation,
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

  // --- Auth controller overrides (register, connect, callback) ---
  //
  // plugin.controllers.auth is a FACTORY FUNCTION in Strapi v5 (not a plain object).
  // Setting properties directly on the factory (e.g. plugin.controllers.auth.callback = ...)
  // has no effect — the registry calls the factory with { strapi } to create a fresh instance
  // and the instance never sees the property set on the function object.
  //
  // Fix: wrap the factory so that when Strapi instantiates it, our overrides are applied
  // to the resulting instance before it is cached and used.
  const originalAuthFactory = plugin.controllers.auth;
  plugin.controllers.auth = (context) => {
    const instance = originalAuthFactory(context);
    // Registration with ad-reservation creation
    instance.register = registerUserLocal(instance.register.bind(instance));
    // Google OAuth callback with ad-reservation creation
    instance.connect = registerUserAuth(instance.connect.bind(instance));
    // 2-Step login: intercept POST /api/auth/local, return pendingToken instead of JWT
    instance.callback = overrideAuthLocal(instance.callback.bind(instance));
    // Password reset: full replacement with MJML email and context-aware URL
    instance.forgotPassword = overrideForgotPassword();
    // Email confirmation resend: full replacement with MJML branded template
    instance.sendEmailConfirmation = overrideSendEmailConfirmation();
    return instance;
  };

  // --- NEW: verify-code and resend-code are registered as a standard Strapi API ---
  // See: apps/strapi/src/api/auth-verify/ (controller + routes)
  // Reason: plugin.routes["content-api"] is a factory function in Strapi v5.
  // Routes pushed via .routes.push() are set as properties on the function object and are
  // ignored when instantiateRouterInputs calls the factory during server bootstrap.
  // Standard content-API routes (src/api/) do not have this limitation.

  return plugin;
}
