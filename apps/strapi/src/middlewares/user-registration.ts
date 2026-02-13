// user-registration.ts

import { Context } from "koa";
import PaymentUtils from "../api/payment/utils";
import { zohoService } from "../services/zoho";
import logger from "../utils/logtail";

interface User {
  id: number;
  email: string;
  username: string;
  firstname?: string;
  lastname?: string;
  is_company?: boolean;
  [key: string]: any;
}

interface RegisterResponse {
  user: User;
  jwt?: string;
}

// Set para rastrear tokens ya procesados
const processedTokens = new Set<string>();

export default (
  config: Record<string, unknown>,
  { strapi }: { strapi: any }
) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    await next();

    const { path, response, query } = ctx;

    // Detect local registration
    if (path === "/api/auth/local/register" && response.status === 200) {
      const localResponse = response.body as RegisterResponse;
      if (localResponse?.user) {
        try {
          logger.info(
            "Procesando registro local - creando reservas gratuitas",
            {
              userId: localResponse.user.id,
              email: localResponse.user.email,
            }
          );

          // Crear 3 reservas gratuitas de anuncios
          await createInitialFreeReservations(localResponse.user.id.toString());

          // Crear 3 reservas gratuitas de destacados
          await PaymentUtils.general.ensureFreeFeaturedReservations(
            localResponse.user.id.toString(),
            3
          );

          logger.info(
            "Reservas gratuitas creadas exitosamente para registro local",
            {
              userId: localResponse.user.id,
            }
          );
        } catch (error) {
          logger.error("Error creando reservas gratuitas en registro local", {
            userId: localResponse.user.id,
            error: error.message,
            stack: error.stack,
          });
          // No lanzar error para no fallar el registro
        }

        // Create contact in Zoho with full information
        try {
          const contact = await zohoService.createContact({
            First_Name:
              localResponse.user.firstname || localResponse.user.username,
            Last_Name:
              localResponse.user.lastname || localResponse.user.username,
            Email: localResponse.user.email,
            User_ID: localResponse.user.id.toString(),
            Lead_Source: "Local Registration",
          });
          logger.info("Contact created successfully in Zoho", {
            user: localResponse.user,
            contactId: contact.id,
          });
        } catch (error) {
          logger.error("Failed to create Zoho contact", {
            user: localResponse.user,
            error: error.message,
            stack: error.stack,
          });
          // No throw error to prevent registration failure
        }
      }
    }

    // Detect local login and add role to response
    if (path === "/api/auth/local" && response.status === 200) {
      const loginResponse = response.body as RegisterResponse;
      if (loginResponse?.user) {
        try {
          // Fetch user with role populated
          const userWithRole = await strapi
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: loginResponse.user.id },
              populate: {
                role: true,
                commune: { populate: ["region"] },
                ad_reservations: { populate: ["ad"] },
                ad_featured_reservations: { populate: ["ad"] },
              },
            });

          // Replace the user in the response with the enhanced version
          if (userWithRole) {
            // Remove sensitive data
            delete userWithRole.password;
            delete userWithRole.resetPasswordToken;
            delete userWithRole.confirmationToken;

            // Update the response
            (response.body as RegisterResponse).user = userWithRole;
          }
        } catch (error) {
          logger.error("Failed to add role to login response", {
            userId: loginResponse.user.id,
            error: error.message,
          });
          // Don't throw error to prevent login failure
        }
      }
    }

    // Detect /users/me endpoint and add role to response
    if (path === "/api/users/me" && response.status === 200 && ctx.state.user) {
      const userResponse = response.body as User;
      if (userResponse && userResponse.id) {
        try {
          // Fetch user with role populated
          const userWithRole = await strapi
            .query("plugin::users-permissions.user")
            .findOne({
              where: { id: userResponse.id },
              populate: {
                role: true,
                commune: { populate: ["region"] },
                ad_reservations: { populate: ["ad"] },
                ad_featured_reservations: { populate: ["ad"] },
              },
            });

          // Replace the response with the enhanced version
          if (userWithRole) {
            // Remove sensitive data
            delete userWithRole.password;
            delete userWithRole.resetPasswordToken;
            delete userWithRole.confirmationToken;

            // Update the response
            response.body = userWithRole;
          }
        } catch (error) {
          logger.error("Failed to add role to /users/me response", {
            userId: userResponse.id,
            error: error.message,
          });
          // Don't throw error to prevent request failure
        }
      }
    }

    // Detect provider registration (Google, etc.)
    if (
      path.startsWith("/api/auth/") &&
      path.endsWith("/callback") &&
      response.status === 200
    ) {
      const accessToken = query.access_token as string;

      // Solo procesar si no hemos visto este token antes
      if (accessToken && !processedTokens.has(accessToken)) {
        processedTokens.add(accessToken);
        const providerResponse = response.body as RegisterResponse;
        if (providerResponse?.user) {
          // Verificar si el usuario fue creado recientemente (en los últimos 10 segundos)
          const userCreatedAt = new Date(providerResponse.user.createdAt);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();

          // 10 segundos
          if (timeDiff < 10000) {
            try {
              logger.info(
                "Procesando registro Google - creando reservas gratuitas",
                {
                  userId: providerResponse.user.id,
                  email: providerResponse.user.email,
                }
              );

              // Crear 3 reservas gratuitas de anuncios
              await createInitialFreeReservations(
                providerResponse.user.id.toString()
              );

              // Crear reservas gratuitas para anuncios destacados
              await PaymentUtils.general.ensureFreeFeaturedReservations(
                providerResponse.user.id.toString(),
                3
              );

              logger.info(
                "Reservas gratuitas creadas exitosamente para registro Google",
                {
                  userId: providerResponse.user.id,
                }
              );
            } catch (error) {
              logger.error(
                "Error creando reservas gratuitas en registro Google",
                {
                  userId: providerResponse.user.id,
                  error: error.message,
                  stack: error.stack,
                }
              );
              // No lanzar error para no fallar el registro
            }

            // Create contact in Zoho with minimal information
            try {
              const emailParts = providerResponse.user.email.split("@");
              const username = emailParts[0];

              const contact = await zohoService.createContact({
                First_Name: username,
                Last_Name: username,
                Email: providerResponse.user.email,
                User_ID: providerResponse.user.id.toString(),
                Lead_Source: "Google Registration",
              });
              logger.info("Contact created successfully in Zoho", {
                user: providerResponse.user,
                contactId: contact.id,
                source: "Google",
              });
            } catch (error) {
              logger.error("Failed to create Zoho contact", {
                user: providerResponse.user,
                source: "Google",
                error: error.message,
                stack: error.stack,
              });
              // No throw error to prevent registration failure
            }
          }
        }
      }
    }
  };
};

