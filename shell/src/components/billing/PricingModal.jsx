import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { createPortal } from 'react-dom';

const PRO_FEATURES = [
  'Unlimited scripts',
  'All 6 platforms',
  'Unlimited history',
  'All hook styles & tones',
  'Export scripts',
  'Priority generation',
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingModal({ onClose, reason }) {
  const { authFetch, user } = useAuth();
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const prices = {
    monthly: { amount: '₹300', per: '/month' },
    yearly: { amount: '₹3000', per: '/year' },
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay checkout. Check your internet connection.');

      // ✅ authFetch now returns axios response — use .data directly, no .json()
      const res = await authFetch('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ period }),
      });

      const { subscriptionId, razorpayKeyId } = res.data;

      const options = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: 'ScriptForge',
        description: `ScriptForge Pro – ${period === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
        image: '/android-chrome-192x192.png',
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#63dca3' },
        handler: async function (response) {
          try {
            const res = await authFetch('/api/billing/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                period,
              }),
            });

            if (res.data.success) {
              window.location.href = `${window.location.origin}/app?upgraded=true`;
            } else {
              setError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      // Axios errors keep the server message in err.response.data.error
      const message = err.response?.data?.error || err.message || 'Something went wrong';
      setError(message);
      setLoading(false);
    }
  };

  return (
    createPortal(
      <div
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0e1118] p-8"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-lg text-[#666e85] hover:text-white"
          >
            ✕
          </button>

          <div className="mb-6 text-center">
            {reason === 'limit' && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-[11px] font-mono text-red-400">
                ⚠ Free plan limit reached
              </div>
            )}
            <h2 className="mb-1 text-[22px] font-extrabold font-sans">
              Upgrade to <span className="text-[#63dca3]">Pro</span>
            </h2>
            <p className="text-[12px] text-[#666e85] font-mono">
              Unlimited scripts. Every platform. Always.
            </p>
          </div>

          <div className="mb-5 flex gap-1 rounded-lg bg-[#141720] p-1">
            {['monthly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-mono transition-all
                ${period === p
                    ? 'bg-[#0e1118] text-[#eef0f6]'
                    : 'text-[#666e85] hover:text-white'
                  }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
                {p === 'yearly' && (
                  <span className="rounded-full border border-[#63dca3]/30 bg-[#63dca3]/10 px-1.5 text-[9px] text-[#63dca3]">
                    Save 27%
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mb-5 text-center">
            <span className="text-4xl font-extrabold text-[#63dca3]">
              {prices[period].amount}
            </span>
            <span className="ml-1 text-[13px] text-[#666e85] font-mono">
              {prices[period].per}
            </span>
          </div>

          <div className="mb-6 space-y-2">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-[13px] text-[#eef0f6] font-mono">
                <span className="text-[#63dca3] text-xs">✓</span>
                {f}
              </div>
            ))}
          </div>

          {error && (
            <p className="mb-3 text-center text-[11px] text-red-400 font-mono">{error}</p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className={`w-full rounded-lg py-3.5 text-[15px] font-bold transition-all
            ${loading
                ? 'bg-[#0a3d24] text-[#63dca3] cursor-not-allowed'
                : 'bg-gradient-to-br from-[#63dca3] to-[#1a9a6a] text-[#070d0a] hover:opacity-90'
              }`}
          >
            {loading
              ? 'Opening checkout…'
              : `Upgrade to Pro (${period === 'yearly' ? 'Yearly' : 'Monthly'})`}
          </button>

          <p className="mt-3 text-center text-[10px] text-[#666e85] font-mono">
            Powered by Razorpay · Cancel anytime · Secure payment
          </p>
        </div>
      </div>,
      document.body
    )
  );
}