CREATE TABLE "communities" (
	"slug" text PRIMARY KEY NOT NULL,
	"display_order" integer NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"category" text NOT NULL,
	"region" text NOT NULL,
	"neighbourhood" text NOT NULL,
	"address" text NOT NULL,
	"suitable_for" text NOT NULL,
	"description" text NOT NULL,
	"access_type" text NOT NULL,
	"eligibility" text NOT NULL,
	"access_summary" text NOT NULL,
	"levels" text[] NOT NULL,
	"court_count" text NOT NULL,
	"social_play" text NOT NULL,
	"training_available" boolean NOT NULL,
	"training_intensity" text NOT NULL,
	"training_summary" text NOT NULL,
	"joining_fee" text NOT NULL,
	"recurring_fee" text NOT NULL,
	"court_fee" text NOT NULL,
	"guest_fee" text NOT NULL,
	"indicative_cost" text NOT NULL,
	"joining_steps" jsonb NOT NULL,
	"contacts" jsonb NOT NULL,
	"last_checked" date NOT NULL,
	"verification_status" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "communities_display_order_unique" UNIQUE("display_order")
);
--> statement-breakpoint
CREATE TABLE "community_sources" (
	"community_slug" text NOT NULL,
	"source_id" integer NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "community_sources_community_slug_source_id_pk" PRIMARY KEY("community_slug","source_id")
);
--> statement-breakpoint
CREATE TABLE "source_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_references_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "verification_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_slug" text NOT NULL,
	"status" text NOT NULL,
	"checked_at" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verification_events_snapshot_unique" UNIQUE("community_slug","status","checked_at")
);
--> statement-breakpoint
ALTER TABLE "community_sources" ADD CONSTRAINT "community_sources_community_slug_communities_slug_fk" FOREIGN KEY ("community_slug") REFERENCES "public"."communities"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_sources" ADD CONSTRAINT "community_sources_source_id_source_references_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source_references"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_community_slug_communities_slug_fk" FOREIGN KEY ("community_slug") REFERENCES "public"."communities"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "communities_region_idx" ON "communities" USING btree ("region");--> statement-breakpoint
CREATE INDEX "communities_category_idx" ON "communities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "communities_access_type_idx" ON "communities" USING btree ("access_type");--> statement-breakpoint
CREATE INDEX "communities_training_available_idx" ON "communities" USING btree ("training_available");--> statement-breakpoint
CREATE INDEX "community_sources_position_idx" ON "community_sources" USING btree ("community_slug","position");--> statement-breakpoint
CREATE INDEX "verification_events_community_idx" ON "verification_events" USING btree ("community_slug");