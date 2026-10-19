CREATE TYPE "role" AS ENUM('superuser', 'admin', 'tenant', 'caretaker');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"visitor_id" text,
	"user_id" uuid,
	"user_role" text,
	"auth_status" text NOT NULL,
	"method" text NOT NULL,
	"route" text NOT NULL,
	"status_code" integer,
	"ip" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caretakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"title" text NOT NULL,
	"features" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"other_features" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "houses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"category_id" uuid,
	"unit_number" text NOT NULL,
	"bedrooms" integer DEFAULT 1 NOT NULL,
	"bathrooms" numeric(3,1) DEFAULT '1' NOT NULL,
	"size_sqft" integer DEFAULT 0 NOT NULL,
	"monthly_rent" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'vacant' NOT NULL,
	"override_title" text,
	"override_features" text[],
	"override_description" text,
	"override_other_features" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"house_id" uuid NOT NULL,
	"renter_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"period" text NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landlord" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"userId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"role" text DEFAULT 'tenant' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"memberId" uuid NOT NULL,
	"resourceId" uuid NOT NULL,
	"resourceType" text NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"memberId" uuid NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"metadata" text,
	"ownerId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"house_id" uuid NOT NULL,
	"renter_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"payment_date" date NOT NULL,
	"period" text NOT NULL,
	"method" text DEFAULT 'Bank transfer' NOT NULL,
	"status" text DEFAULT 'Paid' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"type" text NOT NULL,
	"phone" text,
	"bank_code" text,
	"bank_name" text,
	"account_number" text,
	"account_name" text,
	"paystack_recipient_code" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paystack_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"paystack_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"channel" text NOT NULL,
	"customer_email" text,
	"customer_phone" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"raw_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paystack_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"invoice_id" uuid,
	"reference" text NOT NULL,
	"paystack_transfer_code" text,
	"paystack_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"narration" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"raw_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paystack_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event" text NOT NULL,
	"paystack_event_id" text NOT NULL,
	"reference" text,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text,
	"property_type" text DEFAULT 'Residential' NOT NULL,
	"units_count" integer DEFAULT 0 NOT NULL,
	"caretaker_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"organization_id" uuid NOT NULL,
	"house_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"lease_start" date DEFAULT now(),
	"lease_end" date,
	"paystack_customer_code" text,
	"paystack_customer_id" integer,
	"paystack_customer_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" uuid NOT NULL,
	"impersonatedBy" uuid,
	"activeOrganizationId" uuid
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"banReason" text,
	"banExpires" timestamp(6) with time zone,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"house_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"period" text NOT NULL,
	"invoice_id" uuid,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "account_providerId_accountId_uidx" ON "account" ("providerId","accountId");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("userId");--> statement-breakpoint
CREATE INDEX "idx_audit_log_visitor_id" ON "audit_log" ("visitor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_user_id" ON "audit_log" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_route" ON "audit_log" ("route");--> statement-breakpoint
CREATE INDEX "idx_audit_log_created_at" ON "audit_log" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_invoice_per_period" ON "invoices" ("house_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_paystack_charges_reference" ON "paystack_charges" ("reference");--> statement-breakpoint
CREATE INDEX "idx_paystack_charges_paystack_id" ON "paystack_charges" ("paystack_id");--> statement-breakpoint
CREATE INDEX "idx_paystack_charges_invoice_id" ON "paystack_charges" ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_paystack_payouts_reference" ON "paystack_payouts" ("reference");--> statement-breakpoint
CREATE INDEX "idx_paystack_payouts_paystack_id" ON "paystack_payouts" ("paystack_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_paystack_webhook_event" ON "paystack_webhook_events" ("event","paystack_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_renters_paystack_customer_per_owner" ON "renters" ("organization_id","paystack_customer_code") WHERE "paystack_customer_code" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "session_activeOrganizationId_uidx" ON "session" ("activeOrganizationId");--> statement-breakpoint
CREATE INDEX "utilities_house_period_idx" ON "utilities" ("house_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "utilities_house_period_unique_idx" ON "utilities" ("house_id","period");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "caretakers" ADD CONSTRAINT "caretakers_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_property_id_properties_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_house_id_houses_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_renter_id_renters_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "renters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "landlord" ADD CONSTRAINT "landlord_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "landlord" ADD CONSTRAINT "landlord_organizationId_organization_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "landlord" ADD CONSTRAINT "landlord_propertyId_properties_id_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_organization_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member_assignment" ADD CONSTRAINT "member_assignment_memberId_member_id_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_memberId_member_id_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_ownerId_user_id_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_house_id_houses_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_renter_id_renters_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "renters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payout_destinations" ADD CONSTRAINT "payout_destinations_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "paystack_charges" ADD CONSTRAINT "paystack_charges_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "paystack_charges" ADD CONSTRAINT "paystack_charges_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "paystack_payouts" ADD CONSTRAINT "paystack_payouts_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "paystack_payouts" ADD CONSTRAINT "paystack_payouts_destination_id_payout_destinations_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "payout_destinations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "paystack_payouts" ADD CONSTRAINT "paystack_payouts_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id");--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_caretaker_id_caretakers_id_fkey" FOREIGN KEY ("caretaker_id") REFERENCES "caretakers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "renters" ADD CONSTRAINT "renters_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "renters" ADD CONSTRAINT "renters_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "renters" ADD CONSTRAINT "renters_house_id_houses_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_impersonatedBy_user_id_fkey" FOREIGN KEY ("impersonatedBy") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_house_id_houses_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_updated_by_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id");