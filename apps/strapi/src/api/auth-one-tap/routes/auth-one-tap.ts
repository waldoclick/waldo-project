/**
 * Auth One Tap Routes
 *
 * Registers POST /api/auth/google-one-tap as a public (auth: false) endpoint.
 * This is the One Tap credential verification endpoint — users call this to
 * exchange a Google ID token for a Waldo JWT.
 *
 * Note: auth: false is required — the user does not have a Waldo JWT yet.
 * This endpoint is intentionally outside plugin extension routes (which are
 * broken in Strapi v5 — see strapi-server.ts lines 56–62).
 */
export default {
  routes: [
    {
      method: "POST",
      path: "/auth/google-one-tap",
      handler: "auth-one-tap.googleOneTap",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
