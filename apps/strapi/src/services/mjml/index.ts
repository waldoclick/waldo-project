import mjml2html from "mjml";
import nunjucks from "nunjucks";

const env = nunjucks.configure("src/services/mjml/templates", {
  autoescape: true,
});

export const renderEmail = (
  template: string,
  data: Record<string, unknown>,
) => {
  const mjml = env.render(`${template}.mjml`, data);
  // @types/mjml-core@5 incorrectly marks mjml2html as async; mjml@4 is sync at runtime
  const { html } = mjml2html(mjml, { minify: true }) as unknown as {
    html: string;
  };
  return html;
};

export { testEmail } from "./test";
export { sendMjmlEmail } from "./send-email";
export { escapeHtml } from "./escape";
