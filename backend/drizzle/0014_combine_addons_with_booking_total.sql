UPDATE "bookings" AS b
SET "total_amount" = b."total_amount" + addon_totals.amount,
    "updated_at" = now()
FROM (
  SELECT "booking_id", SUM("client_price") AS amount
  FROM "addons"
  GROUP BY "booking_id"
) AS addon_totals
WHERE b."id" = addon_totals."booking_id";--> statement-breakpoint
UPDATE "payments"
SET "category" = 'Booking Advance'
WHERE LOWER("category") = 'addon';--> statement-breakpoint
UPDATE "bookings" AS b
SET "advance_paid" = COALESCE((
  SELECT SUM(p."amount")
  FROM "payments" AS p
  WHERE p."booking_id" = b."id"
    AND p."flow" = 'IN'
    AND p."category" = 'Booking Advance'
), 0);--> statement-breakpoint
ALTER TABLE "addons" DROP COLUMN "received";--> statement-breakpoint
ALTER TABLE "addons" DROP COLUMN "received_at";--> statement-breakpoint
ALTER TABLE "addons" DROP COLUMN "payment_method";--> statement-breakpoint
ALTER TABLE "addons" DROP COLUMN "bank_name";