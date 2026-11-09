CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'bot' NOT NULL,
	"bot_paused" boolean DEFAULT false NOT NULL,
	"flag_reason" text,
	"source_ad_id" text,
	"source_headline" text,
	"last_message_at" timestamp,
	"last_message_preview" text,
	"last_nudge_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "conversations_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wa_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"wa_message_id" text,
	"direction" varchar(3) NOT NULL,
	"sender" varchar(10) NOT NULL,
	"type" varchar(20) DEFAULT 'text' NOT NULL,
	"body" text,
	"tool_calls" jsonb,
	"latency_ms" integer,
	"delivery_status" varchar(12),
	"delivery_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wa_messages_wa_message_id_unique" UNIQUE("wa_message_id")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wa_messages" ADD CONSTRAINT "wa_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;