/**
 * verification-code router
 * Note: The actual auth routes (verify-code, resend-code) are registered
 * as custom plugin routes in the users-permissions extension, not here.
 *
 * SEC2-LOCKDOWN: All core CRUD routes disabled — this content type stores
 * plaintext OTP codes and pendingToken; no web-accessible read/write exposure.
 */
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter(
  "api::verification-code.verification-code",
  { only: [] },
);
