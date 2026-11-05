# Cashflow Desk

This note summarizes the cashflow desk wiring, behavior, and database migration.

## Money In

- The cash desk records booking payments through `POST /api/payments`, the existing payment route.
- Payments keep the selected method and update the booking/payment ledger.
- The booking picker supports searching by receipt number or client name. Without a search term, it shows the next five upcoming bookings with a balance due, starting today.
- The paid and due amounts use total received (advance plus settlement), not only `advance_paid`.

## Money Out

- The cash desk records expenses through `POST /api/dailyExpense/createExpense`, the existing daily-expense route.
- Daily-expense categories are shared from `client/src/components/Management/ManagementUtils.js`.
- Quantity categories (Pepsi, Coca Cola, Diesel, Water Bottles) ask for a quantity. JUMBO records a selected brand and quantity. Other categories allow an expense description.
- New Money Out entries are paid in Cash; the form does not offer a payment-method selector.
- The database keeps the existing payment-method column so historical records retain their original method. The cashflow ledger continues to display that historical method; rows without one default to Cash.

## Database migration

Migration `backend/drizzle/0015_add_daily_expense_payment_method.sql` adds the method column to `daily_expenses`:

```sql
ALTER TABLE "daily_expenses"
ADD COLUMN "payment_method" varchar(50) DEFAULT 'Cash' NOT NULL;
```

The matching Drizzle schema is in `backend/model/schema.js`. The database retains this column to preserve existing payment-method history (including an existing non-Cash record); new Money Out entries omit the method and use the database's Cash default. No column-drop migration is applied or needed.

The connected database was checked: the column exists, and Drizzle records migration 0015 as applied. For another database, run pending migrations from the backend directory after confirming its `DATABASE_URL` points to the intended environment:

```powershell
cd backend
npx drizzle-kit migrate
```

## Main implementation files

- `client/src/pages/CashflowPage.jsx` — cashflow summary, booking search/suggestions, and Money In/Out UI.
- `client/src/lib/hooks/cashdesk.hook.js` — cash desk API requests and query refresh.
- `backend/routes/payment.route.js` and `backend/controllers/payment.controller.js` — booking payment endpoint.
- `backend/routes/dailyExpense.route.js` and `backend/controllers/dailyExpense.controller.js` — daily-expense endpoints and request validation.
- `backend/services/dailyExpense.service.js` — daily-expense database writes.
- `backend/services/cashflow.service.js` — ledger construction, including historical daily-expense payment methods.
- `backend/drizzle/0015_add_daily_expense_payment_method.sql` — database migration.

## Verification

The client production build succeeds. ESLint reports one existing warning in `CashflowPage.jsx` about the `activity` expression used as a `useMemo` dependency.
