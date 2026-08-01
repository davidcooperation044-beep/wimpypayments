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
