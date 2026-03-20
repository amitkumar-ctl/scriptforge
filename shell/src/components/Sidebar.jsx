import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveView, selectActiveView } from '../store/slices/uiSlice';
import { selectHistoryCount } from '../store/slices/historySlice';
import { selectHistory } from '../store/slices/historySlice';
import { restoreFromHistory } from '../store/slices/scriptSlice';
import { PLATFORMS } from '../utils/constants';

const navItems = (historyCount) => [
  { id: 'generator', icon: '⊞', label: 'Generator' },
  { id: 'history',   icon: '◷', label: `History (${historyCount})` },
  { id: 'templates', icon: '⊟', label: 'Templates' },
];


export default function Sidebar() {
  const dispatch      = useDispatch();
  const activeView    = useSelector(selectActiveView);
  const historyCount  = useSelector(selectHistoryCount);
  const history       = useSelector(selectHistory);

  const handleRestore = (item) => {
    dispatch(restoreFromHistory(item));
    dispatch(setActiveView('generator'));
  };

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-white/7 overflow-y-auto flex flex-col py-5">

      {/* Navigation */}
      <div className="mb-7">
        <p className="px-4 mb-2 text-[9px] tracking-[0.15em] uppercase text-muted">Navigation</p>
        {navItems(historyCount).map((item) => (
          <button
            key={item.id}
            onClick={() => dispatch(setActiveView(item.id))}
            className={`
              w-full flex items-center gap-2.5 px-4 py-2 text-xs cursor-pointer transition-all duration-200
              border-l-2 text-left
              ${activeView === item.id
                ? 'text-text border-accent bg-accent/5'
                : 'text-muted border-transparent hover:text-text hover:bg-white/3'}
            `}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Recent history shortcuts */}
      {history.length > 0 && (
        <div>
          <p className="px-4 mb-2 text-[9px] tracking-[0.15em] uppercase text-muted">Recent</p>
          {history.slice(0, 4).map((item) => {
            const platform = PLATFORMS.find((p) => p.id === item.platform);
            return (
              <button
                key={item.id}
                onClick={() => handleRestore(item)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-muted hover:text-text hover:bg-white/3 transition-all cursor-pointer text-left"
              >
                <span style={{ color: platform?.color }}>{platform?.icon}</span>
                <span className="truncate max-w-[130px]">{item.config.topic || 'Untitled'}</span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
