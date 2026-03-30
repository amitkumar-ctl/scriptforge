import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './styles.css';

const selectResult = (s) => s.script.result;
const selectStatus = (s) => s.script.status;
const selectActiveTab = (s) => s.script.activeTab;
const selectDirectorsCut = (s) => s.directors?.result;
const selectDirectorsStatus = (s) => s.directors?.status;
const setActiveTab = (tab) => ({ type: 'script/setActiveTab', payload: tab });
const generateDirectorsCut = (payload) => ({ type: 'directors/generate', payload });

const PLATFORMS = [
  { id: 'youtube', icon: '▶', color: '#ff4545' },
  { id: 'instagram', icon: '◈', color: '#e040fb' },
  { id: 'tiktok', icon: '♪', color: '#00f5d4' },
  { id: 'linkedin', icon: '⬡', color: '#4fa3e0' },
  { id: 'podcast', icon: '⊚', color: '#f0a04b' },
  { id: 'twitter', icon: '✕', color: '#5bc8e0' },
  { id: 'custom', icon: '⊕', color: '#aaa' },
];

const TABS = ['script', 'hooks', 'hashtags', 'brief'];

const SECTION_STYLES = {
  'HOOK': { color: '#ff4545', emoji: '🪝', label: 'Hook' },
  'INTRO': { color: '#63dca3', emoji: '👋', label: 'Intro' },
  'MAIN CONTENT': { color: '#4fa3e0', emoji: '📖', label: 'Main Content' },
  'CTA': { color: '#f0a04b', emoji: '🎯', label: 'Call to Action' },
  'OUTRO': { color: '#e040fb', emoji: '🎬', label: 'Outro' },
};

