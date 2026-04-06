// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  // Compatibility date for Nuxt features
  compatibilityDate: "2024-04-03",
  telemetry: false,

  // Enable Nuxt 4 compatibility mode
  future: {
    compatibilityVersion: 4,
  },

  // 1. Basic Configuration
  modules: [
    "nuxt-security",
    "@nuxt/test-utils/module",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@sentry/nuxt/module",
    "@nuxtjs/seo",
    "@nuxt/image",
    "@nuxtjs/google-fonts",
    "@saslavik/nuxt-gtm",
  ],

  // Security configuration - using nuxt-security defaults with customizations
  security: {
    nonce: false,
    rateLimiter: {
      tokensPerInterval: 500,
      interval: 300000,
    },
    headers: {
      permissionsPolicy: {
        fullscreen: ["self"],
        "display-capture": ["self"],
      },
      contentSecurityPolicy: {
        "default-src": ["'self'"],

        "script-src": [
          "'self'",
          "'unsafe-inline'",
          process.env.BASE_URL || "http://localhost:3001",
          process.env.API_URL || "http://localhost:1337",
          "https://cdn.logrocket.io",
          "https://cdn.lr-ingest.io",
          "https://cdn.lgrckt-in.com",
          "https://*.logrocket.io",
          "https://*.lr-ingest.io",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://pagead2.googlesyndication.com",
          "https://accounts.google.com",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://*.sentry.io",
          "https://*.ingest.sentry.io",
          "https://static.cloudflareinsights.com",
        ],

        "style-src": ["'self'", "'unsafe-inline'"],

        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https:",
          process.env.BASE_URL || "http://localhost:3001",
          process.env.API_URL || "http://localhost:1337",
          "https://www.google-analytics.com",
        ],

        "font-src": ["'self'"],

        "connect-src": [
          "'self'",
          "https:",
          process.env.BASE_URL || "http://localhost:3001",
          process.env.API_URL || "http://localhost:1337",
          "https://*.logrocket.io",
          "https://*.lr-ingest.io",
          "https://*.lgrckt-in.com",
          "https://*.sentry.io",
          "https://*.ingest.sentry.io",
          "https://www.google-analytics.com",
          "https://region1.google-analytics.com",
          "https://www.googletagmanager.com",
          "https://cloudflareinsights.com",
          "https://static.cloudflareinsights.com",
        ],

        "frame-src": [
          "https://accounts.google.com",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://www.googletagmanager.com",
        ],

        "child-src": ["'self'", "blob:"],
        "worker-src": ["'self'", "blob:"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": [
          "'self'",
          "https://webpay3gint.transbank.cl",
          "https://webpay3g.transbank.cl",
        ],
        "frame-ancestors": ["'none'"],
        "upgrade-insecure-requests": true,
      },
    },
  },

  site: {
    name: "Admin Waldo.click®",
    defaultLocale: "es",
    ...(process.env.NODE_ENV !== "local" && { url: process.env.BASE_URL }),
  },

  ssr: true,

  app: {
    head: {
      htmlAttrs: { lang: "es" },
      title: "Admin Waldo.click®",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "author", content: "Waldo.click®" },
        { name: "publisher", content: "Waldo.click®" },
        {
          name: "msapplication-TileImage",
          content: "/favicons/ms-icon-144x144.png",
        },
        { name: "msapplication-TileColor", content: "#ffffff" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        // Google Fonts served locally via @nuxtjs/google-fonts
        {
          rel: "apple-touch-icon",
          sizes: "57x57",
          href: "/favicons/apple-icon-57x57.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "60x60",
          href: "/favicons/apple-icon-60x60.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "72x72",
          href: "/favicons/apple-icon-72x72.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "76x76",
          href: "/favicons/apple-icon-76x76.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "114x114",
          href: "/favicons/apple-icon-114x114.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "120x120",
          href: "/favicons/apple-icon-120x120.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "144x144",
          href: "/favicons/apple-icon-144x144.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "152x152",
          href: "/favicons/apple-icon-152x152.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicons/apple-icon-180x180.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/favicons/android-icon-192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicons/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "96x96",
          href: "/favicons/favicon-96x96.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicons/favicon-16x16.png",
        },
      ],
      script: [
        {
          src: "https://accounts.google.com/gsi/client",
          async: true,
          defer: true,
        },
      ],
    } as Record<string, unknown>,
  },

  // 2. Styles Configuration
  css: ["@/scss/app.scss"],

  pinia: {
    // Pinia Configuration
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  // Google Tag Manager Configuration
  gtm: {
    id: process.env.GTM_ID || "GTM-TC8LS8NQ",
    enableRouterSync: true,
    debug: false,
  },

  // Google Fonts configuration (serve locally)
  googleFonts: {
    display: "swap",
    download: true,
    inject: true,
    preload: true,
    families: {
      Poppins: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },

  // 4. Environment Configuration
  runtimeConfig: {
    // Server-side strapi config — mirrors runtimeConfig.public.strapi for SSR composables.
    // The import.meta.server ? useRuntimeConfig() : useRuntimeConfig().public ternary
    // requires this key to exist server-side (module removal will no longer inject it).
    strapi: {
      url: process.env.API_URL || "http://localhost:1337",
      prefix: "/api",
      cookieName: "waldo_jwt",
      cookie: {
        path: "/",
        maxAge: process.env.SESSION_MAX_AGE
          ? Number.parseInt(process.env.SESSION_MAX_AGE)
          : 604800,
        ...(process.env.COOKIE_DOMAIN
          ? { domain: process.env.COOKIE_DOMAIN }
          : {}),
      },
      auth: {
        populate: [
          "role",
          "commune",
          "region",
          "business_region",
          "business_commune",
        ],
      },
    },
    public: {
      // Override strapi.url for the client-side: use the Nitro proxy (BASE_URL) so the
      // browser never calls Strapi directly (avoids CORS). Server-side keeps using
      // runtimeConfig.strapi.url = API_URL (direct, no self-proxy loop).
      strapi: {
        url:
          process.env.API_DISABLE_PROXY === "true"
            ? process.env.API_URL || "http://localhost:1337"
            : process.env.BASE_URL || "http://localhost:3001",
        prefix: "/api",
        cookieName: "waldo_jwt",
        cookie: {
          path: "/",
          maxAge: process.env.SESSION_MAX_AGE
            ? Number.parseInt(process.env.SESSION_MAX_AGE)
            : 604800,
          ...(process.env.COOKIE_DOMAIN
            ? { domain: process.env.COOKIE_DOMAIN }
            : {}),
        },
        auth: {
          populate: [
            "role",
            "commune",
            "region",
            "business_region",
            "business_commune",
          ],
        },
      },
      apiUrl: process.env.API_URL || "http://localhost:1337",
      sessionMaxAge: process.env.SESSION_MAX_AGE || "86400", // Valor por defecto de 1 día
      baseUrl: process.env.BASE_URL || "http://localhost:3001",
      websiteUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      apiDisableProxy: process.env.API_DISABLE_PROXY === "true",
      blockSearchEngines: process.env.BLOCK_SEARCH_ENGINES === "true",
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      gtm: {
        id: process.env.GTM_ID || "GTM-TC8LS8NQ",
      },
      sentryDsn: process.env.SENTRY_DSN,
      sentryFeedback: process.env.SENTRY_FEEDBACK === "true",
      sentryDebug: process.env.SENTRY_DEBUG === "true",
      logRocketAppId: process.env.LOGROCKET_APP_ID || "myogth/waldo",
      devMode: process.env.DEV_MODE === "true",
    },
    // Variables privadas del servidor
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY, // server-only — for Nitro proxy
    devUsername: process.env.DEV_USERNAME,
    devPassword: process.env.DEV_PASSWORD,
  },

  // URL Localization redirects: Spanish legacy URLs → English equivalents
  routeRules: {
    // Ads (anuncios)
    "/anuncios": { redirect: { to: "/ads", statusCode: 301 } },
    "/anuncios/pendientes": {
      redirect: { to: "/ads/pending", statusCode: 301 },
    },
    "/anuncios/activos": { redirect: { to: "/ads/active", statusCode: 301 } },
    "/anuncios/expirados": {
      redirect: { to: "/ads/expired", statusCode: 301 },
    },
    "/anuncios/baneados": { redirect: { to: "/ads/banned", statusCode: 301 } },
    "/anuncios/rechazados": {
      redirect: { to: "/ads/rejected", statusCode: 301 },
    },
    "/anuncios/abandonados": {
      redirect: { to: "/ads/abandoned", statusCode: 301 },
    },
    // Orders (ordenes)
    "/ordenes": { redirect: { to: "/orders", statusCode: 301 } },
    // Reservations (reservas)
    "/reservas": { redirect: { to: "/reservations", statusCode: 301 } },
    "/reservas/libres": {
      redirect: { to: "/reservations/free", statusCode: 301 },
    },
    "/reservas/usadas": {
      redirect: { to: "/reservations/used", statusCode: 301 },
    },
    // Featured (destacados)
    "/destacados": { redirect: { to: "/featured", statusCode: 301 } },
    "/destacados/libres": {
      redirect: { to: "/featured/free", statusCode: 301 },
    },
    "/destacados/usados": {
      redirect: { to: "/featured/used", statusCode: 301 },
    },
    // Users (usuarios)
    "/usuarios": { redirect: { to: "/users", statusCode: 301 } },
    "/usuarios/[id]": { redirect: { to: "/users/[id]", statusCode: 301 } },
    // Account (cuenta)
    "/cuenta": { redirect: { to: "/account", statusCode: 301 } },
    "/cuenta/perfil": { redirect: { to: "/account/profile", statusCode: 301 } },
    "/cuenta/perfil/editar": {
      redirect: { to: "/account/profile/edit", statusCode: 301 },
    },
    "/cuenta/cambiar-contrasena": {
      redirect: { to: "/account/change-password", statusCode: 301 },
    },
    // Categories (categorias)
    "/categorias": { redirect: { to: "/categories", statusCode: 301 } },
    // Conditions (condiciones)
    "/condiciones": { redirect: { to: "/conditions", statusCode: 301 } },
    // Regions (regiones)
    "/regiones": { redirect: { to: "/regions", statusCode: 301 } },
    // Communes (comunas)
    "/comunas": { redirect: { to: "/communes", statusCode: 301 } },
  },

  // 5. Nitro Configuration
  nitro: {
    compressPublicAssets: true,
    minify: true,
    experimental: {
      wasm: true,
    },
  },

  // Dev Server Configuration
  devServer: {
    port: 3001,
  },

  // 6. Performance Optimizations
  // (Nitro config moved above to avoid duplication)

  // Robots: dashboard is always private, never indexable
  robots: {
    disallow: "/",
  },

  // 6. Development Configuration
  typescript: {
    strict: true,
    // typeCheck disabled: both apps share the same node_modules/vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc
    // path. Running prepareVueTsc concurrently causes EEXIST race. Website runs typeCheck instead.
    // Use `yarn workspace waldo-dashboard nuxi typecheck` for standalone dashboard type checking.
    typeCheck: false,
  },

  devtools: { enabled: process.env.NODE_ENV === "development" },

  // Nuxt 4 optimizations
  experimental: {
    // Enable shared directory for better code organization
    sharedPrerenderData: true,
    // Enable payload extraction for better performance
    payloadExtraction: false,
  },

  sentry: {
    enabled: process.env.NODE_ENV === "production",
    sourceMapsUploadOptions: {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  },

  sourcemap: {
    client: true,
    server: true,
  },

  // Vite Configuration
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "js-cookie",
        "logrocket",
        "floating-vue",
        "dompurify",
        "vue-awesome-paginate",
        "qs",
        "vue-chartjs",
        "chart.js",
        "chartjs-plugin-annotation",
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Removemos additionalData ya que estamos importando app.scss en css
        },
      },
    },
    server: {
      hmr: {
        // Use 24679 (not default 24678) to avoid WebSocket port conflict with website when both dev servers run concurrently
        port: 24679,
      },
    },
  },

  image: {},
});
