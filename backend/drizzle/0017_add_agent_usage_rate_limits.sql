CREATE TABLE "agent_usage" (
	"scope_key" text NOT NULL,
	"window_start" timestamp NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "agent_usage_pk" PRIMARY KEY("scope_key", "window_start")
);