/**
 * Creates 3 initial free ad reservations for a new user
 * This function is specifically designed for user registration
 * @param userId - The user ID to create reservations for
 */
async function createInitialFreeReservations(userId: string): Promise<void> {
  try {
    // Verificar si el usuario ya tiene reservas gratuitas
    const existingReservations = await strapi.entityService.findMany(
      "api::ad-reservation.ad-reservation",
      {
        filters: {
          user: { id: { $eq: userId } },
          price: 0,
        },
        pagination: { pageSize: 1 },
      }
    );

    if (existingReservations.length > 0) {
      logger.info("Usuario ya tiene reservas gratuitas, saltando creación", {
        userId,
        existingCount: existingReservations.length,
      });
      return;
    }

    // Crear 3 reservas gratuitas
    for (let i = 0; i < 3; i++) {
      await strapi.entityService.create("api::ad-reservation.ad-reservation", {
        data: {
          price: 0,
          total_days: 15,
          user: userId,
          description: `Reserva gratuita inicial ${i + 1}/3`,
          publishedAt: new Date(),
        },
      });
    }

    logger.info("3 reservas gratuitas creadas exitosamente", {
      userId,
      reservationsCreated: 3,
    });
  } catch (error) {
    logger.error("Error creando reservas gratuitas iniciales", {
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
