export default ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://market-assets.strapi.io",
          ],
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
            "https://analytics.strapi.io",
            "https://cloudflareinsights.com",
          ],
          "frame-src": ["'self'", "https://accounts.google.com"],
        },
      },
      frameguard: false, // Desactiva x-frame-options
      noSniff: false, // Desactiva x-content-type-options
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: [
        env("FRONTEND_URL", "http://localhost:3000"),
        env("DASHBOARD_URL", "http://localhost:3001"),
        ...(env("NODE_ENV") === "development" ? ["http://localhost:3002"] : []),
      ],
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
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  // "global::image-uploader", // Comentado para pruebas con Cloudinary
  // "global::image-converter",
  "global::upload",
  "global::recaptcha",
  ...(env("ENABLE_CACHE", "false") === "true" ? ["global::cache"] : []),
  "global::user-registration",
];
