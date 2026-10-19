import { categories } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

export const categoriesRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(categories)
      .where(eq(categories.organizationId, ctx.session.user.organizationId))
      .orderBy(desc(categories.createdAt));
  }),

  add: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        features: z.array(z.string()).optional(),
        description: z.string().optional(),
        otherFeatures: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [category] = await ctx.db
        .insert(categories)
        .values({
          organizationId,
          title: input.title,
          features: input.features ?? [],
          description: input.description ?? "",
          otherFeatures: input.otherFeatures ?? {},
        })
        .returning();
      return category;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        features: z.array(z.string()).optional(),
        description: z.string().optional(),
        otherFeatures: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [category] = await ctx.db
        .update(categories)
        .set({
          title: input.title,
          features: input.features ?? [],
          description: input.description ?? "",
          otherFeatures: input.otherFeatures ?? {},
        })
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.organizationId, organizationId),
          ),
        )
        .returning();
      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
      return category;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      await ctx.db
        .delete(categories)
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.organizationId, organizationId),
          ),
        );
      return { success: true };
    }),
});
