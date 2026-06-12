import { Context } from "koa";
import { OAuth2Client } from "google-auth-library";
import { googleOneTapService } from "../../../services/google-one-tap";

const getClient = (): OAuth2Client => {
  const redirectUri = `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/auth/google-oauth/callback`;
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );
};

const popupResponse = (
  ctx: Context,
  data: Record<string, unknown>,
  origin: string,
): void => {
  const json = JSON.stringify(data);
  ctx.type = "html";
  // data-cfasync="false": stops Cloudflare Rocket Loader from rewriting the
  // inline script into a deferred type it never executes.
  // BroadcastChannel is the reliable path: production COOP same-origin severs
  // window.opener after the cross-origin hop through accounts.google.com.
  ctx.body = `<!DOCTYPE html><html><head><script data-cfasync="false">
(function(){var d=${json};
try{var c=new BroadcastChannel('google-oauth');c.postMessage(d);c.close();}catch(e){}
if(window.opener){window.opener.postMessage(d,'${origin}');}
window.close();
setTimeout(function(){window.location.href='${origin}';},200);
})();
</script></head><body></body></html>`;
};

export default {
  initiate: async (ctx: Context) => {
    const client = getClient();
    const url = client.generateAuthUrl({
      access_type: "online",
      scope: ["email", "profile"],
      prompt: "select_account",
    });
    ctx.body = { url };
  },

  callback: async (ctx: Context) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const code = Array.isArray(ctx.query.code)
      ? ctx.query.code[0]
      : ctx.query.code;

    if (!code) {
      return popupResponse(ctx, { type: "google-oauth-error" }, frontendUrl);
    }

    try {
      const client = getClient();
      const { tokens } = await client.getToken(code);
      const idToken = tokens.id_token;

      if (!idToken) {
        return popupResponse(ctx, { type: "google-oauth-error" }, frontendUrl);
      }

      const payload = await googleOneTapService.verifyCredential(idToken);
      if (!payload) {
        return popupResponse(ctx, { type: "google-oauth-error" }, frontendUrl);
      }

      const { user, isNew } =
        await googleOneTapService.findOrCreateUser(payload);

      if (isNew) {
        const { createUserReservations } = await import(
          "../../../extensions/users-permissions/controllers/authController"
        );
        (createUserReservations as (_user: unknown) => Promise<unknown>)(
          user,
        ).catch((err: unknown) =>
          strapi.log.error(
            `[googleOAuth] createUserReservations failed for user ${
              (user as { id: number }).id
            }: ${(err as Error)?.message}`,
          ),
        );
      }

      const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
        id: (user as { id: number }).id,
      });

      popupResponse(ctx, { type: "google-oauth-success", jwt }, frontendUrl);
    } catch (err) {
      strapi.log.error(
        `[googleOAuth] callback error: ${(err as Error)?.message}`,
      );
      popupResponse(ctx, { type: "google-oauth-error" }, frontendUrl);
    }
  },
};
