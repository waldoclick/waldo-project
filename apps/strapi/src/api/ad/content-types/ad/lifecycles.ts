/**
 * Ad lifecycles
 */

import { sendNewAdNotification } from "../../../../services/slack";

export default {
  /**
   * Triggered after creating a new ad
   */
  async afterCreate(event: any) {
    const { result } = event;

    console.log("📝 Datos del aviso:", {
      id: result.id,
      name: result.name,
      price: result.price,
      currency: result.currency,
      active: result.active,
    });

    // Enviar notificación a Slack
    try {
      const dashboardUrl =
        process.env.DASHBOARD_URL || "https://dashboard.waldoclick.dev";
      const message = `🆕 *Nuevo Anuncio Creado: Para aprobarlo o rechazarlo, ve a: ${dashboardUrl}/ads/${result.id}`;

      await sendNewAdNotification(message);
      console.log("📢 Notificación enviada a Slack para el ad ID:", result.id);
    } catch (error) {
      console.error("❌ Error enviando notificación a Slack:", error);
    }
  },
};
