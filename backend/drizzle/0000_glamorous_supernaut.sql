CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"phone" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"client" varchar(150) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"guests" integer DEFAULT 0 NOT NULL,
	"date" timestamp NOT NULL,
	"event" varchar(100) NOT NULL,
	"package_name" varchar(100) NOT NULL,
	"venue" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"advance_paid" numeric(12, 2) DEFAULT '0' NOT NULL,
	"payment_method" varchar(50) DEFAULT 'Cash' NOT NULL,
	"payment_note" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_name" varchar(100) NOT NULL,
	"event_time" timestamp NOT NULL,
	"package_price" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;