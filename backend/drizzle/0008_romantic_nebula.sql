CREATE TABLE "daily_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"label" text NOT NULL,
	"category" text NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "r_no" varchar(50);--> statement-breakpoint
ALTER TABLE "addons" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_r_no_unique" UNIQUE("r_no");