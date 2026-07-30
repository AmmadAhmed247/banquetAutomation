CREATE TABLE "addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"service" varchar(100) NOT NULL,
	"client_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"vendor_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"commission" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "monthly_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "time_slot" varchar(20) DEFAULT 'Night';--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "bank_name" varchar(50);--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;