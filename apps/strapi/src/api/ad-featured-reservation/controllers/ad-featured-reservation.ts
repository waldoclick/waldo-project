import { factories } from "@strapi/strapi";
import { Context } from "koa";
import { errors } from "@strapi/utils";
import { sendMjmlEmail } from "../../../services/mjml";

const { ApplicationError } = errors;

export default factories.createCoreController(
  "api::ad-featured-reservation.ad-featured-reservation",
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

        const createdIds: number[] = [];
        for (let i = 0; i < quantity; i++) {
          const record = (await strapi.entityService.create(
            "api::ad-featured-reservation.ad-featured-reservation",
            {
              data: {
                price: 0,
                user: userId,
                description: `Gifted featured reservation — ${new Date().toISOString()}`,
                publishedAt: new Date(),
              },
            }
          )) as unknown as { id: number };
          createdIds.push(record.id);
        }

        const typedUser = user as unknown as {
          email: string;
          firstName: string | null;
        };

        try {
          await sendMjmlEmail(
            strapi,
            "gift-reservation",
            typedUser.email,
            "Has recibido destacados para avisos",
            {
              name: typedUser.firstName || typedUser.email,
              quantity,
              type: "destacado(s) para avisos",
            }
          );
        } catch (emailError) {
          strapi.log.error(
            `[ad-featured-reservation/gift] Email failed: ${emailError}`
          );
        }

        ctx.body = { data: { createdIds, userId, quantity } };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        strapi.log.error(`[ad-featured-reservation/gift] Error: ${message}`);
        throw new ApplicationError(
          `Failed to create gift featured reservations: ${message}`
        );
      }
    },
  })
);
