import { defineRelationsPart } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { landlord } from "./landlords";

export const userRoles = pgEnum("role", [
  "superuser",
  "admin",
  "tenant",
  "caretaker",
]);

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  role: text("role", { enum: ["superuser", "admin", "tenant", "caretaker"] })
    .default("admin")
    .notNull()
    .$type<"superuser" | "admin" | "tenant" | "caretaker">(),
  banned: boolean("banned").default(false).notNull(),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires", { precision: 6, withTimezone: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: uuid("impersonatedBy").references(() => user.id, {
      onDelete: "set null",
    }),
    activeOrganizationId: uuid("activeOrganizationId"),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
    uniqueIndex("session_activeOrganizationId_uidx").on(
      table.activeOrganizationId,
    ),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("account_providerId_accountId_uidx").on(
      table.providerId,
      table.accountId,
    ),
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = pgTable("organization", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  ownerId: uuid("ownerId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const member = pgTable("member", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role", {
    enum: ["owner", "manager", "landlord", "caretaker", "tenant"],
  })
    .notNull()
    .default("tenant")
    .$type<"owner" | "manager" | "landlord" | "caretaker" | "tenant">(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const memberRole = pgTable("member_role", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("memberId")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const memberAssignment = pgTable("member_assignment", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("memberId")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  resourceId: uuid("resourceId").notNull(),
  resourceType: text("resourceType", { enum: ["PROPERTY", "UNIT"] }).notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", {
    precision: 6,
    withTimezone: true,
  }).notNull(),
  expiresAt: timestamp("expires_at", {
    precision: 6,
    withTimezone: true,
  }).notNull(),
});

export const authRelations = defineRelationsPart(
  {
    user,
    session,
    account,
    verification,
    organization,
    member,
    memberRole,
    memberAssignment,
    landlord,
  },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      organizationsOwned: r.many.organization({
        from: r.user.id,
        to: r.organization.ownerId,
      }),
      memberships: r.many.member({
        from: r.user.id,
        to: r.member.userId,
      }),
      landlords: r.many.landlord({
        from: r.user.id,
        to: r.landlord.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    organization: {
      owner: r.one.user({
        from: r.organization.ownerId,
        to: r.user.id,
      }),
      members: r.many.member({
        from: r.organization.id,
        to: r.member.organizationId,
      }),
      landlords: r.many.landlord({
        from: r.organization.id,
        to: r.landlord.organizationId,
      }),
    },
    member: {
      user: r.one.user({
        from: r.member.userId,
        to: r.user.id,
      }),
      organization: r.one.organization({
        from: r.member.organizationId,
        to: r.organization.id,
      }),
      roles: r.many.memberRole({
        from: r.member.id,
        to: r.memberRole.memberId,
      }),
      assignments: r.many.memberAssignment({
        from: r.member.id,
        to: r.memberAssignment.memberId,
      }),
    },
    memberRole: {
      member: r.one.member({
        from: r.memberRole.memberId,
        to: r.member.id,
      }),
    },
    memberAssignment: {
      member: r.one.member({
        from: r.memberAssignment.memberId,
        to: r.member.id,
      }),
    },
    landlord: {
      user: r.one.user({
        from: r.landlord.userId,
        to: r.user.id,
      }),
      organization: r.one.organization({
        from: r.landlord.organizationId,
        to: r.organization.id,
      }),
    },
  }),
);
