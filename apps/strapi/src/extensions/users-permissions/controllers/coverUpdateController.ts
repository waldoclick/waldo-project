export const updateCover = async (ctx) => {
  const userId = ctx.state.user.id;
  const data = ctx.request.body.data;
  const coverId = data.cover;

  if (!userId) {
    return ctx.badRequest("User not found");
  }

  // Permitimos coverId null/undefined para quitar el cover
  try {
    // Update user with the new cover ID (or null to remove it)
    const userService = strapi.service("plugin::users-permissions.user");
    const updatedUser = await userService.edit(userId, {
      cover: coverId || null,
    });

    // Remove sensitive data before sending response
    delete updatedUser.password;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.confirmationToken;
    delete updatedUser.provider;
    delete updatedUser.role;

    ctx.send(updatedUser);
  } catch (error) {
    ctx.badRequest("Error updating cover", { error });
  }
};
