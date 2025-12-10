import mjml2html from "mjml";
import nunjucks from "nunjucks";

const env = nunjucks.configure("src/services/mjml/templates", {
  autoescape: false,
});

export const renderEmail = (template: string, data: Record<string, any>) => {
  const mjml = env.render(`${template}.mjml`, data);
  const { html } = mjml2html(mjml, { minify: true });
  return html;
};

export { testEmail } from "./test";
export { sendMjmlEmail } from "./send-email";
