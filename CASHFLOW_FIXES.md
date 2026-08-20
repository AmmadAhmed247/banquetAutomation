# Cashflow Payment Tracking & Booking Model Updates

## Complete Payment Method Flow

### Backend
The system now properly tracks payments across advance and settlement stages:

**Booking Schema Fields** (`backend/model/schema.js`):
- `payment_method` - Tracks advance payment method, updated to settlement method when status changes to "Finished"
- `bank_name` - Bank/wallet name for bank transfers
- `advance_paid` - Amount paid so far
- `advance_due_date` - Due date for advance payment

**Payment Records** (`payments` table):
Each payment creates a detailed ledger entry with:
- `flow`: "IN" (inflow) or "OUT" (outflow)  
- `category`: "Booking Advance" or "Event Final Settlement"
- `payment_method`: Actual method used (Cash, Bank Transfer, JazzCash, Easypaisa, etc.)
- `bank_name`: Bank/wallet identifier if applicable
- `amount`: Exact amount received
- `who`: Client name for tracking
- `bookingId`: Links to booking for reference

### Frontend

**BookingModal.jsx**:
- New settlement payment section appears when booking is being marked "Finished"
- Users can select different settlement payment method than advance payment
- Separate bank selector for settlement vs advance if using Bank Transfer
- Shows remaining balance that needs to be collected

**StatsSection.jsx**:
- Calculates revenue based on actual payment records (payments table)
- Falls back to booking records if payment data unavailable
- Groups revenue by payment method: Cash, Bank Transfer, JazzCash, Easypaisa, etc.
- Excludes cancelled bookings from revenue calculation

**BookingsList.jsx**:
- Displays advance payment method in booking card
- Shows payment bar with collection percentage
- Updates to show settlement method once booking is finished

## Issues Fixed

### 1. **Payment Service** (`backend/services/payment.service.js`)
   - ✅ Uses correct `category` field (was `type`)
   - ✅ Adds `flow: "IN"` to track payment direction
   - ✅ Records `who` field with client name
   - ✅ Properly handles bank details based on payment method

### 2. **Booking Service** (`backend/services/booking.service.js`)
   - ✅ Records settlement payment in payments table with correct category
   - ✅ Updates booking `payment_method` to settlement method when status becomes "Finished"
   - ✅ Updates booking `bank_name` to settlement bank when applicable

### 3. **Cashflow Service** (`backend/services/cashflow.service.js`)
   - ✅ Reads correct `category` field from payments
   - ✅ Displays actual payment method in ledger
   - ✅ Shows client who made each payment
   - ✅ Groups totals by actual payment method used

### 4. **Frontend Components**
   - ✅ BookingModal shows settlement payment option when marking finished
   - ✅ StatsSection properly aggregates by payment method
   - ✅ BookingsList displays current payment method (settlement if finished)

## Example Workflow

### Scenario: Gold Package = 850,000 PKR
**Day 1 - Booking Created (Pending)**
- Advance: 300,000 PKR in Cash
- Status: Pending
- Payment Method: Cash

**Cashflow Shows:**
```
IN: 300,000 PKR (Cash) - Booking Advance
```

**Day 30 - Event Completed (Mark Finished)**
- Remaining: 550,000 PKR via Bank Transfer (Habib Metro)
- Status: Finished
- Payment Method: Bank Transfer (updated)

**Payments Created:**
```
Payment 1: 300,000 | Cash | Booking Advance
Payment 2: 550,000 | Bank Transfer | Event Final Settlement
```

**Cashflow Shows:**
```
IN: 300,000 PKR (Cash) - Booking Advance
IN: 550,000 PKR (Bank Transfer) - Event Final Settlement
---
Cash: 300,000
Bank Transfer: 550,000
Total In: 850,000
```

## API Payload Examples

### Creating a Booking with Advance
```javascript
POST /api/bookings
{
  "client": "Ayesha & Bilal",
  "event": "Wedding",
  "totalAmount": 850000,
  "advanceAmount": 300000,
  "advancePaid": 300000,
  "paymentMethod": "Cash",
  "status": "Pending"
}
```

Creates payment:
```
{
  "flow": "IN",
  "category": "Booking Advance",
  "amount": "300000",
  "payment_method": "Cash",
  "who": "Ayesha & Bilal",
  "bookingId": 1
}
```

### Updating Booking to Finished with Settlement
```javascript
PUT /api/bookings/1
{
  "status": "Finished",
  "settlementPaymentMethod": "Bank Transfer",
  "settlementBankName": "Habib Metro Usman"
}
```

This:
1. Creates settlement payment record (550,000 | Bank Transfer | Event Final Settlement)
2. Updates booking.payment_method to "Bank Transfer"
3. Updates booking.bank_name to "Habib Metro Usman"

## Database Impact

No migration required - the system uses existing fields:
- `payment_method` field is updated intelligently
- `bank_name` field is updated intelligently  
- `payments` table stores detailed records for ledger

The fix is fully backward compatible with existing bookings.
