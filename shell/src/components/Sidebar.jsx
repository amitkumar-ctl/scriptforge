import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setActiveView, selectActiveView, setActiveHistoryId } from '../store/slices/uiSlice';
import { selectHistory, selectHistoryCount, fetchHistory, clearHistory } from '../store/slices/historySlice';
import { restoreFromHistory, clearResult, setPlatform, setConfigField } from '../store/slices/scriptSlice';
import { useAuth } from '../auth/AuthContext';
import { PLATFORMS } from '../utils/constants';

const VIEW_TO_PATH = {
  generator:  '/app',
  history:    '/app/history',
  templates:  '/app/templates',
};

const PATH_TO_VIEW = {
  '/app':           'generator',
  '/app/history':   'history',
  '/app/templates': 'templates',
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
  console.log('activeHistoryId from store:', activeHistoryId);
  console.log('sessionStorage value:', sessionStorage.getItem('sf_active_history_id'));

  return (
    <>
      {/* Navigation Section */}
      <div className="mb-7">
        <p className="px-4 mb-2 text-[9px] tracking-[0.15em] uppercase text-[#a8b0c0] font-['DM_Mono',monospace]">
          Navigation
        </p>
        {navItems(historyCount).map((item) => {
          const isActive = activeView === item.id && !activeHistoryId;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={[
                'w-full flex items-center gap-2.5 px-4 py-[9px] text-xs cursor-pointer border-none text-left font-["DM_Mono",monospace] transition-all duration-200',
                isActive
                  ? 'border-l-2 border-[#63dca3] text-[#eef0f6] bg-[rgba(99,220,163,0.05)]'
                  : 'border-l-2 border-transparent text-[#a8b0c0] bg-transparent',
              ].join(' ')}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          );
        })}
      </div>

      {/* Recent History Section */}
      {history.length > 0 && (
        <div>
          <p className="px-4 mb-2 text-[9px] tracking-[0.15em] uppercase text-[#a8b0c0] font-['DM_Mono',monospace]">
            Recent
          </p>
          {history.slice(0, 4).map((item) => {
            const platform = PLATFORMS.find((p) => p.id === item.platform);
            const isActive = activeHistoryId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onRestore(item)}
                className={[
                  'w-full flex items-center gap-2.5 px-4 py-2 text-xs border-none cursor-pointer text-left font-["DM_Mono",monospace] transition-all duration-200',
                  isActive
                    ? 'text-[#eef0f6] bg-[rgba(99,220,163,0.05)] border-l-2 border-[#63dca3]'
                    : 'text-[#a8b0c0] bg-transparent border-l-2 border-transparent',
                ].join(' ')}
              >
                <span style={{ color: platform?.color }}>{platform?.icon}</span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]">
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
      dispatch(setPlatform('youtube'));
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

  // Shared aside classes
  const asideBase = 'w-60 bg-[#0e1118] border-r border-white/[0.07] overflow-y-auto flex flex-col pt-5 pb-5';

  if (isDesktop) {
    return (
      <aside className={`${asideBase} shrink-0`}>
        <NavContent {...sharedProps} />
      </aside>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 bg-black/60 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer */}
      <aside
        className={[
          asideBase,
          'fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pl-2.5 py-4 mb-5 mt-10 border-b border-white/[0.07]">
          <div className="flex items-center gap-2 font-['Syne',sans-serif] font-extrabold text-lg">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#63dca3] to-[#1a9a6a] flex items-center justify-center text-sm text-[#070d0a]">
              ✦
            </div>
            Script<span className="text-[#63dca3]">Forge</span>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent text-[#eef0f6] cursor-pointer text-sm p-[5px] leading-none border-none"
          >
            ✕
          </button>
        </div>

        <NavContent {...sharedProps} />
      </aside>
    </>
  );
}