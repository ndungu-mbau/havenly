import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Idempotency log for webhook delivery. The unique constraint on
 * `(event, event_id)` means a re-delivered webhook is a no-op.
 */
export const paystackWebhookEvents = pgTable(
  "paystack_webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    event: text("event").notNull(), // e.g. "charge.success"
    paystackEventId: text("paystack_event_id").notNull(), // event id or reference from webhook payload
    reference: text("reference"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqEvent: uniqueIndex("uniq_paystack_webhook_event").on(table.event, table.paystackEventId),
  })
);

export type PaystackWebhookEvent = typeof paystackWebhookEvents.$inferSelect;
