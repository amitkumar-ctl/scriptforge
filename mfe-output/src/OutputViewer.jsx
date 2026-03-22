import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './styles.css';

const selectResult    = (s) => s.script.result;
const selectStatus    = (s) => s.script.status;
const selectActiveTab = (s) => s.script.activeTab;
const setActiveTab    = (tab) => ({ type: 'script/setActiveTab', payload: tab });

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

// ── Section styling ───────────────────────────────────────────────────
const SECTION_STYLES = {
  'HOOK':         { color: '#ff4545', emoji: '🪝', label: 'Hook' },
  'INTRO':        { color: '#63dca3', emoji: '👋', label: 'Intro' },
  'MAIN CONTENT': { color: '#4fa3e0', emoji: '📖', label: 'Main Content' },
  'CTA':          { color: '#f0a04b', emoji: '🎯', label: 'Call to Action' },
  'OUTRO':        { color: '#e040fb', emoji: '🎬', label: 'Outro' },
};

// ── Script renderer — splits on [SECTION] markers ────────────────────
function ScriptRenderer({ text }) {
  if (!text) return null;

  // Normalise escaped newlines just in case
  const normalised = text.replace(/\\n/g, '\n');

  // Split by [SECTION NAME] tags
  const parts = normalised.split(/\[([A-Z ]+)\]/g);
  // parts = ['pre-text', 'HOOK', 'hook content', 'INTRO', 'intro content', ...]

  const sections = [];

  // First element is any text before the first tag (usually empty)
  if (parts[0].trim()) {
    sections.push({ label: null, content: parts[0].trim() });
  }

  // Rest come in pairs: label, content
  for (let i = 1; i < parts.length; i += 2) {
    const label   = parts[i];
    const content = (parts[i + 1] || '').trim();
    if (content) sections.push({ label, content });
  }

  if (!sections.length) {
    // No section markers found — render as plain text
    return (
      <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 15, lineHeight: 1.85, color: '#eef0f6', whiteSpace: 'pre-wrap', margin: 0 }}>
        {normalised}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sections.map((section, i) => {
        const style = section.label ? (SECTION_STYLES[section.label] || { color: '#666e85', emoji: '•', label: section.label }) : null;
        return (
          <div
            key={i}
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              border: `1px solid ${style ? style.color + '40' : 'rgba(255,255,255,0.07)'}`,
              background: style ? `${style.color}10` : 'transparent',
            }}
          >
            {style && (
              <div style={{
                padding: '5px 14px',
                borderBottom: `1px solid ${style.color}30`,
                fontSize: 10,
                fontFamily: '"DM Mono", monospace',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: style.color,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span>{style.emoji}</span>
                <span>{style.label}</span>
              </div>
            )}
            <p style={{
              padding: '14px 16px',
              fontFamily: '"Instrument Serif", serif',
              fontSize: 15,
              lineHeight: 1.85,
              color: '#eef0f6',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {section.content}
            </p>
          </div>
        );
      })}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[100, 85, 100, 60, 100, 75, 100, 45].map((w, i) => (
        <div key={i} style={{
          height: 14, borderRadius: 4, width: `${w}%`,
          background: 'linear-gradient(90deg, #141720 25%, rgba(255,255,255,0.07) 50%, #141720 75%)',
          backgroundSize: '200% 100%',
          animation: `shimmer 1.5s ${i * 0.08}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }`}</style>
    </div>
  );
}

function StatCell({ value, label }) {
  return (
    <div style={{ background: '#141720', padding: '12px 20px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#63dca3' }}>{value}</div>
      <div style={{ fontSize: 9, color: '#666e85', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function OutputViewer({ platform }) {
  const dispatch  = useDispatch();
  const result    = useSelector(selectResult);
  const status    = useSelector(selectStatus);
  const activeTab = useSelector(selectActiveTab);
  const [copied, setCopied] = useState(false);
  const loading = status === 'loading';

  const p = PLATFORMS.find(x => x.id === platform) || PLATFORMS[0];

  const getTabContent = () => {
    if (!result) return '';
    if (activeTab === 'script')   return result.full || '';
    if (activeTab === 'hooks')    return (result.hooks || []).join('\n\n');
    if (activeTab === 'hashtags') return (result.hashtags || []).join(' ');
    if (activeTab === 'brief')    return result.brief || '';
    return '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getTabContent()).then(() => {
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
  const sections  = result?.full ? (result.full.match(/\[[A-Z ]+\]/g) || []).length : 0;

  return (
    <div style={{ margin: '0 32px 32px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, background: '#0e1118', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#141720' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
          <span style={{ color: p.color }}>{p.icon}</span>&nbsp;Generated Script
        </div>
        {result && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCopy} style={{ padding: '4px 10px', fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer', borderRadius: 5, border: `1px solid ${copied ? '#63dca3' : 'rgba(255,255,255,0.07)'}`, background: copied ? 'rgba(99,220,163,0.1)' : 'rgba(255,255,255,0.04)', color: copied ? '#63dca3' : '#666e85' }}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button onClick={handleExport} style={{ padding: '4px 10px', fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer', borderRadius: 5, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)', color: '#666e85' }}>
              ↓ Export
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {result && (
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => dispatch(setActiveTab(tab))} style={{ padding: '10px 18px', fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#63dca3' : 'transparent'}`, color: activeTab === tab ? '#63dca3' : '#666e85' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      {loading ? <SkeletonLoader /> : !result ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, gap: 12, color: '#666e85' }}>
          <span style={{ fontSize: 40, opacity: 0.3 }}>✦</span>
          <p style={{ fontSize: 12, fontFamily: '"DM Mono", monospace' }}>Configure your script above and hit Generate</p>
        </div>
      ) : (
        <div style={{ padding: 24 }}>
          {activeTab === 'script' && <ScriptRenderer text={result.full} />}

          {activeTab === 'hooks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(result.hooks || []).map((hook, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: 10, color: '#63dca3', fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Hook {i + 1}</div>
                  <p style={{ fontSize: 14, fontFamily: '"Instrument Serif", serif', lineHeight: 1.8, color: '#eef0f6', margin: 0 }}>{hook}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hashtags' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(result.hashtags || []).map((tag, i) => (
                <span key={i} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: '"DM Mono", monospace', color: '#63dca3', background: 'rgba(99,220,163,0.08)', border: '1px solid rgba(99,220,163,0.2)' }}>{tag}</span>
              ))}
            </div>
          )}

          {activeTab === 'brief' && (
            <div>
              <div style={{ fontSize: 10, color: '#63dca3', fontFamily: '"DM Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Content Brief</div>
              <p style={{ fontSize: 14, fontFamily: '"Instrument Serif", serif', lineHeight: 1.8, color: '#eef0f6', margin: 0 }}>{result.brief}</p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.07)' }}>
          <StatCell value={wordCount.toLocaleString()} label="Words" />
          <StatCell value={charCount.toLocaleString()} label="Characters" />
          <StatCell value={`${readTime}m`} label="Read Time" />
          <StatCell value={sections} label="Sections" />
        </div>
      )}
    </div>
  );
}