function ScriptRenderer({ text, directorsCut }) {
  if (!text) return null;
  const normalised = text.replace(/\\n/g, '\n');
  const parts = normalised.split(/\[([A-Z ]+)\]/g);
  const sections = [];
  if (parts[0].trim()) sections.push({ label: null, content: parts[0].trim() });
  for (let i = 1; i < parts.length; i += 2) {
    const label   = parts[i];
    const content = (parts[i + 1] || '').trim();
    if (content) sections.push({ label, content });
  }

  if (!sections.length) {
    return (
      <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 15, lineHeight: 1.85, color: '#eef0f6', whiteSpace: 'pre-wrap', margin: 0 }}>
        {normalised}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sections.map((section, i) => {
        const style = section.label
          ? (SECTION_STYLES[section.label] || { color: '#a8b0c0', emoji: '•', label: section.label })
          : null;

        const scene = directorsCut?.scenes?.find(
          s => section.label && s.section?.toUpperCase().includes(section.label.toUpperCase())
        );
        const keyMoment = directorsCut?.performance?.keyMoments?.find(
          m => section.label && m.section?.toUpperCase().includes(section.label.toUpperCase())
        );
        const musicCue = directorsCut?.music?.cues?.find(
          c => section.label && c.moment?.toUpperCase().includes(section.label.toUpperCase())
        );

        return (
          <div key={i}>
            {/* Script section */}
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${style ? style.color + '40' : 'rgba(255,255,255,0.07)'}`, background: style ? `${style.color}08` : 'transparent' }}>
              {style && (
                <div style={{ padding: '5px 14px', borderBottom: `1px solid ${style.color}30`, fontSize: 10, fontFamily: '"DM Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: style.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{style.emoji}</span><span>{style.label}</span>
                </div>
              )}
              <p style={{ padding: '14px 16px', fontFamily: '"Instrument Serif", serif', fontSize: 15, lineHeight: 1.85, color: '#eef0f6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {section.content}
              </p>
            </div>

            {/* Inline director's cut card — only shown if directors cut exists */}
            {directorsCut && (scene || keyMoment || musicCue) && (
              <div style={{
                marginTop: 6,
                borderRadius: 8,
                border: '1px solid rgba(99,220,163,0.15)',
                background: 'linear-gradient(135deg, rgba(99,220,163,0.04), rgba(79,163,224,0.04))',
                overflow: 'hidden',
              }}>
                {/* Card header */}
                <div style={{ padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: 10 }}>🎬</span>
                  <span style={{ fontSize: 9, fontFamily: '"DM Mono", monospace', color: '#63dca3', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Director's Cut</span>
                </div>

                <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Acting note from keyMoments */}
                  {keyMoment?.direction && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🎭</span>
                      <div>
                        <div style={{ fontSize: 9, color: '#e040fb', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Acting</div>
                        <span style={{ fontSize: 12, color: '#c8d0e0', lineHeight: 1.6 }}>{keyMoment.direction}</span>
                      </div>
                    </div>
                  )}

                  {/* Camera */}
                  {scene?.camera && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>📷</span>
                      <div>
                        <div style={{ fontSize: 9, color: '#4fa3e0', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Camera</div>
                        <span style={{ fontSize: 12, color: '#c8d0e0', lineHeight: 1.6 }}>{scene.camera}</span>
                      </div>
                    </div>
                  )}

                  {/* Energy */}
                  {scene?.energy && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚡</span>
                      <div>
                        <div style={{ fontSize: 9, color: '#63dca3', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Energy</div>
                        <span style={{ fontSize: 12, color: '#c8d0e0', lineHeight: 1.6 }}>{scene.energy}</span>
                      </div>
                    </div>
                  )}

                  {/* Music cue */}
                  {musicCue?.direction && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🎵</span>
                      <div>
                        <div style={{ fontSize: 9, color: '#f0a04b', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Music</div>
                        <span style={{ fontSize: 12, color: '#c8d0e0', lineHeight: 1.6 }}>{musicCue.direction}</span>
                      </div>
                    </div>
                  )}

                  {/* B-Roll */}
                  {scene?.bRoll && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🎞️</span>
                      <div>
                        <div style={{ fontSize: 9, color: '#ff4545', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>B-Roll</div>
                        <span style={{ fontSize: 12, color: '#c8d0e0', lineHeight: 1.6 }}>{scene.bRoll}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Overall music + visual bar at the bottom */}
      {directorsCut && (directorsCut.music?.overallMood || directorsCut.visual?.colorGrade || directorsCut.editing?.cutStyle) && (
        <div style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0c12', padding: '14px 16px' }}>
          <div style={{ fontSize: 9, fontFamily: '"DM Mono", monospace', color: '#a8b0c0', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>🎬 Overall Production Notes</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {directorsCut.music?.overallMood && (
              <div>
                <div style={{ fontSize: 9, color: '#f0a04b', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>🎵 Music Mood</div>
                <p style={{ margin: 0, fontSize: 12, color: '#c8d0e0', lineHeight: 1.5 }}>{directorsCut.music.overallMood} {directorsCut.music.bpm && `· ${directorsCut.music.bpm}`}</p>
              </div>
            )}
            {directorsCut.visual?.colorGrade && (
              <div>
                <div style={{ fontSize: 9, color: '#e040fb', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>🎨 Color Grade</div>
                <p style={{ margin: 0, fontSize: 12, color: '#c8d0e0', lineHeight: 1.5 }}>{directorsCut.visual.colorGrade}</p>
              </div>
            )}
            {directorsCut.editing?.cutStyle && (
              <div>
                <div style={{ fontSize: 9, color: '#4fa3e0', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>✂️ Edit Style</div>
                <p style={{ margin: 0, fontSize: 12, color: '#c8d0e0', lineHeight: 1.5 }}>{directorsCut.editing.cutStyle}</p>
              </div>
            )}
            {directorsCut.visual?.thumbnail && (
              <div>
                <div style={{ fontSize: 9, color: '#ff4545', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>🖼️ Thumbnail</div>
                <p style={{ margin: 0, fontSize: 12, color: '#c8d0e0', lineHeight: 1.5 }}>{directorsCut.visual.thumbnail}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[100, 85, 100, 60, 100, 75, 100, 45].map((w, i) => (
        <div key={i} style={{ height: 14, borderRadius: 4, width: `${w}%`, background: 'linear-gradient(90deg, #141720 25%, rgba(255,255,255,0.07) 50%, #141720 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.5s ${i * 0.08}s ease-in-out infinite` }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }`}</style>
    </div>
  );
}

function StatCell({ value, label }) {
  return (
    <div style={{ background: '#141720', padding: '12px 20px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#63dca3' }}>{value}</div>
      <div style={{ fontSize: 9, color: '#a8b0c0', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Director's Cut renderer ───────────────────────────────────────────
function DirectorsCutRenderer({ data }) {
  if (!data) return null;

  const sectionStyle = (color) => ({
    borderRadius: 10,
    border: `1px solid ${color}30`,
    background: `${color}08`,
    overflow: 'hidden',
    marginBottom: 16,
  });

  const headerStyle = (color) => ({
    padding: '6px 14px',
    borderBottom: `1px solid ${color}20`,
    fontSize: 10,
    fontFamily: '"DM Mono", monospace',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  });

  const bodyStyle = {
    padding: '14px 16px',
    fontSize: 13,
    fontFamily: '"DM Mono", monospace',
    lineHeight: 1.7,
    color: '#eef0f6',
  };

  const labelStyle = {
    fontSize: 9,
    color: '#a8b0c0',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 4,
    marginTop: 12,
  };

  return (
    <div>
      {/* Performance */}
      {data.performance && (
        <div style={sectionStyle('#63dca3')}>
          <div style={headerStyle('#63dca3')}>🎭 Performance Guide</div>
          <div style={bodyStyle}>
            <div style={labelStyle}>Character</div>
            <p style={{ margin: '0 0 8px' }}>{data.performance.character}</p>
            <div style={labelStyle}>Energy Arc</div>
            <p style={{ margin: '0 0 8px' }}>{data.performance.energyArc}</p>
            {data.performance.keyMoments?.length > 0 && (
              <>
                <div style={labelStyle}>Key Moments</div>
                {data.performance.keyMoments.map((m, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(99,220,163,0.05)', border: '1px solid rgba(99,220,163,0.1)', marginBottom: 6 }}>
                    <span style={{ color: '#63dca3', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.section}</span>
                    <p style={{ margin: '4px 0 0', fontSize: 12 }}>{m.direction}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Scenes */}
      {data.scenes?.length > 0 && (
        <div style={sectionStyle('#4fa3e0')}>
          <div style={headerStyle('#4fa3e0')}>🎬 Scene-by-Scene Breakdown</div>
          <div style={bodyStyle}>
            {data.scenes.map((scene, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < data.scenes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ fontSize: 11, color: '#4fa3e0', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{scene.section}</div>
                {[
                  { label: '🎭 Acting', value: scene.acting },
                  { label: '📷 Camera', value: scene.camera },
                  { label: '⚡ Energy', value: scene.energy },
                  { label: '🎞️ B-Roll', value: scene.bRoll },
                ].map(({ label, value }) => value && (
                  <div key={label} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#a8b0c0', minWidth: 80, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12, color: '#eef0f6' }}>{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Music */}
      {data.music && (
        <div style={sectionStyle('#f0a04b')}>
          <div style={headerStyle('#f0a04b')}>🎵 Music Direction</div>
          <div style={bodyStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={labelStyle}>Mood / Genre</div>
                <p style={{ margin: 0, fontSize: 12 }}>{data.music.overallMood}</p>
              </div>
              <div>
                <div style={labelStyle}>BPM Range</div>
                <p style={{ margin: 0, fontSize: 12 }}>{data.music.bpm}</p>
              </div>
            </div>
            {data.music.cues?.length > 0 && (
              <>
                <div style={labelStyle}>Music Cues</div>
                {data.music.cues.map((cue, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(240,160,75,0.05)', border: '1px solid rgba(240,160,75,0.1)', marginBottom: 6 }}>
                    <span style={{ color: '#f0a04b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cue.moment}</span>
                    <p style={{ margin: '4px 0 0', fontSize: 12 }}>{cue.direction}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Editing */}
      {data.editing && (
        <div style={sectionStyle('#e040fb')}>
          <div style={headerStyle('#e040fb')}>✂️ Editing Guide</div>
          <div style={bodyStyle}>
            {[
              { label: 'Cut Style', value: data.editing.cutStyle },
              { label: 'Transitions', value: data.editing.transitions },
              { label: 'Text Overlays', value: data.editing.textOverlays },
              { label: 'Pacing', value: data.editing.pacing },
            ].map(({ label, value }) => value && (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={labelStyle}>{label}</div>
                <p style={{ margin: 0, fontSize: 12 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual */}
      {data.visual && (
        <div style={sectionStyle('#ff4545')}>
          <div style={headerStyle('#ff4545')}>🎨 Visual Style</div>
          <div style={bodyStyle}>
            {[
              { label: 'Color Grade', value: data.visual.colorGrade },
              { label: 'Caption Style', value: data.visual.captionStyle },
              { label: 'Animation Style', value: data.visual.animationStyle },
              { label: '🖼️ Thumbnail', value: data.visual.thumbnail },
            ].map(({ label, value }) => value && (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={labelStyle}>{label}</div>
                <p style={{ margin: 0, fontSize: 12 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutputViewer({ platform, authFetch, config }) {
  const dispatch = useDispatch();
  const result = useSelector(selectResult);
  const status = useSelector(selectStatus);
  const activeTab = useSelector(selectActiveTab);
  const directorsCut = useSelector(selectDirectorsCut);
  const directorsStatus = useSelector(selectDirectorsStatus);
  const [copied, setCopied] = useState(false);
  const loading = status === 'loading';
  const directorsLoading = directorsStatus === 'loading';

  const p = PLATFORMS.find(x => x.id === platform) || PLATFORMS[0];

  const allTabs = result
    ? [...TABS, ...(directorsCut ? ['director'] : [])]
    : TABS;

  const getTabContent = () => {
    if (!result) return '';
    if (activeTab === 'script') return result.full || '';
    if (activeTab === 'hooks') return (result.hooks || []).join('\n\n');
    if (activeTab === 'hashtags') return (result.hashtags || []).join(' ');
    if (activeTab === 'brief') return result.brief || '';
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

 const handleDirectorsCut = async () => {
  if (!result?.full || !authFetch) return;
  dispatch({ type: 'directors/setStatus', payload: 'loading' });
  try {
    const res = await authFetch('/api/script/directors-cut', {
      method: 'POST',
      body: JSON.stringify({ platform, config, script: result.full }),
    });
    const data = await res.json();
    if (data.success) {
      dispatch({
        type: 'directors/setResult',
        payload: {
          result:     data.data,
          scriptHash: result.full.slice(0, 120).replace(/\s+/g, ' ').trim(),
        },
      });
      dispatch(setActiveTab('director'));
    }
  } catch (err) {
    dispatch({ type: 'directors/setStatus', payload: 'failed' });
  }
};

  const wordCount = result?.full ? result.full.split(/\s+/).filter(Boolean).length : 0;
  const charCount = result?.full?.length || 0;
  const readTime = wordCount ? Math.ceil(wordCount / 130) : 0;
  const sections = result?.full ? (result.full.match(/\[[A-Z ]+\]/g) || []).length : 0;

  return (
    <div style={{ margin: '0 32px 32px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, background: '#0e1118', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#141720' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
          <span style={{ color: p.color }}>{p.icon}</span>&nbsp;Generated Script
        </div>
        {result && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCopy} style={{ padding: '4px 10px', fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer', borderRadius: 5, border: `1px solid ${copied ? '#63dca3' : 'rgba(255,255,255,0.07)'}`, background: copied ? 'rgba(99,220,163,0.1)' : 'rgba(255,255,255,0.04)', color: copied ? '#63dca3' : '#a8b0c0' }}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button onClick={handleExport} style={{ padding: '4px 10px', fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer', borderRadius: 5, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)', color: '#a8b0c0' }}>
              ↓ Export
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {result && (
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto' }}>
          {allTabs.map(tab => (
            <button key={tab} onClick={() => dispatch(setActiveTab(tab))} style={{ padding: '10px 18px', fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#63dca3' : 'transparent'}`, color: activeTab === tab ? '#63dca3' : '#a8b0c0', whiteSpace: 'nowrap' }}>
              {tab === 'director' ? '🎬 Director\'s Cut' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      {loading ? <SkeletonLoader /> : !result ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, gap: 12, color: '#a8b0c0' }}>
          <span style={{ fontSize: 40, opacity: 0.3 }}>✦</span>
          <p style={{ fontSize: 12, fontFamily: '"DM Mono", monospace' }}>Configure your script above and hit Generate</p>
        </div>
      ) : (
        <div style={{ padding: 24 }}>
          {activeTab === 'script' && <ScriptRenderer text={result.full} directorsCut={directorsCut} />}
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
          {activeTab === 'director' && (
            directorsLoading
              ? <SkeletonLoader />
              : <DirectorsCutRenderer data={directorsCut} />
          )}
        </div>
      )}

      {/* Director's Cut CTA — shown after script generated, before directors cut exists */}
      {result && !directorsCut && !directorsLoading && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0a0c12', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#eef0f6' }}>🎬 Want a Director's Cut?</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, fontFamily: '"DM Mono", monospace', color: '#a8b0c0' }}>Get acting directions, music cues, camera angles & editing guide</p>
          </div>
          <button
            onClick={handleDirectorsCut}
            disabled={directorsLoading}
            style={{ padding: '8px 16px', fontSize: 11, fontFamily: '"DM Mono", monospace', cursor: 'pointer', borderRadius: 8, border: '1px solid rgba(99,220,163,0.4)', background: 'rgba(99,220,163,0.08)', color: '#63dca3', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            ✦ Generate Director's Cut
          </button>
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