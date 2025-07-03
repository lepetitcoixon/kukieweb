export default {
  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Grant public permissions for page and post
    const publicActionsToGrant = [
      "api::page.page.find",
      "api::page.page.findOne",
      "api::post.post.find",
      "api::post.post.findOne",
    ];

    try {
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" },
        populate: { permissions: true },
      });

      if (publicRole) {
        const publicPermissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
          where: { action: { $in: publicActionsToGrant } },
        });
        const newPublicPermissionIds = publicPermissions
          .filter(p => !publicRole.permissions.some(rp => rp.id === p.id))
          .map(p => p.id);

        if (newPublicPermissionIds.length > 0) {
          await strapi.db.query("plugin::users-permissions.role").update({
            where: { id: publicRole.id },
            data: { permissions: { connect: newPublicPermissionIds.map(id => ({ id })) } },
          });
          strapi.log.info("Successfully granted public permissions for Pages and Posts.");
        } else {
          strapi.log.info("Public permissions for Pages and Posts were already up-to-date.");
        }
      } else {
        strapi.log.warn("Public role not found. Skipping public permissions setup for Pages and Posts.");
      }
    } catch (error) {
      strapi.log.error("Could not grant public permissions for Pages and Posts:", error);
    }

    // Grant authenticated permissions for address
    const authenticatedAddressActions = [
      "api::address.address.create",
      "api::address.address.find",
      "api::address.address.findOne",
      "api::address.address.update",
      "api::address.address.delete",
    ];

    try {
      const authenticatedRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "authenticated" },
        populate: { permissions: true },
      });

      if (authenticatedRole) {
        const addressPermissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
          where: { action: { $in: authenticatedAddressActions } },
        });
        const newAddressPermissionIds = addressPermissions
          .filter(p => !authenticatedRole.permissions.some(rp => rp.id === p.id))
          .map(p => p.id);

        if (newAddressPermissionIds.length > 0) {
          await strapi.db.query("plugin::users-permissions.role").update({
            where: { id: authenticatedRole.id },
            data: { permissions: { connect: newAddressPermissionIds.map(id => ({ id })) } },
          });
          strapi.log.info("Successfully granted authenticated permissions for Address API.");
        } else {
          strapi.log.info("Authenticated permissions for Address API were already up-to-date.");
        }
      } else {
        strapi.log.warn("Authenticated role not found. Skipping permissions setup for Address API.");
      }
    } catch (error) {
      strapi.log.error("Could not grant authenticated permissions for Address API:", error);
    }

    // Grant authenticated permissions for order
    const authenticatedOrderActions = [
      "api::order.order.create", // Users can create their own orders (controller assigns user)
      "api::order.order.find",   // Controller filters to user's own orders
      "api::order.order.findOne",// Controller filters to user's own orders
      // "api::order.order.update", // Restricted by controller to admin/specific logic
      // "api::order.order.delete", // Restricted by controller to admin
    ];

    try {
      const authenticatedRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "authenticated" },
        populate: { permissions: true },
      });

      if (authenticatedRole) {
        const orderPermissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
          where: { action: { $in: authenticatedOrderActions } },
        });
        const newOrderPermissionIds = orderPermissions
          .filter(p => !authenticatedRole.permissions.some(rp => rp.id === p.id))
          .map(p => p.id);

        if (newOrderPermissionIds.length > 0) {
          await strapi.db.query("plugin::users-permissions.role").update({
            where: { id: authenticatedRole.id },
            data: { permissions: { connect: newOrderPermissionIds.map(id => ({ id })) } },
          });
          strapi.log.info("Successfully granted authenticated permissions for Order API.");
        } else {
          strapi.log.info("Authenticated permissions for Order API were already up-to-date.");
        }
      } else {
        strapi.log.warn("Authenticated role not found. Skipping permissions setup for Order API.");
      }
    } catch (error) {
      strapi.log.error("Could not grant authenticated permissions for Order API:", error);
    }

    // Grant authenticated permissions for subscription
    const authenticatedSubscriptionActions = [
      "api::subscription.subscription.find",   // Controller filters to user's own subscriptions
      "api::subscription.subscription.findOne",// Controller filters to user's own subscriptions
      // Create, Update, Delete are admin/webhook only via controller logic
    ];

    try {
      const authenticatedRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "authenticated" },
        populate: { permissions: true },
      });

      if (authenticatedRole) {
        const subscriptionPermissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
          where: { action: { $in: authenticatedSubscriptionActions } },
        });
        const newSubscriptionPermissionIds = subscriptionPermissions
          .filter(p => !authenticatedRole.permissions.some(rp => rp.id === p.id))
          .map(p => p.id);

        if (newSubscriptionPermissionIds.length > 0) {
          await strapi.db.query("plugin::users-permissions.role").update({
            where: { id: authenticatedRole.id },
            data: { permissions: { connect: newSubscriptionPermissionIds.map(id => ({ id })) } },
          });
          strapi.log.info("Successfully granted authenticated permissions for Subscription API.");
        } else {
          strapi.log.info("Authenticated permissions for Subscription API were already up-to-date.");
        }
      } else {
        strapi.log.warn("Authenticated role not found. Skipping permissions setup for Subscription API.");
      }
    } catch (error) {
      strapi.log.error("Could not grant authenticated permissions for Subscription API:", error);
    }

    // Configure Users & Permissions plugin settings
    try {
      const userPermissionsPluginStore = strapi.store({
        type: 'plugin',
        name: 'users-permissions',
      });

      const currentAdvancedSettings = await userPermissionsPluginStore.get({ key: 'advanced' }) || {};

      const newAdvancedSettings = {
        ...currentAdvancedSettings,
        email_confirmation: true,
        email_confirmation_redirection: 'http://localhost:3000/auth/email-confirmation', // Standard frontend path
        // ensure other settings like unique_email are preserved or set
        unique_email: typeof currentAdvancedSettings.unique_email === 'boolean' ? currentAdvancedSettings.unique_email : true,
        allow_register: typeof currentAdvancedSettings.allow_register === 'boolean' ? currentAdvancedSettings.allow_register : true,
      };

      await userPermissionsPluginStore.set({
        key: 'advanced',
        value: newAdvancedSettings,
      });
      strapi.log.info("Successfully enabled email confirmation and set redirection URL.");

      // Note: Email templates are typically active by default.
      // Customizing them programmatically is complex and usually done via UI or file overrides.
      // For now, we assume default templates are sufficient and active.

    } catch (error) {
      strapi.log.error("Could not configure Users & Permissions plugin settings:", error);
    }

  },

  /**
   * An asynchronous destroy function that runs before
   * your application gets shut down.
   *
   * This gives you an opportunity to gracefully stop services,
   * clean up connections, etc.
   */
  // destroy(/* { strapi } */) {},
};
