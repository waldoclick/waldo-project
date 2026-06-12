import GoogleServices from "../../../services/google/index";
import { ContactData, ContactEntity } from "../types/contact.types";
import { getClientIp } from "request-ip";
import { zohoService } from "../../../services/zoho/index";
import logger from "../../../utils/logtail/index";
import { sendMjmlEmail, escapeHtml } from "../../../services/mjml";
import type { Core } from "@strapi/strapi";
export class ContactService {
  constructor(private readonly strapi: Core.Strapi) {}

  getClientIp(ctx: { request: unknown; ip: string }): string {
    return (
      getClientIp(ctx.request as Parameters<typeof getClientIp>[0]) || ctx.ip
    );
  }

  async createContact(contactData: ContactData): Promise<ContactEntity> {
    // Add the IP to the contact data
    const dataWithIp = {
      ...contactData,
      ip: contactData.ip,
      phone: contactData.phone,
      company: contactData.company,
    };

    // Create contact in database
    const contact = await this.strapi.db.query("api::contact.contact").create({
      data: dataWithIp,
    });

    // Prepare data for Google Sheets
    const rowData = [
      contactData.fullname,
      contactData.email,
      contactData.phone || "",
      contactData.company || "",
      contactData.message,
      contactData.ip,
      new Date().toISOString(),
    ];

    // Append to Google Sheets (no interrumpe si falla)
    try {
      await GoogleServices.sheets.appendToSheet(rowData);
    } catch (error) {
      logger.error("Error saving to Google Sheets:", error);
      console.error("Error saving to Google Sheets:", error);
    }

    // Guardar en Zoho CRM (no interrumpe si falla)
    try {
      await zohoService.createLead({
        firstName: contactData.fullname.split(" ")[0] || contactData.fullname,
        lastName:
          contactData.fullname.split(" ").slice(1).join(" ") ||
          contactData.fullname,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company || "",
        description: contactData.message,
        source: "Formulario de contacto",
      });
    } catch (error) {
      logger.error("Error saving to Zoho CRM:", error);
      console.error("Error saving to Zoho CRM:", error);
    }

    // Send emails (no interrumpe si falla)
    try {
      // Enviar email de confirmación al usuario con MJML
      await sendMjmlEmail(
        this.strapi,
        "contact-user",
        contactData.email,
        "Confirmación de recepción",
        {
          name: escapeHtml(contactData.fullname),
          phone: escapeHtml(contactData.phone),
          company: escapeHtml(contactData.company),
        },
      );

      // Enviar notificación a los admins con MJML
      const adminEmails =
        process.env.ADMIN_EMAILS || "waldo.development@gmail.com";
      const emailArray = adminEmails.split(",").map((email) => email.trim());

      await sendMjmlEmail(
        this.strapi,
        "contact-admin",
        emailArray,
        "Nuevo mensaje recibido",
        {
          name: escapeHtml(contactData.fullname),
          email: escapeHtml(contactData.email),
          phone: escapeHtml(contactData.phone),
          company: escapeHtml(contactData.company),
          message: escapeHtml(contactData.message),
        },
      );
    } catch (error) {
      logger.error("Error sending emails:", error);
      console.error("Error sending emails:", error);
    }

    return contact;
  }
}
