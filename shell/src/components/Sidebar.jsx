import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveView, selectActiveView } from '../store/slices/uiSlice';
import { selectHistory, selectHistoryCount, fetchHistory, clearHistory } from '../store/slices/historySlice';
import { restoreFromHistory } from '../store/slices/scriptSlice';
import { useAuth } from '../auth/AuthContext';
import { PLATFORMS } from '../utils/constants';

const navItems = (count) => [
  { id: 'generator', icon: '⊞', label: 'Generator' },
  { id: 'history', icon: '◷', label: `History (${count})` },
  { id: 'templates', icon: '⊟', label: 'Templates' },
];


function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isDesktop;
}

function NavContent({ activeView, historyCount, history, onNav, onRestore }) {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <p style={{ padding: '0 16px', marginBottom: 8, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666e85', fontFamily: '"DM Mono", monospace' }}>
          Navigation
        </p>
        {navItems(historyCount).map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', fontSize: 12, cursor: 'pointer',
              background: activeView === item.id ? 'rgba(99,220,163,0.05)' : 'transparent',
              border: 'none',
              borderLeft: `2px solid ${activeView === item.id ? '#63dca3' : 'transparent'}`,
              color: activeView === item.id ? '#eef0f6' : '#666e85',
              textAlign: 'left', fontFamily: '"DM Mono", monospace',
              transition: 'all 0.2s',
            }}
          >
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div>
          <p style={{ padding: '0 16px', marginBottom: 8, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666e85', fontFamily: '"DM Mono", monospace' }}>
            Recent
          </p>
          {history.slice(0, 4).map((item) => {
            const platform = PLATFORMS.find((p) => p.id === item.platform);
            return (
              <button
                key={item.id}
                onClick={() => onRestore(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 16px', fontSize: 12, color: '#666e85',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: '"DM Mono", monospace', transition: 'all 0.2s',
                }}
              >
                <span style={{ color: platform?.color }}>{platform?.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                  {item.config?.topic || item.topic || 'Untitled'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Sidebar({ open, onClose }) {
  const dispatch = useDispatch();
  const { authFetch, user } = useAuth();
  const activeView = useSelector(selectActiveView);
  const historyCount = useSelector(selectHistoryCount);
  const history = useSelector(selectHistory);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (user && authFetch) dispatch(fetchHistory({ authFetch }));
    if (!user) dispatch(clearHistory());
  }, [user]);

  const handleNav = (id) => {
    dispatch(setActiveView(id));
    if (!isDesktop) onClose();
  };

  const handleRestore = (item) => {
    dispatch(restoreFromHistory(item));
    dispatch(setActiveView('generator'));
    if (!isDesktop) onClose();
  };

  const sharedProps = {
    activeView, historyCount, history,
    onNav: handleNav,
    onRestore: handleRestore,
  };

  const asideStyle = {
    width: 240,
    background: '#0e1118',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 20,
    paddingBottom: 20,
  };

  if (isDesktop) {
    return (
      <aside style={{ ...asideStyle, flexShrink: 0 }}>
        <NavContent {...sharedProps} />
      </aside>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.6)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
      />

      {/* Drawer */}
      <aside style={{
        ...asideStyle,
        position: 'fixed', top: 0, left: 0,
        height: '100%', zIndex: 50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
      }}>
        {/* Mobile header — logo + close button */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 16px 10px', marginBottom: 20, marginTop : 40,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, #63dca3, #1a9a6a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#070d0a',
            }}>✦</div>
            Script<span style={{ color: '#63dca3' }}>Forge</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              // border: '1px solid rgba(255,255,255,0.15)',
              // borderRadius: 6,
              color: '#eef0f6',
              cursor: 'pointer',
              fontSize: 14,
              padding: '5px',
              lineHeight: 1,
            }}
          >✕</button>
        </div>

        <NavContent {...sharedProps} />
      </aside>
    </>
  );
}