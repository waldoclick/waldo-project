// https://nuxt.com/docs/api/configuration/nuxt-config

import sass from "sass";
// import { feedbackIntegration } from "@sentry/integrations";
import * as Sentry from "@sentry/nuxt";

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
    // Solo incluir nuxt-security si no estamos en modo local
    ...(process.env.NODE_ENV !== "local" ? ["nuxt-security"] : []),
    "@nuxt/test-utils/module",
    "@nuxt/eslint",
    "@nuxtjs/strapi",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@sentry/nuxt/module",
    "@nuxtjs/seo",
    "@nuxt/image",
    "@nuxtjs/google-fonts",
    // "@nuxtjs/i18n",
    "@saslavik/nuxt-gtm",
  ],

  // Security configuration - using nuxt-security defaults with customizations
  // Solo aplicar configuración de seguridad si no estamos en modo local
  ...(process.env.NODE_ENV !== "local" && {
    security: {
      nonce: false,
      rateLimiter: {
        tokensPerInterval: 500, // Aumentado de 150 a 500 para evitar 429 con assets
        interval: 300000, // 5 minutos (300000 ms)
        headers: true,
        throwError: true,
      },
      headers: {
        permissionsPolicy: {
          "display-capture": ["self"],
        },
        contentSecurityPolicy: {
          "default-src": ["'self'"],

          "script-src": [
            "'self'",
            "'unsafe-inline'",
            process.env.BASE_URL || "http://localhost:3000",
            process.env.API_URL || "http://localhost:1337",
            "https://static.hotjar.com",
            "https://script.hotjar.com",
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
            "https://salesiq.zohopublic.com",
            "https://salesiq.zoho.com",
            "https://js.zohocdn.com",
            "https://css.zohocdn.com",
            "https://static.zohocdn.com",
            "https://static.cloudflareinsights.com",
          ],

          "style-src": ["'self'", "'unsafe-inline'", "https://css.zohocdn.com"],

          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https:",
            process.env.BASE_URL || "http://localhost:3000",
            process.env.API_URL || "http://localhost:1337",
            "https://www.google-analytics.com",
          ],

          "font-src": [
            "'self'",
            "https://css.zohocdn.com",
            "https://fonts.zohocdn.com",
            "https://static.zohocdn.com",
          ],

          "connect-src": [
            "'self'",
            "https:",
            "wss://*.hotjar.com",
            "wss://ws.hotjar.com",
            process.env.BASE_URL || "http://localhost:3000",
            process.env.API_URL || "http://localhost:1337",
            "https://*.logrocket.io",
            "https://*.lr-ingest.io",
            "https://*.sentry.io",
            "https://*.ingest.sentry.io",
            "https://www.google-analytics.com",
            "https://salesiq.zohopublic.com",
            "https://salesiq.zoho.com",
            "wss://salesiq.zohopublic.com",
            "wss://salesiq.zoho.com",
            "wss://vts.zohopublic.com",
            "https://*.zohocdn.com",
            "wss://*.zohocdn.com",
          ],

          "frame-src": [
            "https://accounts.google.com",
            "https://www.google.com",
            "https://www.gstatic.com",
            "https://www.googletagmanager.com",
            "https://salesiq.zohopublic.com",
            "https://salesiq.zoho.com",
            "https://*.zohocdn.com",
          ],

          "script-src-attr": ["'unsafe-inline'"],

          "media-src": ["'self'", "https://static.zohocdn.com"],

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
  }),

  // i18n: {
  //   defaultLocale: 'es',
  //   locales: ['es'],
  //   strategy: 'prefix_except_default',
  //   detectBrowserLanguage: {
  //     useCookie: true,
  //     cookieKey: 'i18n_redirected',
  //     redirectOn: 'root',
  //   },
  //   bundle: {
  //     optimizeTranslationDirective: false
  //   }
  // },

  site: {
    name: "Waldo.click®",
    defaultLocale: "es",
    ...(process.env.NODE_ENV !== "local" && { url: process.env.BASE_URL }),
  },

  ssr: true,

  app: {
    head: {
      htmlAttrs: { lang: "es" },
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
        // { rel: "manifest", href: "/favicons/manifest.json" },
      ],
      script: [
        {
          src: "https://accounts.google.com/gsi/client",
          async: true,
          defer: true,
        },
      ],
    } as any,
  },

  // 2. Styles Configuration
  css: ["@/scss/app.scss"],

  // 3. Modules Configuration
  // Note: Using BASE_URL instead of API_URL to route through proxy
  // This hides the actual Strapi API URL from the client
  strapi: {
    url:
      process.env.API_DISABLE_PROXY === "true"
        ? process.env.API_URL || "http://localhost:1337" // ← Directo a Strapi
        : process.env.BASE_URL || "http://localhost:3000", // ← A través del proxy
    prefix: "/api",
    version: "v5",
    cookie: {
      path: "/",
      maxAge: process.env.SESSION_MAX_AGE
        ? Number.parseInt(process.env.SESSION_MAX_AGE)
        : 604800, // Valor por defecto de 1 semana
      ...(process.env.COOKIE_DOMAIN
        ? { domain: process.env.COOKIE_DOMAIN }
        : {}),
    },
    cookieName: "waldo_jwt",
    auth: {
      populate: [
        "commune",
        "region",
        "business_region",
        "business_commune",
        "ad_reservations.ad",
        "ad_featured_reservations.ad",
        // "orders",
        // "ads",
      ],
    },
  },

  pinia: {
    // Pinia Configuration
  },

  // Google Tag Manager Configuration
  gtm: {
    id: process.env.GTM_ID || "GTM-N4B8LDKS",
    enableRouterSync: true,
    debug: false,
  },

  eslint: {
    config: {
      stylistic: false,
    },
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
    public: {
      apiUrl: process.env.API_URL || "http://localhost:1337",
      sessionMaxAge: process.env.SESSION_MAX_AGE || "86400", // Valor por defecto de 1 día
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
      apiDisableProxy: process.env.API_DISABLE_PROXY === "true",
      blockSearchEngines: process.env.BLOCK_SEARCH_ENGINES === "true",
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      gtm: {
        id: process.env.GTM_ID || "GTM-N4B8LDKS",
      },
      sentryDsn: process.env.SENTRY_DSN,
      sentryFeedback: process.env.SENTRY_FEEDBACK === "true",
      sentryDebug: process.env.SENTRY_DEBUG === "true",
      logRocketAppId: process.env.LOGROCKET_APP_ID || "myogth/waldo",
      devMode: process.env.DEV_MODE === "true",
      zohoChat: process.env.ZOHO_CHAT?.trim() === "true",
      zohoWidgetCode: process.env.ZOHO_WIDGET_CODE || "",
    },
    // Variables privadas del servidor
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY, // server-only — for Nitro proxy
    devUsername: process.env.DEV_USERNAME,
    devPassword: process.env.DEV_PASSWORD,
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
    port: 3000,
  },

  // 6. Performance Optimizations
  // (Nitro config moved above to avoid duplication)

  // Sitemap — generado en runtime via server/routes/sitemap.xml.ts (Nitro cachedEventHandler)
  // El módulo @nuxtjs/seo/sitemap está deshabilitado para no competir con el endpoint Nitro
  // y para no hacer fetch a Strapi en build-time (lo que ralentizaba la compilación).
  sitemap: false,

  // Robots Configuration
  robots:
    process.env.BLOCK_SEARCH_ENGINES === "true"
      ? {
          disallow: "/",
        }
      : {
          allow: "/",
          disallow: [
            "/404",
            "/500",
            "/login/facebook",
            "/login/google",
            "/restablecer-contrasena",
            "/dev/",
            "/cuenta/**",
            "/anunciar/**",
            "/packs/**",
            "/contacto/**",
          ],
          sitemap: `${
            process.env.BASE_URL || "http://localhost:3000"
          }/sitemap.xml`,
        },

  // 6. Development Configuration
  typescript: {
    strict: true,
    typeCheck: true,
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
    css: {
      preprocessorOptions: {
        scss: {
          // Removemos additionalData ya que estamos importando app.scss en css
        },
      },
    },
  },

  image: {
    // Configuración para evitar event handlers inline
    // onError: false, // Deshabilitar onerror inline
    // quality: 80,
    // format: ["webp"],
    // provider: "ipx",
    // ipx: {
    //   maxAge: 60 * 60 * 24 * 7, // 7 días
    //   dir: "public",
    // },
  },
});
