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
    "nuxt-security",
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
  ],

  // Security configuration - using nuxt-security defaults with customizations
  security: {
    nonce: true,
    rateLimiter: {
      tokensPerInterval: 500,
      interval: 300000,
    },
    headers: {
      contentSecurityPolicy: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'nonce-{{nonce}}'",
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
          // hashes
          "'sha256-PVDkrbYwgpKzRcE6g9nu5SHocNTCDFtxbe+hRwabzys='",
        ],
        "style-src": [
          "'self'",
          "'nonce-{{nonce}}'",
          "'sha256-5ssSGJqEaFnjD/jHzPCmwqXFpZ+IFnIiGuRUFDakNM8='",
          "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
          "'sha256-KPHVp9hPl2hkJZxT36gXr66zkaK1xz4+LLAlcrFvioI='",
          "'sha256-uoOBzR7UcESB5QPyfRE62GQ8GvXW2MSbUR/n9a3ljJY='",
          "'sha256-u7AZxYcTnpV+TdOuwUByp81gKTf5gBppgt1GlD+d7vE='",
          "'sha256-H7hdPABrNa5DkiKIRCvPefAmhWiZBcGl3qzhvkTCSh0='",
          "'sha256-/Q0kYXz7Ioo69pKKZSOVu5RSgpxHkR+HbFvhSww2tdk='",
          "'sha256-3k3MXafwX6V3SfDh1+PouyKyJSddUDA1SGQ0sSrkUtk='",
          "'sha256-SzQWIP2ZbiirBppYnAl2EU/TI/QNc0AnjeAgUOA4vis='",
          "'sha256-x+4vaqNIGt+yYALCj2hdiR1O9474jo2qbvvCEqFMiug='",
          "'sha256-nv4qVbZV2ZrAF1qizDzlhCSWAi86sALIbB2CgBxjabw='",
          "'sha256-s4xJtzdzZ9Uh0s9EWZLJN0BGoPU8Q37owT8ACGJHebk='",
          "'sha256-FWgA3Iwd6dsWqswf1EuhCCmlnHR0JocQu93Ljx960Bc='",
          "'sha256-B7wN54kDrd1Jsqev8GNH8GJMQVs8ySQGGFDDPivPyBc='",
          "'sha256-0EZqoz+oBhx7gF4nvY2bSqoGyy4zLjNF+SDQXGp/ZrY='",
          "'sha256-OD9WVNQJEovAiR/DJOt93obaRkfsvRKjjDXmxB2VR+w='",
          "'sha256-hjGDJcPVcAJ9nnrccF3P2N4vd7YFIHUlP6dY2howRXU='",
          "'sha256-Hy4IRuZS2+hsagtxrj0TSK6aloca0Qr7bpDAz/+ed+U='",
          "'sha256-l7stDtNfZPRJ/tmikm53DbMe13BgG3uqLTZq+7CpLBs='",
          "'sha256-9S4M8NRwtClHzB7MdjvaEaOTskGhDm7aps8PUOnQMuc='",
          "'sha256-DGOz9Fsw2A+ThiRpUIiHUAc7nxHKxiz8SYbM/jOsdGg='",
          "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
          // Removed external Google Fonts since we serve locally
        ],
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
          "https://*.sentry.io",
          "https://*.ingest.sentry.io",
          "https://www.google-analytics.com",
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
    name: "Admin Waldo.click®",
    ...(process.env.NODE_ENV !== "local" && { url: process.env.BASE_URL }),
  },

  ssr: true,

  app: {
    head: {
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
        : process.env.BASE_URL || "http://localhost:3001", // ← A través del proxy
    prefix: "/api",
    version: "v5",
    cookie: {
      path: "/",
      maxAge: process.env.SESSION_MAX_AGE
        ? Number.parseInt(process.env.SESSION_MAX_AGE)
        : 604800, // Valor por defecto de 1 semana
    },
    cookieName: "strapi_jwt",
    auth: {
      populate: [
        "role",
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

  // Google Tag Manager Configuration - Manual implementation for Nuxt 4
  // gtm: {
  //   id: process.env.GTM_ID || "GTM-N4B8LDKS",
  //   enabled: true,
  //   debug: false,
  // },

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
      baseUrl: process.env.BASE_URL || "http://localhost:3001",
      apiDisableProxy: process.env.API_DISABLE_PROXY === "true",
      blockSearchEngines: process.env.BLOCK_SEARCH_ENGINES === "true",
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      gtmId: process.env.GTM_ID || "GTM-N4B8LDKS", // GTM ID for Nuxt 4 compatibility
      sentryDsn: process.env.SENTRY_DSN,
      sentryFeedback: process.env.SENTRY_FEEDBACK === "true",
      sentryDebug: process.env.SENTRY_DEBUG === "true",
      logRocketAppId: process.env.LOGROCKET_APP_ID || "myogth/waldo",
      devMode: process.env.DEV_MODE === "true",
    },
    // Variables privadas del servidor
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
    port: 3001,
  },

  // 6. Performance Optimizations
  // (Nitro config moved above to avoid duplication)

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
            "/auth/reset-password",
            "/dev/",
            "/cuenta/**",
            "/anunciar/**",
            "/packs/**",
            "/contacto/**",
          ],
        },

  // 6. Development Configuration
  typescript: {
    strict: true,
    typeCheck: false, // Disabled by default, enable when ready
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
