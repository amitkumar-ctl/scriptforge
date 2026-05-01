import React, { useState } from 'react';
import { usePlan } from '../../hooks/usePlan';
import PricingModal from './PricingModal';

export default function PlanBadge() {
  const { isPro, loading }    = usePlan();
  const [showModal, setShowModal] = useState(false);

  if (loading) return null;

  if (isPro) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, fontSize: 15, background: 'rgba(99,220,163,0.1)', color: '#63dca3', border: '1px solid rgba(99,220,163,0.3)', fontFamily: '"DM Mono", monospace' }}>
        ✦ Pro
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, fontSize: 15, background: 'rgba(240,160,75,0.08)', color: '#f0a04b', border: '1px solid rgba(240,160,75,0.25)', fontFamily: '"DM Mono", monospace', cursor: 'pointer' }}>
        ↑ Upgrade
      </button>
      {showModal && <PricingModal onClose={() => setShowModal(false)} />}
    </>
  );
}