import { eq, type Database } from "@havenly/db";
import { caretakers, renters, user, member } from "@havenly/db";
import { createAuthMiddleware } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";

export const userLinkerPlugin = (database: Database) =>
  ({
    id: "user-linker",
    hooks: {
      after: [
        {
          matcher: (context) => {
            const path = context.path ?? "";
            return path.startsWith("/sign-up") || path.startsWith("/sign-in");
          },
          handler: createAuthMiddleware(async (ctx) => {
            const authUser = ctx.context.newSession?.user;
            if (!authUser) return;
            await syncUserRoleAndProfile(database, authUser.id, authUser.email);
          }),
        },
      ],
    },
  }) satisfies BetterAuthPlugin;

async function syncUserRoleAndProfile(
  database: Database,
  userId: string,
  email: string,
) {
  // 1. Check for Caretaker
  const [caretaker] = await database
    .select()
    .from(caretakers)
    .where(eq(caretakers.email, email))
    .limit(1);

  if (caretaker) {
    await database
      .update(user)
      .set({ role: "caretaker" })
      .where(eq(user.id, userId));
    await database
      .update(caretakers)
      .set({ userId })
      .where(eq(caretakers.id, caretaker.id));

    await database
      .update(member)
      .set({ role: "caretaker" })
      .where(eq(member.userId, userId));
    return;
  }

  // 2. Check for Renter
  const [renter] = await database
    .select()
    .from(renters)
    .where(eq(renters.email, email))
    .limit(1);

  if (renter) {
    await database
      .update(user)
      .set({ role: "tenant" })
      .where(eq(user.id, userId));
    await database
      .update(renters)
      .set({ userId })
      .where(eq(renters.id, renter.id));

    await database
      .update(member)
      .set({ role: "tenant" })
      .where(eq(member.userId, userId));
  }
}
