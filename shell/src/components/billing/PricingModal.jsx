import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

const PRO_FEATURES = [
  'Unlimited scripts',
  'All 6 platforms',
  'Unlimited history',
  'All hook styles & tones',
  'Export scripts',
  'Priority generation',
];

export default function PricingModal({ onClose, reason }) {
  const { authFetch }              = useAuth();
  const [period,  setPeriod]       = useState('monthly');
  const [loading, setLoading]      = useState(false);
  const [error,   setError]        = useState(null);

  const prices = {
    monthly: { amount: '$9',  per: '/month' },
    yearly:  { amount: '$79', per: '/year'  },
  };

  const handleUpgrade = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await authFetch('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout');
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 16 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0e1118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#666e85', cursor: 'pointer', fontSize: 18 }}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {reason === 'limit' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, marginBottom: 12, background: 'rgba(224,91,91,0.1)', border: '1px solid rgba(224,91,91,0.3)', fontSize: 11, color: '#e05b5b', fontFamily: '"DM Mono", monospace' }}>
              ⚠ Free plan limit reached
            </div>
          )}
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
            Upgrade to <span style={{ color: '#63dca3' }}>Pro</span>
          </h2>
          <p style={{ fontSize: 12, color: '#666e85', fontFamily: '"DM Mono", monospace' }}>
            Unlimited scripts. Every platform. Always.
          </p>
        </div>

        {/* Period toggle */}
        <div style={{ display: 'flex', background: '#141720', borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
          {['monthly', 'yearly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: '"DM Mono", monospace',
              background: period === p ? '#0e1118' : 'transparent',
              color: period === p ? '#eef0f6' : '#666e85',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
              {p === 'yearly' && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: 'rgba(99,220,163,0.15)', color: '#63dca3', border: '1px solid rgba(99,220,163,0.3)' }}>Save 27%</span>}
            </button>
          ))}
        </div>

        {/* Price */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 40, color: '#63dca3' }}>{prices[period].amount}</span>
          <span style={{ fontSize: 13, color: '#666e85', fontFamily: '"DM Mono", monospace' }}>{prices[period].per}</span>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 24 }}>
          {PRO_FEATURES.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13, color: '#eef0f6', fontFamily: '"DM Mono", monospace' }}>
              <span style={{ color: '#63dca3', fontSize: 12 }}>✓</span>{f}
            </div>
          ))}
        </div>

        {error && <p style={{ color: '#e05b5b', fontSize: 11, fontFamily: '"DM Mono", monospace', textAlign: 'center', marginBottom: 12 }}>{error}</p>}

        <button onClick={handleUpgrade} disabled={loading} style={{
          width: '100%', padding: '14px 0',
          background: loading ? '#0a3d24' : 'linear-gradient(135deg, #63dca3, #1a9a6a)',
          border: 'none', borderRadius: 10,
          color: loading ? '#63dca3' : '#070d0a',
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        }}>
          {loading ? 'Redirecting to checkout…' : `Upgrade to Pro (${period === 'yearly' ? 'Yearly' : 'Monthly'})`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#666e85', fontFamily: '"DM Mono", monospace', marginTop: 12 }}>
          Powered by LemonSqueezy · Cancel anytime · Secure payment
        </p>
      </div>
    </div>
  );
}