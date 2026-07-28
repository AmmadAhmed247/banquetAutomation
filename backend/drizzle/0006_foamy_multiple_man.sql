ALTER TABLE "bookings" ADD COLUMN "booking_reminder_sent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "resource_reminder_sent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "last_advance_reminder_at" timestamp;