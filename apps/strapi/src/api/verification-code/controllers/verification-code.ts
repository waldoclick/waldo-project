/**
 * verification-code controller
 * Note: All DB operations are performed directly via strapi.db.query in
 * the users-permissions extension controllers (authController.ts).
 * This scaffold is required for Strapi to register the content type.
 */
import { factories } from "@strapi/strapi";
export default factories.createCoreController(
  "api::verification-code.verification-code"
);
