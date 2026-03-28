import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setActiveView, selectActiveView, setActiveHistoryId } from '../store/slices/uiSlice';
import { selectHistory, selectHistoryCount, fetchHistory, clearHistory } from '../store/slices/historySlice';
import { restoreFromHistory, clearResult, setPlatform, setConfigField } from '../store/slices/scriptSlice';
import { useAuth } from '../auth/AuthContext';
import { PLATFORMS } from '../utils/constants';

const VIEW_TO_PATH = {
  generator: '/',
  history: '/history',
  templates: '/templates',
};

const PATH_TO_VIEW = {
  '/': 'generator',
  '/history': 'history',
  '/templates': 'templates',
};

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

function NavContent({ activeView, historyCount, history, activeHistoryId, onNav, onRestore }) {
  // temporarily add this in Sidebar component
console.log('activeHistoryId from store:', activeHistoryId);
console.log('sessionStorage value:', sessionStorage.getItem('sf_active_history_id'));
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <p style={{ padding: '0 16px', marginBottom: 8, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a8b0c0', fontFamily: '"DM Mono", monospace' }}>
          Navigation
        </p>
        {navItems(historyCount).map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}  /* ← was onRestore, must be onNav */
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', fontSize: 12, cursor: 'pointer',
              border: 'none',
              borderLeft: `2px solid ${activeView === item.id && !activeHistoryId ? '#63dca3' : 'transparent'}`,
              color: activeView === item.id && !activeHistoryId ? '#eef0f6' : '#a8b0c0',
              background: activeView === item.id && !activeHistoryId ? 'rgba(99,220,163,0.05)' : 'transparent',
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
          <p style={{ padding: '0 16px', marginBottom: 8, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a8b0c0', fontFamily: '"DM Mono", monospace' }}>
            Recent
          </p>
          {history.slice(0, 4).map((item) => {
            const platform = PLATFORMS.find((p) => p.id === item.platform);
            const isActive = activeHistoryId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onRestore(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 16px', fontSize: 12,
                  color: isActive ? '#eef0f6' : '#a8b0c0',
                  background: isActive ? 'rgba(99,220,163,0.05)' : 'none',
                  border: 'none',
                  borderLeft: `2px solid ${isActive ? '#63dca3' : 'transparent'}`,
                  cursor: 'pointer',
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
  const navigate = useNavigate();
  const location = useLocation();
  const { authFetch, user } = useAuth();

  // ← all useSelectors unconditionally at top level
  const activeViewFromRedux = useSelector(selectActiveView);
  const activeHistoryId = useSelector((s) => s.ui.activeHistoryId);
  const historyCount = useSelector(selectHistoryCount);
  const history = useSelector(selectHistory);
  const isDesktop = useIsDesktop();

  const activeView = PATH_TO_VIEW[location.pathname] ?? activeViewFromRedux;

  useEffect(() => {
    if (user && authFetch) dispatch(fetchHistory({ authFetch }));
    if (!user) dispatch(clearHistory());
  }, [user]);

  const handleNav = (id) => {
    if (id === 'generator' && activeHistoryId) {
    dispatch(clearResult());
    dispatch(setPlatform('youtube')); // reset to default platform
    dispatch(setConfigField({ key: 'topic',    value: '' }));
    dispatch(setConfigField({ key: 'audience', value: '' }));
    dispatch(setConfigField({ key: 'duration', value: '5 min' }));
    dispatch(setConfigField({ key: 'tone',     value: 'Energetic' }));
    dispatch(setConfigField({ key: 'hook',     value: 'Bold Claim' }));
    dispatch(setConfigField({ key: 'language', value: 'English' }));
    dispatch(setConfigField({ key: 'cta',      value: 'Subscribe' }));
    dispatch(setConfigField({ key: 'notes',    value: '' }));
  }
    dispatch(setActiveView(id));
    dispatch(setActiveHistoryId(null));
    navigate(VIEW_TO_PATH[id] ?? '/');
    if (!isDesktop) onClose();
  };

  const handleRestore = (item) => {
    dispatch(restoreFromHistory(item));
    dispatch(setActiveView('generator'));
    dispatch(setActiveHistoryId(item.id));
    navigate('/');
    if (!isDesktop) onClose();
  };

  const sharedProps = {
    activeView, historyCount, history, activeHistoryId,
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
      <aside style={{
        ...asideStyle,
        position: 'fixed', top: 0, left: 0,
        height: '100%', zIndex: 50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 16px 10px', marginBottom: 20, marginTop: 40,
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
            style={{ background: 'none', color: '#eef0f6', cursor: 'pointer', fontSize: 14, padding: '5px', lineHeight: 1 }}
          >✕</button>
        </div>
        <NavContent {...sharedProps} />
      </aside>
    </>
  );
}