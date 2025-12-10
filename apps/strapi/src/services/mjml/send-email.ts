import { renderEmail } from "./index";

const EMAIL_PREFIX = "Waldo.click®: ";

export async function sendMjmlEmail(
  strapi: any,
  template: string,
  to: string | string[],
  subject: string,
  data: Record<string, any>
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
    const emailOptions: any = {
      to,
      from: "no-reply@waldo.click",
      subject: fullSubject,
      text: fullSubject, // fallback text
      html,
    };

    // Si hay un email de contacto en los datos, configurar Reply-To
    if (data.email) {
      emailOptions.replyTo = data.email;
    }

    await strapi.plugins["email"].services.email.send(emailOptions);

    return true;
  } catch (error) {
    console.error("Error enviando email MJML:", error);
    return false;
  }
}
