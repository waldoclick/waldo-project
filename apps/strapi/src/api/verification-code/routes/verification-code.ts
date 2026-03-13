/**
 * verification-code router
 * Note: The actual auth routes (verify-code, resend-code) are registered
 * as custom plugin routes in the users-permissions extension, not here.
 */
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter(
  "api::verification-code.verification-code"
);
