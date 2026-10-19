import { caretakers, houses, properties, user, utilities } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, caretakerProcedure, router } from "../index";

export const caretakersRouter = router({
  houses: router({
    list: caretakerProcedure
      .input(z.object({ propertyId: z.string() }))
      .query(async ({ ctx, input }) => {
        const currentUser = ctx.session.user;
        const userRole = (currentUser as { role?: string }).role ?? "admin";

        if (userRole === "caretaker") {
          const [property] = await ctx.db
            .select({ id: properties.id })
            .from(properties)
            .where(and(eq(properties.id, input.propertyId), eq(properties.caretakerId, currentUser.id)))
            .limit(1);

          if (!property) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Unauthorized: You are not the assigned caretaker for this property.",
            });
          }
        }

        return ctx.db.select().from(houses).where(eq(houses.propertyId, input.propertyId));
      }),
  }),
  utilities: router({
    listByProperty: caretakerProcedure
      .input(z.object({ propertyId: z.string(), period: z.string() }))
      .query(async ({ ctx, input }) => {
        const currentUser = ctx.session.user;
        const userRole = (currentUser as { role?: string }).role ?? "admin";

        if (userRole === "caretaker") {
          const [property] = await ctx.db
            .select({ id: properties.id })
            .from(properties)
            .where(
              and(
                eq(properties.id, input.propertyId),
                eq(properties.caretakerId, currentUser.id),
              ),
            )
            .limit(1);

          if (!property) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Unauthorized: You are not the assigned caretaker for this property.",
            });
          }
        }

        const houseIds = await ctx.db
          .select({ id: houses.id })
          .from(houses)
          .where(eq(houses.propertyId, input.propertyId));

        if (houseIds.length === 0) {
          return [];
        }

        return ctx.db
          .select()
          .from(utilities)
          .where(
            and(
              inArray(
                utilities.houseId,
                houseIds.map((h) => h.id),
              ),
              eq(utilities.period, input.period),
            ),
          );
      }),
    upsert: caretakerProcedure
      .input(
        z.object({
          houseId: z.string(),
          amount: z.number().int().nonnegative(),
          period: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const currentUser = ctx.session.user;
        const userRole = (currentUser as { role?: string }).role ?? "admin";

        if (userRole === "caretaker") {
          const [property] = await ctx.db
            .select({ id: properties.id })
            .from(properties)
            .innerJoin(houses, eq(houses.propertyId, properties.id))
            .where(
              and(
                eq(properties.caretakerId, currentUser.id),
                eq(houses.id, input.houseId),
              ),
            )
            .limit(1);

          if (!property) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message:
                "Unauthorized: You are not the assigned caretaker for this house's property.",
            });
          }
        }

        const [utility] = await ctx.db
          .insert(utilities)
          .values({
            houseId: input.houseId,
            amount: input.amount,
            period: input.period,
            updatedBy: currentUser.id,
          })
          .onConflictDoUpdate({
            target: [utilities.houseId, utilities.period],
            set: {
              amount: input.amount,
              updatedBy: currentUser.id,
              updatedAt: new Date(),
            },
          })
          .returning();

        return utility;
      }),
    bulkUpsert: caretakerProcedure
      .input(
        z.array(
          z.object({
            houseId: z.string(),
            amount: z.number().int().nonnegative(),
            period: z.string(),
          }),
        ),
      )
      .mutation(async ({ ctx, input }) => {
        const currentUser = ctx.session.user;
        const userRole = (currentUser as { role?: string }).role ?? "admin";

        if (userRole === "caretaker") {
          const ownedHouses = await ctx.db
            .select({ houseId: houses.id })
            .from(properties)
            .innerJoin(houses, eq(houses.propertyId, properties.id))
            .where(eq(properties.caretakerId, currentUser.id));

          const ownedHouseIds = new Set(ownedHouses.map((h) => h.houseId));
          for (const item of input) {
            if (!ownedHouseIds.has(item.houseId)) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message:
                  "Unauthorized: You are not the assigned caretaker for one of the houses.",
              });
            }
          }
        }

        return ctx.db.transaction(async (tx) => {
          const results = [];
          for (const item of input) {
            const [utility] = await tx
              .insert(utilities)
              .values({
                houseId: item.houseId,
                amount: item.amount,
                period: item.period,
                updatedBy: currentUser.id,
              })
              .onConflictDoUpdate({
                target: [utilities.houseId, utilities.period],
                set: {
                  amount: item.amount,
                  updatedBy: currentUser.id,
                  updatedAt: new Date(),
                },
              })
              .returning();
            results.push(utility);
          }
          return results;
        });
      }),
  }),
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: caretakers.id,
        userId: caretakers.userId,
        name: caretakers.name,
        email: caretakers.email,
        phone: caretakers.phone,
      })
      .from(caretakers);
  }),

  getDashboardData: caretakerProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.session.user;

    const assignedProperties = await ctx.db
      .select()
      .from(properties)
      .where(eq(properties.caretakerId, currentUser.id));

    if (assignedProperties.length === 0) {
      return { properties: [], houses: [], utilities: [] };
    }

    const propertyIds = assignedProperties.map((p) => p.id);

    const allHouses = await ctx.db
      .select()
      .from(houses)
      .where(inArray(houses.propertyId, propertyIds));

    const utilitiesData = await ctx.db
      .select({
        utility: utilities,
        property: properties,
      })
      .from(utilities)
      .innerJoin(
        properties,
        sql`exists (select 1 from houses where houses.id = ${utilities.houseId} and houses.property_id = properties.id)`,
      )
      .where(eq(properties.caretakerId, currentUser.id));

    return {
      properties: assignedProperties,
      houses: allHouses,
      utilities: utilitiesData,
    };
  }),

  add: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(user)
          .values({
            name: input.name,
            email: input.email,
            role: "caretaker",
          })
          .returning();

        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        const [newCaretaker] = await tx
          .insert(caretakers)
          .values({
            userId: newUser.id,
            name: input.name,
            email: input.email,
            phone: input.phone,
          })
          .returning();

        return newCaretaker;
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [caretaker] = await tx
          .select()
          .from(caretakers)
          .where(eq(caretakers.id, input.id));
        if (!caretaker) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Caretaker not found",
          });
        }

        if (caretaker.userId) {
          await tx
            .update(user)
            .set({
              name: input.name,
              email: input.email,
            })
            .where(eq(user.id, caretaker.userId));
        }

        const [updatedCaretaker] = await tx
          .update(caretakers)
          .set({
            name: input.name,
            email: input.email,
            phone: input.phone,
          })
          .where(eq(caretakers.id, input.id))
          .returning();

        return updatedCaretaker;
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(caretakers).where(eq(caretakers.id, input.id));
      return { success: true };
    }),
});
