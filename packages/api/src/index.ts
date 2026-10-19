import { initTRPC, TRPCError } from "@trpc/server";
import { createDb, eq, member, organization } from "@havenly/db";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const db = createDb({ DATABASE_URL: process.env.DATABASE_URL! });

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Procedures restricted to admin (property owner/manager)
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = (ctx.user as { role?: string }).role ?? "admin";
  if (role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Forbidden: Admin privileges required",
    });
  }

  const [orgId] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.ownerId, ctx.session.user.id))
    .limit(1);

  if (!orgId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  return next({ ctx: { ...ctx, orgId } });
});

/**
 * Procedures restricted to caretaker or admin
 */
export const caretakerProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const role = (ctx.user as { role?: string }).role ?? "admin";
    if (role !== "caretaker" && role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Forbidden: Caretaker or Admin privileges required",
      });
    }

    const [orgId] = await db
      .select({ id: member.id })
      .from(member)
      .where(eq(member.userId, ctx.user.id))
      .limit(1);

    if (!orgId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    return next({ ctx: { ...ctx, orgId } });
  },
);

/**
 * Procedures restricted to tenant or admin
 */
export const tenantProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = (ctx.user as { role?: string }).role ?? "admin";
  if (role !== "tenant" && role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Forbidden: Tenant or Admin privileges required",
    });
  }

  const [orgId] = await db
    .select({ id: member.id })
    .from(member)
    .where(eq(member.userId, ctx.user.id))
    .limit(1);

  if (!orgId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }
  return next({ ctx: { ...ctx, orgId } });
});

export * as paystack from "./paystack";
