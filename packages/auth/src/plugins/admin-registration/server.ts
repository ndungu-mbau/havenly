import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { member, organization, type Database } from "@havenly/db";

function generateSlug(name: string, email: string): string {
  const base = name || email;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 50);
}

export const adminRegistrationPlugin = (db: Database): BetterAuthPlugin => {
  return {
    id: "admin-registration",
    hooks: {
      after: [
        {
          matcher: (context) => {
            const path = context.path ?? "";
            return path.startsWith("/sign-up");
          },
          handler: createAuthMiddleware(async (cdb) => {
            const newSession = cdb.context.newSession;
            if (!newSession?.user) {
              return;
            }

            const user = newSession.user;
            const userId = user.id;
            const userRole = user.role;

            // Check if user indicated they are registering as a provider
            // @ts-ignore - isProvider is an additionalField
            if (userRole !== "admin") {
              return;
            }

            try {
              // Create Organization
              const [newOrg] = await db
                .insert(organization)
                .values({
                  ownerId: user.id,
                  name: `${user.name}'s Organization`,
                  slug: generateSlug(user.name, user.email),
                  createdAt: new Date(),
                })
                .returning();

              if (!newOrg) {
                throw new Error("Organization creation failed");
              }

              // Create Membership (Owner)
              await db.insert(member).values({
                organizationId: newOrg.id,
                userId: userId,
                role: "owner",
                createdAt: new Date(),
              });
            } catch (error) {}
          }),
        },
      ],
    },
  };
};
