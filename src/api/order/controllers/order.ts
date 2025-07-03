import { factories } from '@strapi/strapi';
import { GenericController } from '@strapi/strapi/lib/core-api/controller';
import { Context } from 'koa';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  // Override create to link the order to the authenticated user.
  // NOTE: In a real scenario, order creation would be more complex,
  // likely triggered by a payment success webhook or a dedicated checkout endpoint.
  // This basic override is for direct API interaction if allowed.
  async create(ctx: Context) {
    const { id: userId, roles } = ctx.state.user;

    // Check if user is admin (assuming 'admin' role has id 1 or a specific name)
    // A more robust way to check for admin would be to check role names/codes.
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!userId) {
      return ctx.unauthorized('You must be logged in to create an order.');
    }

    if (!ctx.request.body) ctx.request.body = {};
    if (!ctx.request.body.data) ctx.request.body.data = {};

    const requestData = ctx.request.body.data as any;

    // If the user is not an admin, force the order to be linked to their ID
    if (!isAdmin) {
        requestData.user = userId;
    } else if (isAdmin && !requestData.user) {
        // Admins creating orders must specify a user, or it defaults to their own if needed
        // For now, let's require admins to specify user or handle it based on specific use case
        // return ctx.badRequest('Admin must specify a user ID for the order.');
        // Or default to self if that's desired: requestData.user = userId;
    }


    // Lifecycle hook in schema.json handles orderId and orderDate generation
    const response = await super.create(ctx);
    return response;
  },

  async find(ctx: Context) {
    const { id: userId, roles } = ctx.state.user;
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!userId) {
      return ctx.unauthorized('You must be logged in to view orders.');
    }

    if (!isAdmin) {
      ctx.query.filters = { ...ctx.query.filters, user: { id: userId } };
    }
    // Admins can see all orders if no user filter is applied by them

    const response = await super.find(ctx);
    return response;
  },

  async findOne(ctx: Context) {
    const { id: userId, roles } = ctx.state.user;
    const { id: orderIdParam } = ctx.params; // This is the database ID, not orderId string
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!userId) {
      return ctx.unauthorized('You must be logged in to view an order.');
    }

    const queryParams = { ...ctx.query };
    if (!isAdmin) {
        queryParams.filters = { ...queryParams.filters, user: { id: userId } };
    }

    const entity = await strapi.service('api::order.order').findOne(orderIdParam, queryParams);

    if (!entity) {
      return ctx.notFound('Order not found or you do not have permission to access it.');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Users should generally not update orders directly. This is admin-only or specific status changes.
  async update(ctx: Context) {
    const { roles } = ctx.state.user;
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!isAdmin) {
      return ctx.forbidden('You are not allowed to update orders.');
    }
    // Admin can update any order. Ensure user field is not accidentally changed if not intended.
    if (ctx.request.body && ctx.request.body.data && (ctx.request.body.data as any).user === null) {
        // Prevent unsetting user unless specifically desired by admin logic
        // delete (ctx.request.body.data as any).user;
    }

    const response = await super.update(ctx);
    return response;
  },

  // Users should not delete orders. This is admin-only.
  async delete(ctx: Context) {
    const { roles } = ctx.state.user;
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!isAdmin) {
      return ctx.forbidden('You are not allowed to delete orders.');
    }
    const response = await super.delete(ctx);
    return response;
  }
}) as GenericController);
