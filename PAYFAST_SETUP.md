# PayFast Card Payment Setup (Meezan Bank)

Card payments are integrated via **PayFast hosted checkout**. When credentials are added, customers can pay by debit/credit card at checkout. PayFast settles funds to the **Meezan Bank merchant account** linked in the PayFast dashboard.

## 1. Backend `.env`

Add these values to `backend/.env`:

```env
FRONTEND_URL=http://localhost:3002

PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_SECURED_KEY=your_secured_key
PAYFAST_MERCHANT_NAME=Velcraft
PAYFAST_MODE=sandbox
PAYFAST_SANDBOX_URL=https://sandbox.payfast.com
PAYFAST_LIVE_URL=https://api.payfast.com
```

For production:

```env
PAYFAST_MODE=live
FRONTEND_URL=https://your-live-domain.com
```

> Use the exact API/base URLs PayFast provides in your merchant welcome email if they differ from the defaults above.

## 2. Run migration

```bash
cd backend
php artisan migrate
```

## 3. PayFast dashboard configuration

In the PayFast merchant portal, set:

| Setting | Value |
|--------|--------|
| Success URL | `{FRONTEND_URL}/checkout/payment/return?status=success&order={order}` |
| Failure URL | `{FRONTEND_URL}/checkout/payment/return?status=failure&order={order}` |
| IPN / Callback URL | `{BACKEND_URL}/api/v1/payments/payfast/ipn` |

Settlement bank: **Meezan Bank** (configured in PayFast, not in code).

## 4. Test flow

1. Start backend + frontend locally
2. Add items to cart → checkout
3. Select **Debit / Credit Card**
4. Complete PayFast sandbox payment
5. Confirm order shows **paid** in admin

## 5. API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/payments/payfast/status` | Check if card payments are enabled |
| POST | `/api/v1/payments/payfast/checkout` | Create hosted checkout session |
| POST | `/api/v1/payments/payfast/verify` | Verify customer return from PayFast |
| POST | `/api/v1/payments/payfast/ipn` | Server-to-server PayFast callback |

## 6. What you need from client

- PayFast **Merchant ID**
- PayFast **Secured Key**
- Registered **Merchant Name** (exact spelling in PayFast)
- Meezan bank account linked inside PayFast for settlement
- Sandbox credentials for testing, live credentials for production

## 7. Notes

- Until `PAYFAST_MERCHANT_ID` and `PAYFAST_SECURED_KEY` are set, the card option stays hidden at checkout.
- COD and bank transfer continue to work as before.
- Do **not** commit real keys to git.
