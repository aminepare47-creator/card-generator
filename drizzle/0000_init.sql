CREATE TABLE "card_scans" (
	"slug" text NOT NULL,
	"day" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "card_scans_slug_day_pk" PRIMARY KEY("slug","day")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"company" text,
	"phone" text,
	"email" text,
	"website" text,
	"whatsapp" text,
	"address" text,
	"linkedin" text,
	"facebook" text,
	"instagram" text,
	"theme" text DEFAULT 'indigo' NOT NULL,
	"template" text DEFAULT 'halo' NOT NULL,
	"photo_url" text,
	"logo_url" text,
	"products" text,
	"bio" text,
	"custom_color" text,
	"font_family" text,
	"photo_shape" text,
	"name_size" text,
	"edit_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "card_scans_slug_idx" ON "card_scans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cards_slug_idx" ON "cards" USING btree ("slug");