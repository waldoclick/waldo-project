/**
 * Ad lifecycles
 */

import { sendNewAdNotification } from "../../../../services/slack";
import type { Event } from "@strapi/database/dist/lifecycles";

export default {
  /**
   * Triggered after creating a new ad
   */
  async afterCreate(event: Event) {
    const { result } = event;

    console.log("📝 Datos del aviso:", {
      id: result.id,
      name: result.name,
      price: result.price,
      currency: result.currency,
      active: result.active,
    });

    // Enviar notificación a Slack con Block Kit
    try {
      const dashboardUrl =
        process.env.DASHBOARD_URL || "https://dashboard.waldoclick.dev";
      const adUrl = `${dashboardUrl}/ads/${result.id}`;

      const fallbackText = `🆕 Nuevo anuncio creado: ${result.name} — ${adUrl}`;

      const blocks = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🆕 Nuevo anuncio para validar",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Nombre*\n${result.name}`,
            },
            {
              type: "mrkdwn",
              text: `*Precio*\n${result.price} ${result.currency || "CLP"}`,
            },
            {
              type: "mrkdwn",
              text: `*Slug*\n${result.slug}`,
            },
            {
              type: "mrkdwn",
              text: `*ID*\n${result.id}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Ver en dashboard",
                emoji: true,
              },
              url: adUrl,
              style: "primary",
            },
          ],
        },
      ];

      await sendNewAdNotification(fallbackText, blocks);
      console.log("📢 Notificación enviada a Slack para el ad ID:", result.id);
    } catch (error) {
      console.error("❌ Error enviando notificación a Slack:", error);
    }
  },
};
