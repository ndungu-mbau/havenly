import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Device, geo, and session context attached to every audit log entry.
 *
 * All fields are optional — only the ones we can extract from a given
 * request are populated.
 */
export type AuditMetadata = {
  /** HTTP referer header */
  referrer?: string;
  /** Accept-Language header (e.g. "en-US,en;q=0.9") */
  acceptLanguage?: string;
  /** Inferred from Accept-Language timezone offset or Date header */
  timezone?: string;
  /** HTTP cookie names present on the request (keys only, no values) */
  cookieKeys?: string[];
  /** Whether the request looks like it came from a bot / crawler */
  isBot?: boolean;
  /** Forwarded-for IP chain when behind a proxy */
  forwardedFor?: string;
  /** Cloudflare / Vercel geo headers if present */
  country?: string;
  city?: string;
  region?: string;
  /** Request query string (without leading ?) */
  queryString?: string;
  /** Seconds between request receipt and response completion */
  durationMs?: number;
  /** Whether cookie consent was given */
  cookieConsent?: "given" | "denied" | "not_provided";
  /** Any extra key-value pairs added by route-specific logic */
  extras?: Record<string, unknown>;
};

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stable anonymous visitor id (nanoid, persisted in cookie) */
    visitorId: text("visitor_id"),
    /** Authenticated user id — null for anonymous visitors */
    userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
    /** User role at the time of the request */
    userRole: text("user_role"),
    /** Whether the user was authenticated */
    authStatus: text("auth_status").notNull(), // "authenticated" | "anonymous"
    /** HTTP method */
    method: text("method").notNull(),
    /** Request path (no query string) */
    route: text("route").notNull(),
    /** HTTP response status code (set after handler completes) */
    statusCode: integer("status_code"),
    /** Client IP address */
    ip: text("ip"),
    /** Raw User-Agent header */
    userAgent: text("user_agent"),
    /** Structured metadata (see AuditMetadata type) */
    metadata: jsonb("metadata").$type<AuditMetadata>(),
    /** When the log entry was created */
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_log_visitor_id").on(table.visitorId),
    index("idx_audit_log_user_id").on(table.userId),
    index("idx_audit_log_route").on(table.route),
    index("idx_audit_log_created_at").on(table.createdAt),
  ]
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
