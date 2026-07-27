module.exports = (plugin) => {
  plugin.controllers.user.updateMe = async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const allowedFields = ["username", "email", "avatar"];
    const data = {};
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

  // unshift, не push: users-permissions вже реєструє PUT /users/:id раніше
  // в цьому ж масиві маршрутів, і Strapi зіставляє маршрути по порядку
  // реєстрації — тож без unshift запит PUT /users/me завжди спершу
  // потрапляв на /users/:id з "me" як буквальним id.
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
