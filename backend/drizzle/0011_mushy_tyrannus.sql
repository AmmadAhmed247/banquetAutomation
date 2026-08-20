ALTER TABLE "payments" RENAME COLUMN "type" TO "category";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "booking_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "flow" varchar(10) DEFAULT 'IN' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "who" varchar(150);