import { renderEmail } from "./index";

export async function testEmail(strapi: any, testEmail: string) {
  try {
    // Renderizar el template MJML
    const html = renderEmail("welcome", {
      name: "Usuario de Prueba",
      year: new Date().getFullYear(),
    });

    // Enviar usando el sistema de email real de Strapi
    await strapi.plugins["email"].services.email.send({
      to: testEmail,
      from: "no-reply@waldo.click",
      subject: "Test MJML - Waldo.click®",
      text: "Este es un email de prueba del sistema MJML",
      html: html,
    });

    console.log(`✅ Email de prueba enviado a: ${testEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email de prueba:", error);
    return false;
  }
}
