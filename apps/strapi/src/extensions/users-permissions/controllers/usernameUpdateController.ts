import { differenceInDays } from "date-fns";

export const updateUsername = async (ctx) => {
  const userId = ctx.state.user.id;
  const { username } = ctx.request.body.data;

  if (!userId) {
    return ctx.badRequest("User not found");
  }

  // Obtener usuario actual con su última fecha de cambio
  const currentUser = await strapi
    .query("plugin::users-permissions.user")
    .findOne({ where: { id: userId } });

  // Verificar el límite de 90 días
  if (currentUser.last_username_change) {
    const daysSinceLastChange = differenceInDays(
      new Date(),
      new Date(currentUser.last_username_change)
    );

    if (daysSinceLastChange < 90) {
      const daysRemaining = 90 - daysSinceLastChange;
      return ctx.badRequest(
        `No puedes cambiar tu nombre de usuario por ${daysRemaining} días más`
      );
    }
  }

  if (!username) {
    return ctx.badRequest("Username is required");
  }

  // Brand protection validation
  const blockedVariations = ["waldo", "w4ldo", "wald0", "w4ld0"];

  const usernameLower = username.toLowerCase();

  if (
    blockedVariations.some((variation) => usernameLower.includes(variation))
  ) {
    return ctx.badRequest(
      "This username is not allowed as it contains protected brand terms. Please choose a different username."
    );
  }

  // Validaciones de formato para el username
  if (username.length < 3) {
    return ctx.badRequest("Username must be at least 3 characters long");
  }

  if (username.length > 30) {
    return ctx.badRequest("Username cannot be longer than 30 characters");
  }

  if (username.includes(" ")) {
    return ctx.badRequest("Username cannot contain spaces");
  }

  // Solo permite letras, números, punto y guion bajo
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9._]+[a-zA-Z0-9]$/;
  if (!usernameRegex.test(username)) {
    return ctx.badRequest(
      "Username can only contain letters, numbers, dots and underscores, and must start and end with a letter or number"
    );
  }

  // No permite puntos o guiones bajos consecutivos
  if (
    username.includes("..") ||
    username.includes("__") ||
    username.includes("._") ||
    username.includes("_.")
  ) {
    return ctx.badRequest(
      "Username cannot contain consecutive special characters"
    );
  }

  try {
    // Check if username already exists
    const existingUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { username } });

    if (existingUser && existingUser.id !== userId) {
      return ctx.badRequest("Username already exists");
    }

    // Update the username and last_username_change
    const userService = strapi.service("plugin::users-permissions.user");
    const updatedUser = await userService.edit(userId, {
      username,
      last_username_change: new Date(),
    });

    // Remove sensitive data before sending response
    delete updatedUser.password;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.confirmationToken;
    delete updatedUser.provider;
    delete updatedUser.role;

    ctx.send(updatedUser);
  } catch (error) {
    ctx.badRequest("Error updating username", { error });
  }
};
