import { renderEmail } from "./index";
import type { Core } from "@strapi/strapi";

const EMAIL_PREFIX = "Waldo.click®: ";

interface EmailOptions {
  to: string | string[];
  from: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export async function sendMjmlEmail(
  strapi: Core.Strapi,
  template: string,
  to: string | string[],
  subject: string,
  data: Record<string, unknown>
) {
  try {
    // Agregar variables del entorno automáticamente
    const dataWithEnv = {
      ...data,
      year: new Date().getFullYear(),
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      appUrl: process.env.APP_URL || "http://localhost:1337",
    };

    const html = renderEmail(template, dataWithEnv);

    // Concatenar prefijo al subject automáticamente
    const fullSubject = subject.startsWith(EMAIL_PREFIX)
      ? subject
      : `${EMAIL_PREFIX}${subject}`;

    // Configurar Reply-To si hay un email de contacto en los datos
    const emailOptions: EmailOptions = {
      to,
      from: "no-reply@waldo.click",
      subject: fullSubject,
      text: fullSubject, // fallback text
      html,
    };

    // Si hay un email de contacto en los datos, configurar Reply-To
    if (data.email) {
      emailOptions.replyTo = String(data.email);
    }

    await strapi.plugins["email"].services.email.send(emailOptions);
  } catch (error) {
    console.error("Error enviando email MJML:", error);
    throw error;
  }
}
