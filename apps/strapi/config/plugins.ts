// config/plugins.ts

export default ({ env }) => ({
  email: {
    config: {
      provider: "mailgun",
      providerOptions: {
        key: env("MAILGUN_API_KEY"),
        domain: env("MAILGUN_DOMAIN"),
      },
      settings: {
        defaultFrom: env("MAILGUN_EMAIL"),
        defaultReplyTo: env("MAILGUN_EMAIL"),
      },
    },
  },
  "users-permissions": {
    config: {
      register: {
        allowedFields: [
          "is_company",
          "firstname",
          "lastname",
          "rut",
          "commune",
          "region",
          "phone",
          "address",
          "address_number",
          "birthdate",
          "postal_code",
          "business_name",
          "business_type",
          "business_rut",
          "business_address",
          "business_address_number",
          "business_postal_code",
          "business_region",
          "business_commune",
        ],
      },
      providers: {
        google: {
          clientId: env("GOOGLE_CLIENT_ID"),
          clientSecret: env("GOOGLE_CLIENT_SECRET"),
          callbackURL: env(
            "GOOGLE_CALLBACK_URL",
            "http://localhost:1337/api/connect/google/callback"
          ),
        },
      },
    },
  },

  sentry: {
    enabled: true,
    config: {
      dsn: env("SENTRY_DSN"),
      sendMetadata: true,
      init: {
        environment: env("NODE_ENV") || "development",
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        attachStacktrace: true,
        maxBreadcrumbs: 50,
      },
    },
  },
  upload: {
    config: {
      provider: "local",
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
