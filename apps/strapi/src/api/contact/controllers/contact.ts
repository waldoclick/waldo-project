/**
 * contact controller
 */

import { factories } from "@strapi/strapi";
import { ContactService } from "../services/contact.service";

export default factories.createCoreController(
  "api::contact.contact",
  ({ strapi }) => ({
    async create(ctx) {
      const contactService = new ContactService(strapi);

      // Obtener IP real del cliente
      const ip = contactService.getClientIp(ctx);

      const { data } = ctx.request.body;
      const { recaptchaToken, ...contactData } = data;

      try {
        const contact = await contactService.createContact({
          ...contactData,
          ip,
        });

        return {
          data: {
            fullname: contact.fullname,
            email: contact.email,
            message: contact.message,
          },
        };
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
);
