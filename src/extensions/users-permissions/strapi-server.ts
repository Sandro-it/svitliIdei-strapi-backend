module.exports = (plugin: any) => {
  console.log(">>> EXTENSION LOADED, controllers.user type: " + typeof plugin.controllers.user);
  console.log(">>> controllers.user keys BEFORE: " + Object.keys(plugin.controllers.user).join(","));

  plugin.controllers.user.updateMe = async (ctx: any) => {
    console.log(">>> updateMe HANDLER CALLED");
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

  console.log(">>> controllers.user keys AFTER: " + Object.keys(plugin.controllers.user).join(","));
  console.log(">>> routes BEFORE unshift, count: " + plugin.routes["content-api"].routes.length);

  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/me",
    handler: "user.updateMe",
    config: {
      policies: [],
    },
  });

  console.log(">>> routes AFTER unshift, count: " + plugin.routes["content-api"].routes.length);
  console.log(">>> first route now: " + JSON.stringify(plugin.routes["content-api"].routes[0]));

  return plugin;
};
