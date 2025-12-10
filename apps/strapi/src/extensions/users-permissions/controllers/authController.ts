// /src/extensions/users-permissions/controllers/authController.ts

/**
 * Creates user reservations and featured reservations after user registration.
 *
 * @param {Object} user - The user object.
 * @returns {Object|Error} The user object if successful, or an error object if there was an issue.
 */
const createUserReservations = async (user) => {
  // Ensure the user was created successfully
  if (user && user.id) {
    try {
      // Check if the user already has reservations with price = 0
      const existingReservations = await strapi.db
        .query("api::ad-reservation.ad-reservation")
        .findMany({
          where: {
            user: user.id,
            price: 0,
          },
        });

      // If the user already has reservations with price = 0, return early
      if (existingReservations.length > 0) {
        return { message: "User already has free reservations" };
      }

      // Create three records in the "ad-reservation" collection
      for (let i = 0; i < 3; i++) {
        await strapi.db.query("api::ad-reservation.ad-reservation").create({
          data: {
            user: user.id,
            price: 0,
            total_days: 15,
            observation: `Reservation created automatically after user registration`,
          },
        });
      }

      // Create three records in the "ad-featured-reservation" collection
      for (let i = 0; i < 3; i++) {
        await strapi.db
          .query("api::ad-featured-reservation.ad-featured-reservation")
          .create({
            data: {
              user: user.id,
              price: 0,
              observation: `Reservation created automatically after user registration`,
            },
          });
      }

      // Return the user data
      return user;
    } catch (error) {
      // Handle errors that occur during the creation of additional records
      return { error: "Error creating ad reservations", details: error };
    }
  } else {
    // Handle the case where the user could not be retrieved
    return { error: "Could not retrieve the registered user" };
  }
};

/**
 * Registers a new user and creates additional records in the "ad-reservation" and "ad-featured-reservation" collections.
 *
 * @param {Function} registerController - The original register controller function.
 * @returns {Function} A new controller function that registers the user and creates additional records.
 */
export const registerUserLocal = (registerController) => async (ctx) => {
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      is_company,
      firstname,
      lastname,
      email,
      rut,
      password,
      confirm_password,
      username,
    } = ctx.request.body;

    // Validar que todos los campos requeridos estén presentes
    if (
      is_company === undefined ||
      !firstname ||
      !lastname ||
      !email ||
      !rut ||
      !password ||
      !confirm_password ||
      !username
    ) {
      return ctx.badRequest("All fields are required");
    }

    // Validar que las contraseñas coincidan
    if (password !== confirm_password) {
      return ctx.badRequest("Passwords do not match");
    }

    // Crear el objeto de datos del usuario sin `confirm_password`
    const userData = {
      is_company,
      firstname,
      lastname,
      rut,
      email,
      password,
      username,
    };

    // Reemplazar el cuerpo de la solicitud con los datos del usuario
    ctx.request.body = userData;

    // Llamar al controlador original para registrar al usuario
    await registerController(ctx);

    // Obtener el usuario recién creado de `ctx.response.body?.user` o `ctx.state.user`
    const user = ctx.response.body?.user || ctx.state.user;

    // Crear reservas de usuario
    createUserReservations(user);

    // Devolver la respuesta original
    return ctx.response;
  } catch (error) {
    ctx.badRequest("Error during registration:", { error });
  }
};

/**
 * Handles OAuth user registration and creates additional records in the "ad-reservation" and "ad-featured-reservation" collections.
 *
 * @param {Function} callbackController - The original callback controller function for OAuth.
 * @returns {Function} A new controller function that handles OAuth registration and creates additional records.
 */
export const registerUserAuth = (callbackController) => async (ctx) => {
  try {
    // Call the original callback controller for OAuth
    await callbackController(ctx);

    // Get the authenticated user from `ctx.response.body?.user` or `ctx.state.user`
    const user = ctx.response.body?.user || ctx.state.user;

    createUserReservations(user);
  } catch (error) {
    ctx.badRequest("Error during OAuth callback:", { error });
  }

  // Return the original response
  return ctx.response;
};
