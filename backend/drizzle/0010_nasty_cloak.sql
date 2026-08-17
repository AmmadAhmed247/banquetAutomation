ALTER TABLE "addons" ADD COLUMN "received" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "addons" ADD COLUMN "received_at" timestamp;--> statement-breakpoint
ALTER TABLE "addons" ADD COLUMN "payment_method" varchar(50);--> statement-breakpoint
ALTER TABLE "addons" ADD COLUMN "bank_name" varchar(50);