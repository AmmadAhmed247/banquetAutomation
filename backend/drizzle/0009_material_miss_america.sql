CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"type" varchar(50) DEFAULT 'Advance' NOT NULL,
	"payment_method" varchar(50) DEFAULT 'Cash' NOT NULL,
	"bank_name" varchar(50),
	"note" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;