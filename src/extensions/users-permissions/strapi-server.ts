module.exports = (plugin: any) => {
  plugin.controllers.user.updateMe = async (ctx: any) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const allowedFields = ["username", "email", "avatar"];
    const data: Record<string, any> = {};
    for (const field of allowedFields) {
      if (ctx.request.body[field] !== undefined) {
        data[field] = ctx.request.body[field];
      }
    }

    const updatedUser = await strapi
      .plugin("users-permissions")
      .service("user")
      .edit(user.id, data);

    ctx.body = updatedUser;
  };

  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/me",
    handler: "user.updateMe",
    config: {
      policies: [],
    },
  });

  return plugin;
};
