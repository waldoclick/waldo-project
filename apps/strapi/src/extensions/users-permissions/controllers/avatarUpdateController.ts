export const updateAvatar = async (ctx) => {
  const userId = ctx.state.user.id;
  const data = ctx.request.body.data;
  const avatarId = data.avatar;

  console.log("avatarId", avatarId);

  if (!userId) {
    return ctx.badRequest("User not found");
  }

  // Permitimos avatarId null/undefined para quitar el avatar
  try {
    // Update user with the new avatar ID (or null to remove it)
    const userService = strapi.service("plugin::users-permissions.user");
    const updatedUser = await userService.edit(userId, {
      avatar: avatarId || null,
    });

    // Remove sensitive data before sending response
    delete updatedUser.password;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.confirmationToken;
    delete updatedUser.provider;
    delete updatedUser.role;

    ctx.send(updatedUser);
  } catch (error) {
    ctx.badRequest("Error updating avatar", { error });
  }
};
