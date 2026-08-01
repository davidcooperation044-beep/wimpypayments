import { useEffect, useState } from 'react';
import { createPlan } from '../subscriptions/createPlan';
import { subscribe } from '../subscriptions/subscribe';

export default function PlansPage() {
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    async function bootstrap() {
      const created = await createPlan({
        product_name: 'test-product',
        name: 'Demo Plan',
        price: 1000,
        billing_interval: 'monthly',
      });
      setPlan(created);
    }

    bootstrap();
  }, []);

  async function handleSubscribe() {
    if (!plan) return;
    await subscribe({ plan_id: plan.id });
  }

  return (
    <div>
      <h1>Plans</h1>
      {plan ? <p>{plan.name} - {plan.price}</p> : <p>Loading...</p>}
      <button onClick={handleSubscribe}>Subscribe</button>
    </div>
  );
}
