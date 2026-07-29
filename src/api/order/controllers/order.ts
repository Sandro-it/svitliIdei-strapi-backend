/**
 * order controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!ctx.request.body.data) {
      ctx.request.body = { data: ctx.request.body };
    }
    // Strapi's content-API create validation rejects a "user" key when it
    // targets plugin::users-permissions.user (anti-hijacking guard), so we
    // can't set it in the create payload — attach it afterwards instead.
    delete ctx.request.body.data.user;

    const response = await super.create(ctx);

    if (user && response?.data?.id) {
      await strapi.entityService.update('api::order.order', response.data.id, {
        data: { user: user.id },
      });
    }

    return response;
  },

  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return {
        data: [],
        meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
      };
    }

    ctx.query = {
      ...ctx.query,
      filters: {
        ...((ctx.query.filters as object) || {}),
        user: user.id,
      },
    };

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const order: any = await strapi.entityService.findOne('api::order.order', id, {
      populate: ['user'],
    });

    if (!order) {
      return ctx.notFound();
    }

    if (user && order.user && order.user.id === user.id) {
      return await super.findOne(ctx);
    }

    return ctx.forbidden('Ви не можете переглядати це замовлення.');
  },
}));
