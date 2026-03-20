import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './styles.css';

// Read directly from the shared Redux store
const selectHistory = (s) => s.history.items;

const removeItem   = (i) => ({ type: 'history/removeHistoryItem', payload: i });
const clearHistory = ()  => ({ type: 'history/clearHistory' });

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',     icon: '▶', color: '#ff4545' },
  { id: 'instagram', label: 'Instagram',   icon: '◈', color: '#e040fb' },
  { id: 'tiktok',    label: 'TikTok',      icon: '♪', color: '#00f5d4' },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '⬡', color: '#4fa3e0' },
  { id: 'podcast',   label: 'Podcast',     icon: '⊚', color: '#f0a04b' },
  { id: 'twitter',   label: 'X / Twitter', icon: '✕', color: '#5bc8e0' },
  { id: 'custom',    label: 'Custom',      icon: '⊕', color: '#aaa' },
];

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * HistoryPanelMFE
 * Props:
 *   onRestore {function} - called with history item when user clicks restore
 *
 * Reads history from shared Redux store, dispatches removeItem / clearHistory.
 */
export default function HistoryPanel({ onRestore }) {
  const dispatch = useDispatch();
  const history  = useSelector(selectHistory);
  const [expanded, setExpanded] = useState(null);

  if (!history.length) {
    return (
      <div className="mx-8 flex flex-col items-center justify-center h-48 border border-white/7 rounded-xl bg-surface text-muted gap-3">
        <span style={{ fontSize: 32, opacity: 0.3 }}>◷</span>
        <p className="text-xs font-mono">No history yet — generate your first script!</p>
      </div>
    );
  }

  return (
    <div className="px-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted font-mono">{history.length} script{history.length !== 1 ? 's' : ''} saved</p>
        <button
          onClick={() => dispatch(clearHistory())}
          className="text-[10px] text-muted font-mono px-2 py-1 rounded border border-white/7 hover:text-danger hover:border-danger/40 transition-all duration-200 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {history.map((item, i) => {
          const platform  = PLATFORMS.find((p) => p.id === item.platform);
          const isExpanded = expanded === i;
          const wordCount  = item.result?.full?.split(/\s+/).filter(Boolean).length || 0;

          return (
            <div
              key={item.id || i}
              className="border border-white/7 rounded-xl bg-surface overflow-hidden transition-all duration-200
                         hover:border-white/15"
            >
              {/* Row header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span style={{ color: platform?.color, fontSize: 16 }}>{platform?.icon}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text font-mono truncate">
                    {item.config?.topic || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted font-mono">
                    <span style={{ color: platform?.color }}>{platform?.label}</span>
                    <span>·</span>
                    <span>{item.config?.duration}</span>
                    <span>·</span>
                    <span>{item.config?.tone}</span>
                    <span>·</span>
                    <span>{wordCount} words</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted font-mono">{formatDate(item.createdAt)}</span>

                  <button
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    className="px-2 py-1 text-[10px] font-mono text-muted border border-white/7 rounded hover:text-text hover:border-white/20 transition-all cursor-pointer"
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>

                  <button
                    onClick={() => onRestore && onRestore(item)}
                    className="px-2.5 py-1 text-[10px] font-mono text-accent border border-accent/30 rounded
                               bg-accent/5 hover:bg-accent/10 transition-all cursor-pointer"
                  >
                    Restore
                  </button>

                  <button
                    onClick={() => dispatch(removeItem(i))}
                    className="px-2 py-1 text-[10px] font-mono text-muted border border-white/7 rounded
                               hover:text-danger hover:border-danger/40 transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Expanded preview */}
              {isExpanded && (
                <div className="border-t border-white/7 px-4 py-4">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Hook', value: item.config?.hook },
                      { label: 'Language', value: item.config?.language },
                      { label: 'CTA', value: item.config?.cta },
                    ].map((meta) => (
                      <div key={meta.label}>
                        <p className="text-[9px] text-muted uppercase tracking-widest mb-0.5">{meta.label}</p>
                        <p className="text-xs text-text font-mono">{meta.value || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {item.result?.full && (
                    <div className="bg-surface2 rounded-lg p-3">
                      <p className="text-[9px] text-muted uppercase tracking-widest mb-2">Script Preview</p>
                      <p className="text-xs font-mono text-muted leading-relaxed line-clamp-4">
                        {item.result.full.substring(0, 400)}
                        {item.result.full.length > 400 && '…'}
                      </p>
                    </div>
                  )}

                  {item.result?.hashtags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.result.hashtags.slice(0, 6).map((tag, j) => (
                        <span
                          key={j}
                          className="text-[9px] px-2 py-0.5 rounded-full font-mono text-accent bg-accent/8 border border-accent/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
