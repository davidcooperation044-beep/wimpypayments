import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { subscribe } from '../subscriptions/subscribe';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      const { data, error } = await supabase.from('plans').select('*');
      if (error) {
        setError(error.message);
        return;
      }
      setPlans(data || []);
    }

    loadPlans();
  }, []);

  async function handleSubscribe(planId: string) {
    try {
      await subscribe({ plan_id: planId });
      alert('Subscription activated successfully');
    } catch (subscribeError) {
      const message = subscribeError instanceof Error ? subscribeError.message : 'Subscription failed';
      setError(message);
    }
  }

  return (
    <div>
      <h1>Plans</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {plans.length === 0 ? (
        <p>No subscription plans are available yet. Admin users can create plans in the admin panel.</p>
      ) : (
        <ul>
          {plans.map((plan) => (
            <li key={plan.id}>
              <strong>{plan.name}</strong> — {plan.price}
              <button onClick={() => handleSubscribe(plan.id)} style={{ marginLeft: 12 }}>
                Subscribe
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
