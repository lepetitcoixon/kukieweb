import { factories } from '@strapi/strapi';
import { GenericController } from '@strapi/strapi/lib/core-api/controller';
import { Context } from 'koa';

export default factories.createCoreController('api::subscription.subscription', ({ strapi }) => ({
  // Create, Update, Delete are typically handled by webhooks from payment providers or by Admins.
  // For direct user interaction, these would need very specific logic (e.g., 'cancel' endpoint).

  async create(ctx: Context) {
    const { roles } = ctx.state.user;
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!isAdmin) {
      // Allow admin to create, perhaps for manual entries or testing.
      // Non-admins should not create subscriptions directly via this generic endpoint.
      return ctx.forbidden('You are not allowed to create subscriptions directly.');
    }
    // Admin creating a subscription must link it to a user.
    if (!ctx.request.body || !ctx.request.body.data || !(ctx.request.body.data as any).user) {
        return ctx.badRequest('User field is required when admin creates a subscription.');
    }
    return super.create(ctx);
  },

  async find(ctx: Context) {
    const { id: userId, roles } = ctx.state.user;
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!userId) {
      return ctx.unauthorized('You must be logged in to view subscriptions.');
    }

    if (!isAdmin) {
      ctx.query.filters = { ...ctx.query.filters, user: { id: userId } };
    }
    // Admins can see all subscriptions if no user filter is applied by them

    return super.find(ctx);
  },

  async findOne(ctx: Context) {
    const { id: userId, roles } = ctx.state.user;
    const { id: subscriptionDbId } = ctx.params; // This is the database ID
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!userId) {
      return ctx.unauthorized('You must be logged in to view a subscription.');
    }

    const queryParams = { ...ctx.query };
    if (!isAdmin) {
        queryParams.filters = { ...queryParams.filters, user: { id: userId } };
    }

    const entity = await strapi.service('api::subscription.subscription').findOne(subscriptionDbId, queryParams);

    if (!entity) {
      return ctx.notFound('Subscription not found or you do not have permission to access it.');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async update(ctx: Context) {
    const { roles } = ctx.state.user;
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!isAdmin) {
      // Specific actions like 'cancel' would be custom endpoints, not generic update.
      return ctx.forbidden('You are not allowed to update subscriptions directly.');
    }
    // Admins can update. Ensure user is not changed if not intended.
     if (ctx.request.body && ctx.request.body.data && (ctx.request.body.data as any).user === null) {
        // delete (ctx.request.body.data as any).user;
    }
    return super.update(ctx);
  },

  async delete(ctx: Context) {
    const { roles } = ctx.state.user;
    const isAdmin = roles.some(role => role.name === 'Super Admin' || role.id === 1);

    if (!isAdmin) {
      return ctx.forbidden('You are not allowed to delete subscriptions.');
    }
    return super.delete(ctx);
  }
}) as GenericController);
