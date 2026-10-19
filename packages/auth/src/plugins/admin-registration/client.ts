import type { BetterAuthClientPlugin } from "better-auth";

/**
 * Profile-Linker Client Plugin
 *
 * This is the client-side counterpart to the profile-linker server plugin.
 * The profile-linker logic runs entirely on the server via after hooks during
 * sign-up and sign-in, so this client plugin primarily exists for type inference
 * and consistency with the Better Auth plugin architecture.
 *
 * The plugin automatically links user accounts to their pre-created driver or
 * guardian entity records based on email matching, and creates the appropriate
 * organization memberships.
 */
export const adminRegistrationClient = (): BetterAuthClientPlugin => {
  return {
    id: "admin-registration",
    // No client-side methods needed - the plugin runs server-side only
    // This exists for type inference and plugin registration consistency
  };
};
