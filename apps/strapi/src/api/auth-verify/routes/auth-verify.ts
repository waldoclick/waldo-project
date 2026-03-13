/**
 * Auth Verify Routes
 *
 * Registers POST /api/auth/verify-code and POST /api/auth/resend-code as public
 * (auth: false) endpoints. These are the second step of the 2-step login flow.
 *
 * Note: auth: false is required — the user does not yet have a JWT at this point.
 * The pendingToken acts as the temporary credential.
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/auth/verify-code",
      handler: "auth-verify.verifyCode",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/resend-code",
      handler: "auth-verify.resendCode",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
