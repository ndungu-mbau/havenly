import { messages } from "@havenly/db";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

export const messagesRouter = router({
  /**
   * Public contact form submission.
   */
  send: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required."),
        email: z.string().email("Valid email is required."),
        subject: z.string().min(1, "Subject is required."),
        body: z.string().min(1, "Message is required."),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(messages)
        .values({
          name: input.name.trim(),
          email: input.email.trim(),
          subject: input.subject.trim(),
          body: input.body.trim(),
          metadata: input.metadata ?? {},
        })
        .returning({ id: messages.id });

      if (!row) {
        return { success: false, error: "Failed to send message" };
      }

      return { success: true, id: row.id };
    }),

  /**
   * Internal messaging: Send a message to another user.
   * Note: This uses the common 'messages' table, utilizing metadata for routing
   * or requiring a schema update if strictly separated from public contact forms.
   */
  sendInternal: protectedProcedure
    .input(
      z.object({
        toUserId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(messages)
        .values({
          name: ctx.user.name,
          email: ctx.user.email,
          subject: "Internal Message",
          body: input.content,
          metadata: {
            userId: ctx.user.id,
            toUserId: input.toUserId,
            internal: true,
          },
        })
        .returning();

      if (!row) {
        throw new Error("Failed to send internal message");
      }

      return row;
    }),

  /**
   * List internal messages for the authenticated user.
   */
  listInternal: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db
        .select()
        .from(messages)
        .where(
          (metadata, { any }) =>
            any(metadata.userId, eq(ctx.user.id))
        );
    }),
});
