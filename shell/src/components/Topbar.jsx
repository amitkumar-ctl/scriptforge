import React, { useState, useEffect } from 'react';
import UserMenu from './auth/UserMenu';
import PlanBadge from './billing/PlanBadge';
import { useAuth } from '../auth/AuthContext';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

export default function Topbar({ onMenuClick }) {
  const isDesktop = useIsDesktop();
  const { user } = useAuth();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 24px', height: 56,
      background: 'rgba(8,10,15,0.9)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    }}>

      {!isDesktop && (
        <button
          onClick={onMenuClick}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}
          aria-label="Open menu"
        >
          <span style={{ display: 'block', width: 20, height: 2, background: '#eef0f6', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: '#eef0f6', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 20, height: 2, background: '#eef0f6', borderRadius: 2 }} />
        </button>
      )}

      {isDesktop && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg, #63dca3, #1a9a6a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#070d0a',
          }}>✦</div>
          Script<span style={{ color: '#63dca3' }}>Forge</span>
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && <PlanBadge />}
        <UserMenu />
      </div>
    </header>
  );
}