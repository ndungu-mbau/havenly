import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Metadata captured with each contact message.
 * Goes beyond the form fields to give admin context about the sender.
 */
export type MessageMetadata = {
  /** Visitor tracking cookie ID */
  visitorId?: string;
  /** Authenticated user ID if logged in */
  userId?: string;
  /** User role if authenticated */
  userRole?: string;
  /** Client IP address */
  ip?: string;
  /** Raw user-agent string */
  userAgent?: string;
  /** HTTP referer */
  referrer?: string;
  /** Accepted languages */
  acceptLanguage?: string;
  /** Timezone detected from headers */
  timezone?: string;
  /** Whether the sender looks like a bot */
  isBot?: boolean;
  /** Geo data from Vercel/Cloudflare headers */
  country?: string;
  city?: string;
  region?: string;
};

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  metadata: jsonb("metadata").$type<MessageMetadata>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
