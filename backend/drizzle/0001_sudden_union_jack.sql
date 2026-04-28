ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "phone" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "event_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "client" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "guests" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "venue" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "total_amount" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "advance_paid" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_method" varchar(50) DEFAULT 'Cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_note" varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "updated_at" timestamp DEFAULT now();