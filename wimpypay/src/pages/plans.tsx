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
    <main className="page-shell">
      <div className="page-card">
        <header className="page-header">
          <h1 className="brand-title">Plans</h1>
          <p className="page-copy">Choose a subscription that keeps your ledger active.</p>
        </header>

        {error && <p className="form-message error">{error}</p>}

        {plans.length === 0 ? (
          <p>No subscription plans are available yet. Admin users can create plans in the admin panel.</p>
        ) : (
          <div className="plan-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 className="plan-title">{plan.name}</h2>
                  {plan.is_active ? <span className="status-line">Active</span> : null}
                </div>
                <p className="plan-price">₦{Number(plan.price).toFixed(2)}</p>
                <div className="plan-actions">
                  <button className="button button-primary" onClick={() => handleSubscribe(plan.id)}>
                    Subscribe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
