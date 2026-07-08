export default ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  "global::proxy-auth",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "img-src": ["'self'", "data:", "blob:"],
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "https://accounts.google.com",
            "https://apis.google.com",
            "https://static.cloudflareinsights.com",
          ],
          "connect-src": [
            "'self'",
            "https://accounts.google.com",
            "https://oauth2.googleapis.com",
            "https://www.googleapis.com",
            "https://cloudflareinsights.com",
          ],
          "frame-src": ["'self'", "https://accounts.google.com"],
        },
      },
      noSniff: true, // X-Content-Type-Options: nosniff — previene MIME sniffing
    },
  },
  // Strips market-assets.strapi.io (hardcoded Strapi CSP default) from the
  // Content-Security-Policy header — see strip-csp-fingerprint.ts.
  "global::strip-csp-fingerprint",
  {
    name: "strapi::cors",
    config: {
      origin: [env("FRONTEND_URL", "http://localhost:3000")],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      headers: [
        "Content-Type",
        "Authorization",
        "sentry-trace",
        "baggage",
        "Origin",
        "Accept",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "X-Mobile-App-Api-Key",
      ],
      keepHeaderOnError: true,
    },
  },
  // "strapi::poweredBy" removido — expone "x-powered-by: Strapi" (information disclosure)
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  // "global::image-uploader", // Comentado para pruebas con Cloudinary
  // "global::image-converter",
  "global::upload",
  // "global::recaptcha", // Movido a Nuxt Nitro proxy
  ...(env("REDIS_ENABLED", "false") === "true" ? ["global::cache"] : []),
  "global::auth-ratelimit",
  "global::protect-user-fields",
  "global::protect-ad-fields",
  "global::user-registration",
  "global::hide-admin-redirect",
];
