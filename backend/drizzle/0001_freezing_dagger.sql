CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(11) NOT NULL,
	"password" varchar NOT NULL,
	"banquet_name" varchar NOT NULL,
	"role" varchar(20) DEFAULT 'admin',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "clients_id_unique" UNIQUE("id"),
	CONSTRAINT "clients_name_unique" UNIQUE("name"),
	CONSTRAINT "clients_email_unique" UNIQUE("email"),
	CONSTRAINT "clients_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "packages" ALTER COLUMN "event_time" SET DATA TYPE time;