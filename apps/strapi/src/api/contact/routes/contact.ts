/**
 * contact router
 * SEC2-LOCKDOWN: Exposes only the create action (contact form submission).
 * List, read, update, and delete are not needed by any app flow.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::contact.contact", {
  only: ["create"],
});
