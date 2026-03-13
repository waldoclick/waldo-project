import { factories } from "@strapi/strapi";
import { Context } from "koa";
import { errors } from "@strapi/utils";
import { sendMjmlEmail } from "../../../services/mjml";

const { ApplicationError } = errors;

export default factories.createCoreController(
  "api::ad-reservation.ad-reservation",
  () => ({
    async gift(ctx: Context): Promise<void> {
      const body = ctx.request.body as { userId?: number; quantity?: number };
      const userId = body?.userId;
      const quantity = body?.quantity;

      if (!userId || !quantity || quantity < 1) {
        ctx.badRequest(
          "Missing or invalid fields: userId and quantity (>= 1) are required"
        );
        return;
      }

      try {
        // Verify user exists
        const user = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: userId },
            select: ["id", "email", "firstName", "lastName"],
          });

        if (!user) {
          ctx.notFound("User not found");
          return;
        }

        // Create N ad-reservation records
        const createdIds: number[] = [];
        for (let i = 0; i < quantity; i++) {
          const record = await strapi.entityService.create(
            "api::ad-reservation.ad-reservation",
            {
              data: {
                price: 0,
                user: userId,
                description: `Gifted ad reservation — ${new Date().toISOString()}`,
                publishedAt: new Date(),
              },
            }
          );
          createdIds.push((record as any).id);
        }

        // Send email notification (non-fatal)
        try {
          await sendMjmlEmail(
            strapi,
            "gift-reservation",
            (user as any).email,
            "Has recibido reservas de avisos",
            {
              name: (user as any).firstName || (user as any).email,
              quantity,
              type: "reserva(s) de avisos",
            }
          );
        } catch (emailError) {
          strapi.log.error(`[ad-reservation/gift] Email failed: ${emailError}`);
        }

        ctx.body = { data: { createdIds, userId, quantity } };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        strapi.log.error(`[ad-reservation/gift] Error: ${message}`);
        throw new ApplicationError(
          `Failed to create gift reservations: ${message}`
        );
      }
    },
  })
);
