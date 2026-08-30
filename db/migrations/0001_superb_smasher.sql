CREATE TABLE "correction_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "correction_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"community_slug" text NOT NULL,
	"field" text NOT NULL,
	"submitted_current_value" text NOT NULL,
	"proposed_value" text NOT NULL,
	"source_url" text,
	"explanation" text,
	"contact_info" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitter_fingerprint" text NOT NULL,
	"moderation_note" text,
	"resolved_by_user_id" text,
	"resolved_by_email" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_audit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"correction_request_id" uuid NOT NULL,
	"community_slug" text NOT NULL,
	"action" text NOT NULL,
	"field" text NOT NULL,
	"old_value" text NOT NULL,
	"new_value" text,
	"actor_user_id" text NOT NULL,
	"actor_email" text NOT NULL,
	"moderation_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "moderation_audit_correction_request_id_unique" UNIQUE("correction_request_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_issuer_account_id_unique" UNIQUE("issuer","account_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "correction_requests" ADD CONSTRAINT "correction_requests_community_slug_communities_slug_fk" FOREIGN KEY ("community_slug") REFERENCES "public"."communities"("slug") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_audit" ADD CONSTRAINT "moderation_audit_request_fk" FOREIGN KEY ("correction_request_id") REFERENCES "public"."correction_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_audit" ADD CONSTRAINT "moderation_audit_community_slug_communities_slug_fk" FOREIGN KEY ("community_slug") REFERENCES "public"."communities"("slug") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "correction_rate_limits_expiry_idx" ON "correction_rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "correction_requests_status_created_idx" ON "correction_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "correction_requests_community_idx" ON "correction_requests" USING btree ("community_slug");--> statement-breakpoint
CREATE INDEX "moderation_audit_community_idx" ON "moderation_audit" USING btree ("community_slug");--> statement-breakpoint
CREATE INDEX "moderation_audit_created_idx" ON "moderation_audit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
