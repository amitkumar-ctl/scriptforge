import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

export function usePlan() {
  const { user, authFetch } = useAuth();
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    authFetch('/api/billing/plan')
      .then(r => r.json())
      .then(data => setPlan(data.plan))
      .catch(() => setPlan('free'))
      .finally(() => setLoading(false));
  }, [user]);

  return { plan, isPro: plan === 'pro', isFree: plan === 'free', loading };
}