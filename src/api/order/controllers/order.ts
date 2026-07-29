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

    // Same "Invalid key user" content-API validation restriction as
    // create() applies to filters on this relation, so we can't pass
    // filters.user through super.find(ctx) either — query directly instead.
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: { user: user.id },
      sort: (ctx.query.sort as any) || { createdAt: 'desc' },
    });

    return {
      data: orders,
      meta: {
        pagination: {
          page: 1,
          pageSize: orders.length,
          pageCount: 1,
          total: orders.length,
        },
      },
    };
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

    if (!user || !order.user || order.user.id !== user.id) {
      return ctx.forbidden('Ви не можете переглядати це замовлення.');
    }

    // Not delegating to super.findOne(ctx): Strapi 5's core findOne route
    // resolves ctx.params.id as a documentId, but we looked the order up
    // by numeric id via entityService — return what we already fetched.
    // Drop the populated "user" relation before responding: entityService
    // results skip Strapi's normal output sanitization, so the raw user
    // object (including password hash and tokens) would otherwise leak.
    const { user: _omitUser, ...safeOrder } = order;
    return { data: safeOrder, meta: {} };
  },
}));
