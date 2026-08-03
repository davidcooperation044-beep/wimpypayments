# Wimpy Pay API

## Wallet helpers

### getBalance
Returns the authenticated user's wallet balance.

```ts
import { getBalance } from '../src/wallet/getBalance';

const balance = await getBalance();
```

### fundWallet
Initializes a payment provider charge for wallet funding.

```ts
import { fundWallet } from '../src/wallet/fundWallet';

await fundWallet({ amount: 5000, provider: 'paystack' });
```

### getTransactions
Returns wallet transaction history for the authenticated user.

```ts
import { getTransactions } from '../src/wallet/getTransactions';

const transactions = await getTransactions();
```

## External server-to-server wallet charging

### chargeWallet
Charges a user's WimpyPay wallet from another Wimpy product over a server-to-server endpoint. This is for trusted backend integrations only and must never be called from a browser.

Request:

```http
POST /api/external/charge-wallet
x-internal-api-key: <shared-secret>
Content-Type: application/json

{
  "user_id": "uuid",
  "amount": 2500,
  "currency": "NGN",
  "reference": "product-purchase-001",
  "description": "WimpyID premium feature"
}
```

Response:

```json
{
  "ok": true,
  "transaction_reference": "product-purchase-001",
  "new_balance": 7500,
  "currency": "NGN"
}
```

Failure:

```json
{
  "ok": false,
  "error": "insufficient-funds"
}
```

This endpoint validates a shared secret against `WIMPYPAY_INTERNAL_API_KEY`, deducts the wallet balance atomically, inserts a `charge` transaction, and sends a best-effort receipt email to the user.

## External server-to-server subscription helpers

### getPlan
Returns plan pricing details for a product plan so other Wimpy products can display accurate pricing without hardcoding values.

Request:

```http
GET /api/external/plan?product_name=<product>&plan_name=<plan>
x-internal-api-key: <shared-secret>
```

Response:

```json
{
  "ok": true,
  "plan": {
    "id": "plan-id",
    "product_name": "wimpybooks",
    "name": "Premium",
    "price": 2500,
    "billing_interval": "monthly"
  }
}
```

Failure:

```json
{
  "ok": false,
  "error": "plan-not-found"
}
```

### subscribeToPlan
Subscribes a user to a plan using wallet funds and the shared internal API key. This endpoint looks up the plan by `product_name` and `plan_name`, charges the user's WimpyPay wallet atomically, activates the subscription, and sends a receipt email.

Request:

```http
POST /api/external/subscribe
x-internal-api-key: <shared-secret>
Content-Type: application/json

{
  "user_id": "uuid",
  "product_name": "wimpybooks",
  "plan_name": "Premium",
  "reference": "wimpybooks-subscription-001"
}
```

Response:

```json
{
  "ok": true,
  "subscription": {
    "subscription_id": "subscription-uuid",
    "subscription_user_id": "uuid",
    "subscription_plan_id": "plan-id",
    "subscription_status": "active",
    "subscription_current_period_end": "2026-09-03T...",
    "subscription_created_at": "2026-08-03T..."
  }
}
```

Failure:

```json
{
  "ok": false,
  "error": "insufficient-funds",
  "requiredAmount": 2500,
  "currentBalance": 1500
}
```

This endpoint is server-to-server only and requires `WIMPYPAY_INTERNAL_API_KEY` for authorization.

## Subscription helpers

### createPlan
Creates a demo plan that future products can later reuse.

```ts
import { createPlan } from '../src/subscriptions/createPlan';

await createPlan({ product_name: 'test-product', name: 'Demo Plan', price: 1000, billing_interval: 'monthly' });
```

### subscribe
Subscribes an authenticated user to a plan.

```ts
import { subscribe } from '../src/subscriptions/subscribe';

await subscribe({ plan_id: 'plan-id' });
```

### cancelSubscription
Cancels an existing subscription.

```ts
import { cancelSubscription } from '../src/subscriptions/cancelSubscription';

await cancelSubscription('subscription-id');
```
