module.exports = (plugin: any) => {
  const originalUpdate = plugin.controllers.user.update;

  plugin.controllers.user.update = async (ctx: any) => {
    const user = ctx.state.user;

    if (ctx.params.id === "me") {
      if (!user) {
        return ctx.unauthorized();
      }
      ctx.params.id = String(user.id);
    }

    if (!user || ctx.params.id !== String(user.id)) {
      return ctx.forbidden();
    }

    return originalUpdate(ctx);
  };

  return plugin;
};
