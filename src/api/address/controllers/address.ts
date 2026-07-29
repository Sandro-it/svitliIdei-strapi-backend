/**
 * address controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::address.address', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Потрібно увійти в акаунт, щоб зберігати адреси.');
    }

    if (!ctx.request.body.data) {
      ctx.request.body = { data: ctx.request.body };
    }
    // Strapi's content-API create validation rejects a "user" key when it
    // targets plugin::users-permissions.user (anti-hijacking guard), so we
    // can't set it in the create payload — attach it afterwards instead.
    delete ctx.request.body.data.user;

    const response = await super.create(ctx);

    if (response?.data?.id) {
      await strapi.entityService.update('api::address.address', response.data.id, {
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

    const addresses = await strapi.entityService.findMany('api::address.address', {
      filters: { user: user.id },
      sort: { createdAt: 'desc' },
    });

    return {
      data: addresses,
      meta: {
        pagination: {
          page: 1,
          pageSize: addresses.length,
          pageCount: 1,
          total: addresses.length,
        },
      },
    };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const address: any = await strapi.entityService.findOne('api::address.address', id, {
      populate: ['user'],
    });

    if (!address) {
      return ctx.notFound();
    }

    if (!user || !address.user || address.user.id !== user.id) {
      return ctx.forbidden('Ви не можете переглядати цю адресу.');
    }

    const { user: _omitUser, ...safeAddress } = address;
    return { data: safeAddress, meta: {} };
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing: any = await strapi.entityService.findOne('api::address.address', id, {
      populate: ['user'],
    });

    if (!existing) {
      return ctx.notFound();
    }

    if (!user || !existing.user || existing.user.id !== user.id) {
      return ctx.forbidden('Ви не можете редагувати цю адресу.');
    }

    const data = { ...(ctx.request.body?.data || {}) };
    delete data.user;

    const updated: any = await strapi.entityService.update('api::address.address', id, { data });

    const { user: _omitUser, ...safeAddress } = updated;
    return { data: safeAddress, meta: {} };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const existing: any = await strapi.entityService.findOne('api::address.address', id, {
      populate: ['user'],
    });

    if (!existing) {
      return ctx.notFound();
    }

    if (!user || !existing.user || existing.user.id !== user.id) {
      return ctx.forbidden('Ви не можете видалити цю адресу.');
    }

    const deleted: any = await strapi.entityService.delete('api::address.address', id);

    const { user: _omitUser, ...safeAddress } = deleted || {};
    return { data: safeAddress, meta: {} };
  },
}));
