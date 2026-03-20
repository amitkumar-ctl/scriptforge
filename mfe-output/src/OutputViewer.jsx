import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './styles.css';

// Reads from the shared Redux store injected by the shell
const selectResult    = (s) => s.script.result;
const selectStatus    = (s) => s.script.status;
const selectActiveTab = (s) => s.script.activeTab;

const setActiveTab = (tab) => ({ type: 'script/setActiveTab', payload: tab });

const PLATFORMS = [
  { id: 'youtube',   icon: '▶', color: '#ff4545' },
  { id: 'instagram', icon: '◈', color: '#e040fb' },
  { id: 'tiktok',    icon: '♪', color: '#00f5d4' },
  { id: 'linkedin',  icon: '⬡', color: '#4fa3e0' },
  { id: 'podcast',   icon: '⊚', color: '#f0a04b' },
  { id: 'twitter',   icon: '✕', color: '#5bc8e0' },
  { id: 'custom',    icon: '⊕', color: '#aaa' },
];

const TABS = ['script', 'hooks', 'hashtags', 'brief'];

function SkeletonLoader() {
  return (
    <div className="p-6 flex flex-col gap-3">
      {[100, 85, 100, 60, 100, 75, 100, 45].map((w, i) => (
        <div
          key={i}
          className="h-3.5 rounded"
          style={{
            width: `${w}%`,
            background: 'linear-gradient(90deg, #141720 25%, rgba(255,255,255,0.07) 50%, #141720 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s ${i * 0.08}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function StatCell({ value, label }) {
  return (
    <div className="bg-surface2 px-5 py-3.5 text-center">
      <div className="font-syne font-bold text-lg text-accent">{value}</div>
      <div className="text-[9px] text-muted tracking-widest uppercase mt-0.5">{label}</div>
    </div>
  );
}

/**
 * OutputViewerMFE
 * Props:
 *   platform {string} - currently selected platform id
 *
 * Reads script result + status from the shared Redux store.
 */
export default function OutputViewer({ platform }) {
  const dispatch   = useDispatch();
  const result     = useSelector(selectResult);
  const status     = useSelector(selectStatus);
  const activeTab  = useSelector(selectActiveTab);
  const [copied, setCopied]   = useState(false);
  const loading = status === 'loading';

  const p = PLATFORMS.find((x) => x.id === platform) || PLATFORMS[0];

  const getTabContent = () => {
    if (!result) return '';
    if (activeTab === 'script')   return result.full || '';
    if (activeTab === 'hooks')    return result.hooks?.join('\n\n') || '';
    if (activeTab === 'hashtags') return result.hashtags?.join(' ') || '';
    if (activeTab === 'brief')    return result.brief || '';
    return '';
  };

  const handleCopy = () => {
    const text = getTabContent();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExport = () => {
    if (!result?.full) return;
    const blob = new Blob([result.full], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'script.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const wordCount = result?.full ? result.full.split(/\s+/).filter(Boolean).length : 0;
  const charCount = result?.full?.length || 0;
  const readTime  = wordCount ? Math.ceil(wordCount / 130) : 0;
  const sections  = result?.full ? (result.full.match(/\n\n/g)?.length || 0) + 1 : 0;

  return (
    <div className="mx-8 mb-8 border border-white/7 rounded-xl bg-surface overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/7 bg-surface2">
        <div className="font-syne font-bold text-sm">
          <span style={{ color: p.color }}>{p.icon}</span>
          &nbsp;Generated Script
        </div>
        {result && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`px-2.5 py-1 text-[11px] rounded border font-mono transition-all duration-200
                ${copied
                  ? 'text-accent border-accent bg-accent/10'
                  : 'text-muted border-white/7 bg-white/4 hover:text-text hover:border-white/15'
                }`}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button
              onClick={handleExport}
              className="px-2.5 py-1 text-[11px] rounded border font-mono text-muted border-white/7 bg-white/4 hover:text-text hover:border-white/15 transition-all duration-200"
            >
              ↓ Export
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {result && (
        <div className="flex border-b border-white/7">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setActiveTab(tab))}
              className={`px-4 py-2.5 text-[11px] font-mono border-b-2 transition-all duration-200 cursor-pointer
                ${activeTab === tab
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-text'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      {loading ? (
        <SkeletonLoader />
      ) : !result ? (
        <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 text-muted">
          <p className="text-xs font-mono">Configure your script above and hit Generate</p>
        </div>
      ) : (
        <div className="p-6">
          {activeTab === 'script' && (
            <p className="font-serif text-[15px] leading-relaxed text-text whitespace-pre-wrap">
              {result.full}
              <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
            </p>
          )}
          {activeTab === 'hooks' && (
            <div className="font-mono text-xs leading-relaxed space-y-5">
              {result.hooks?.map((hook, i) => (
                <div key={i}>
                  <p className="text-[10px] text-accent mb-1.5 tracking-widest uppercase">Hook {i + 1}</p>
                  <p className="text-text">{hook}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'hashtags' && (
            <div className="flex flex-wrap gap-2">
              {result.hashtags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-[11px] font-mono text-accent
                             bg-accent/8 border border-accent/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {activeTab === 'brief' && (
            <div className="font-mono text-xs leading-relaxed">
              <p className="text-[10px] text-accent mb-2 tracking-widest uppercase">Content Brief</p>
              <p className="text-text">{result.brief}</p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {result && (
        <div
          className="grid border-t border-white/7"
          style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.07)' }}
        >
          <StatCell value={wordCount.toLocaleString()} label="Words" />
          <StatCell value={charCount.toLocaleString()} label="Characters" />
          <StatCell value={`${readTime}m`} label="Read Time" />
          <StatCell value={sections} label="Sections" />
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
      `}</style>
    </div>
  );
}
