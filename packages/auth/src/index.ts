import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { Database } from "@havenly/db";
import * as schema from "@havenly/db/schema/auth";
import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { userLinkerPlugin } from "./plugins/user-linker";
import { adminRegistrationPlugin } from "./plugins/admin-registration";

import { adminRoles, adminAcInstance, orgRoles, orgAc } from "./access-control";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
};

export function createAuth(env: AuthConfig, database: Database) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
    }),
    trustedOrigins: [env.BETTER_AUTH_URL],
    emailAndPassword: { enabled: true, autoSignIn: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "admin",
          required: true,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
    plugins: [
      admin({
        ac: adminAcInstance,
        roles: {
          superuser: adminRoles.superuser,
          admin: adminRoles.admin,
          landlord: adminRoles.landlord,
          caretaker: adminRoles.caretaker,
          tenant: adminRoles.tenant,
        },
        defaultRole: "admin",
      }),
      organization({
        allowUserToCreateOrganization: false,
        schema: {
          organization: {
            additionalFields: {
              ownerId: {
                type: "string",
                required: true,
                input: false,
              },
            },
          },
        },
        ac: orgAc,
        roles: {
          owner: orgRoles.owner,
          manager: orgRoles.manager,
          landlord: orgRoles.landlord,
          caretaker: orgRoles.caretaker,
          tenant: orgRoles.tenant,
        },
      }),
      userLinkerPlugin(database),
      adminRegistrationPlugin(database),
      tanstackStartCookies(),
    ],
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
