import { factories } from '@strapi/strapi';
import { GenericController } from '@strapi/strapi/lib/core-api/controller'; // For type hints
import { Context } from 'koa'; // For Koa context type

/**
 * address controller
 */
export default factories.createCoreController('api::address.address', ({ strapi }) => ({
  // Override create to link the address to the authenticated user
  async create(ctx: Context) {
    const { id: userId } = ctx.state.user; // Get authenticated user's ID
    if (!userId) {
      return ctx.unauthorized('You must be logged in to create an address.');
    }

    // Add user ID to the request body
    if (!ctx.request.body) ctx.request.body = {};
    if (!ctx.request.body.data) ctx.request.body.data = {};
    (ctx.request.body.data as any).user = userId;

    // If isDefault is true, ensure other addresses for this user and type are set to false
    if ((ctx.request.body.data as any).isDefault === true && (ctx.request.body.data as any).type) {
      await strapi.db.query('api::address.address').updateMany({
        where: {
          user: userId,
          type: (ctx.request.body.data as any).type,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Call the default core action from the factory
    const response = await super.create(ctx);
    return response;
  },

  // Override find to filter addresses for the authenticated user
  async find(ctx: Context) {
    const { id: userId } = ctx.state.user;
    if (!userId) {
      return ctx.unauthorized('You must be logged in to view addresses.');
    }

    // Add a filter to fetch only the user's addresses
    ctx.query.filters = { ...ctx.query.filters, user: { id: userId } };

    // Call the default core action
    const response = await super.find(ctx);
    return response;
  },

  // Override findOne to ensure the user owns the address
  async findOne(ctx: Context) {
    const { id: userId } = ctx.state.user;
    const { id: addressId } = ctx.params;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to view an address.');
    }

    const entity = await strapi.service('api::address.address').findOne(addressId, {
      filters: { user: { id: userId } },
      ...ctx.query // Pass populate, fields etc.
    });

    if (!entity) {
      return ctx.notFound('Address not found or you do not have permission to access it.');
    }
    // Sanitize output using the default sanitizer
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Override update to ensure the user owns the address
  async update(ctx: Context) {
    const { id: userId } = ctx.state.user;
    const { id: addressId } = ctx.params;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to update an address.');
    }

    // Check if the address belongs to the user
    const existingAddress = await strapi.service('api::address.address').findOne(addressId, {
        populate: ['user']
    });

    if (!existingAddress || (existingAddress as any).user.id !== userId) {
      return ctx.forbidden('You are not allowed to update this address.');
    }

    // Ensure user field is not changed via update
    if (ctx.request.body && ctx.request.body.data && (ctx.request.body.data as any).user) {
      delete (ctx.request.body.data as any).user;
    }

    // If isDefault is true, ensure other addresses for this user and type are set to false
    const requestData = ctx.request.body.data as any;
    if (requestData && requestData.isDefault === true && requestData.type) {
        await strapi.db.query('api::address.address').updateMany({
            where: {
                user: userId,
                type: requestData.type,
                isDefault: true,
                id: { $ne: addressId } // Exclude current address
            },
            data: { isDefault: false },
        });
    } else if (requestData && requestData.isDefault === true && !requestData.type && existingAddress.type) {
        // If type is not in request, use existing address type
        await strapi.db.query('api::address.address').updateMany({
            where: {
                user: userId,
                type: existingAddress.type,
                isDefault: true,
                id: { $ne: addressId } // Exclude current address
            },
            data: { isDefault: false },
        });
    }


    // Call the default core action
    const response = await super.update(ctx);
    return response;
  },

  // Override delete to ensure the user owns the address
  async delete(ctx: Context) {
    const { id: userId } = ctx.state.user;
    const { id: addressId } = ctx.params;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to delete an address.');
    }

    // Check if the address belongs to the user
     const existingAddress = await strapi.service('api::address.address').findOne(addressId, {
        populate: ['user']
    });

    if (!existingAddress || (existingAddress as any).user.id !== userId) {
      return ctx.forbidden('You are not allowed to delete this address.');
    }

    // Call the default core action
    const response = await super.delete(ctx);
    return response;
  }
}) as GenericController);
