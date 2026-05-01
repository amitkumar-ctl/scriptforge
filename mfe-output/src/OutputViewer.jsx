import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './styles.css';

const selectResult = (s) => s.script.result;
const selectStatus = (s) => s.script.status;
const selectActiveTab = (s) => s.script.activeTab;
const selectScriptId = (s) => s.script.scriptId;
const selectDirectorsCut = (s) => s.directors?.result;
const selectDirectorsStatus = (s) => s.directors?.status;
const setActiveTab = (tab) => ({ type: 'script/setActiveTab', payload: tab });

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
    const label = parts[i];
    const content = (parts[i + 1] || '').trim();
    if (content) sections.push({ label, content });
  }

  if (!sections.length) {
    return (
      <p className="font-serif text-base leading-relaxed text-text whitespace-pre-wrap m-0">
        {normalised}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
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
            <div
              className="rounded-xl overflow-hidden border"
              style={{
                borderColor: style ? style.color + '40' : 'rgba(255,255,255,0.07)',
                background: style ? style.color + '08' : 'transparent',
              }}
            >
              {style && (
                <div
                  className="px-3.5 py-1.5 flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase border-b"
                  style={{ color: style.color, borderColor: style.color + '30' }}
                >
                  <span>{style.emoji}</span>
                  <span>{style.label}</span>
                </div>
              )}
              <p className="px-4 py-3.5 font-serif text-base leading-relaxed text-text m-0 whitespace-pre-wrap">
                {section.content}
              </p>
            </div>

            {/* Inline director's cut card */}
            {directorsCut && (scene || keyMoment || musicCue) && (
              <div className="mt-1.5 rounded-lg border border-accent/15 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(99,220,163,0.04), rgba(79,163,224,0.04))' }}
              >
                <div className="px-3.5 py-1.5 flex items-center gap-1.5 border-b border-white/5 bg-black/20">
                  <span className="text-[10px]">🎬</span>
                  <span className="text-[9px] font-mono text-accent tracking-[0.15em] uppercase">Director's Cut</span>
                </div>
                <div className="px-3.5 py-2.5 flex flex-col gap-2">
                  {keyMoment?.direction && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-sm shrink-0 mt-0.5">🎭</span>
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: '#e040fb' }}>Acting</div>
                        <span className="text-xs leading-relaxed text-[#c8d0e0]">{keyMoment.direction}</span>
                      </div>
                    </div>
                  )}
                  {scene?.camera && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-sm shrink-0 mt-0.5">📷</span>
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: '#4fa3e0' }}>Camera</div>
                        <span className="text-xs leading-relaxed text-[#c8d0e0]">{scene.camera}</span>
                      </div>
                    </div>
                  )}
                  {scene?.energy && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-sm shrink-0 mt-0.5">⚡</span>
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5 text-accent">Energy</div>
                        <span className="text-xs leading-relaxed text-[#c8d0e0]">{scene.energy}</span>
                      </div>
                    </div>
                  )}
                  {musicCue?.direction && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-sm shrink-0 mt-0.5">🎵</span>
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: '#f0a04b' }}>Music</div>
                        <span className="text-xs leading-relaxed text-[#c8d0e0]">{musicCue.direction}</span>
                      </div>
                    </div>
                  )}
                  {scene?.bRoll && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-sm shrink-0 mt-0.5">🎞️</span>
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: '#ff4545' }}>B-Roll</div>
                        <span className="text-xs leading-relaxed text-[#c8d0e0]">{scene.bRoll}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Overall production notes */}
      {directorsCut && (directorsCut.music?.overallMood || directorsCut.visual?.colorGrade || directorsCut.editing?.cutStyle) && (
        <div className="rounded-xl border border-white/7 p-4" style={{ background: '#0a0c12' }}>
          <div className="text-[9px] font-mono text-muted tracking-[0.15em] uppercase mb-3">🎬 Overall Production Notes</div>
          <div className="grid grid-cols-2 gap-3">
            {directorsCut.music?.overallMood && (
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: '#f0a04b' }}>🎵 Music Mood</div>
                <p className="m-0 text-xs text-[#c8d0e0] leading-relaxed">
                  {directorsCut.music.overallMood}{directorsCut.music.bpm && ` · ${directorsCut.music.bpm}`}
                </p>
              </div>
            )}
            {directorsCut.visual?.colorGrade && (
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: '#e040fb' }}>🎨 Color Grade</div>
                <p className="m-0 text-xs text-[#c8d0e0] leading-relaxed">{directorsCut.visual.colorGrade}</p>
              </div>
            )}
            {directorsCut.editing?.cutStyle && (
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: '#4fa3e0' }}>✂️ Edit Style</div>
                <p className="m-0 text-xs text-[#c8d0e0] leading-relaxed">{directorsCut.editing.cutStyle}</p>
              </div>
            )}
            {directorsCut.visual?.thumbnail && (
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: '#ff4545' }}>🖼️ Thumbnail</div>
                <p className="m-0 text-xs text-[#c8d0e0] leading-relaxed">{directorsCut.visual.thumbnail}</p>
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
    <div className="p-6 flex flex-col gap-3">
      {[100, 85, 100, 60, 100, 75, 100, 45].map((w, i) => (
        <div
          key={i}
          className="h-3.5 rounded animate-pulse bg-surface2"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

function StatCell({ value, label }) {
  return (
    <div className="bg-surface2 py-3 px-5 text-center">
      <div className="font-syne font-bold text-lg text-accent">{value}</div>
      <div className="text-[9px] text-muted tracking-widest uppercase mt-0.5">{label}</div>
    </div>
  );
}

function DirectorsCutRenderer({ data }) {
  if (!data) return null;

  const Section = ({ color, title, children }) => (
    <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor: color + '30', background: color + '08' }}>
      <div className="px-3.5 py-1.5 flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase border-b"
        style={{ color, borderColor: color + '20' }}>
        {title}
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed text-text">
        {children}
      </div>
    </div>
  );

  const Label = ({ children }) => (
    <div className="text-[9px] text-muted uppercase tracking-widest mb-1 mt-3">{children}</div>
  );

  return (
    <div>
      {data.performance && (
        <Section color="#63dca3" title="🎭 Performance Guide">
          <Label>Character</Label>
          <p className="m-0 mb-2 text-xs">{data.performance.character}</p>
          <Label>Energy Arc</Label>
          <p className="m-0 mb-2 text-xs">{data.performance.energyArc}</p>
          {data.performance.keyMoments?.length > 0 && (
            <>
              <Label>Key Moments</Label>
              {data.performance.keyMoments.map((m, i) => (
                <div key={i} className="px-3 py-2 rounded-md mb-1.5 border"
                  style={{ background: 'rgba(99,220,163,0.05)', borderColor: 'rgba(99,220,163,0.1)' }}>
                  <span className="text-[10px] text-accent uppercase tracking-widest">{m.section}</span>
                  <p className="m-0 mt-1 text-xs">{m.direction}</p>
                </div>
              ))}
            </>
          )}
        </Section>
      )}

      {data.scenes?.length > 0 && (
        <Section color="#4fa3e0" title="🎬 Scene-by-Scene Breakdown">
          {data.scenes.map((scene, i) => (
            <div key={i} className={`pb-4 mb-4 ${i < data.scenes.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#4fa3e0' }}>{scene.section}</div>
              {[
                { label: '🎭 Acting', value: scene.acting },
                { label: '📷 Camera', value: scene.camera },
                { label: '⚡ Energy', value: scene.energy },
                { label: '🎞️ B-Roll', value: scene.bRoll },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex gap-2 mb-1.5">
                  <span className="text-xs text-muted min-w-[80px] shrink-0">{label}</span>
                  <span className="text-xs text-text">{value}</span>
                </div>
              ))}
            </div>
          ))}
        </Section>
      )}

      {data.music && (
        <Section color="#f0a04b" title="🎵 Music Direction">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <Label>Mood / Genre</Label>
              <p className="m-0 text-xs">{data.music.overallMood}</p>
            </div>
            <div>
              <Label>BPM Range</Label>
              <p className="m-0 text-xs">{data.music.bpm}</p>
            </div>
          </div>
          {data.music.cues?.length > 0 && (
            <>
              <Label>Music Cues</Label>
              {data.music.cues.map((cue, i) => (
                <div key={i} className="px-3 py-2 rounded-md mb-1.5 border"
                  style={{ background: 'rgba(240,160,75,0.05)', borderColor: 'rgba(240,160,75,0.1)' }}>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: '#f0a04b' }}>{cue.moment}</span>
                  <p className="m-0 mt-1 text-xs">{cue.direction}</p>
                </div>
              ))}
            </>
          )}
        </Section>
      )}

      {data.editing && (
        <Section color="#e040fb" title="✂️ Editing Guide">
          {[
            { label: 'Cut Style', value: data.editing.cutStyle },
            { label: 'Transitions', value: data.editing.transitions },
            { label: 'Text Overlays', value: data.editing.textOverlays },
            { label: 'Pacing', value: data.editing.pacing },
          ].map(({ label, value }) => value && (
            <div key={label} className="mb-2.5">
              <Label>{label}</Label>
              <p className="m-0 text-xs">{value}</p>
            </div>
          ))}
        </Section>
      )}

      {data.visual && (
        <Section color="#ff4545" title="🎨 Visual Style">
          {[
            { label: 'Color Grade', value: data.visual.colorGrade },
            { label: 'Caption Style', value: data.visual.captionStyle },
            { label: 'Animation Style', value: data.visual.animationStyle },
            { label: '🖼️ Thumbnail', value: data.visual.thumbnail },
          ].map(({ label, value }) => value && (
            <div key={label} className="mb-2.5">
              <Label>{label}</Label>
              <p className="m-0 text-xs">{value}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

export default function OutputViewer({ platform, authFetch, config,isPro, onUpgrade }) {
  const dispatch = useDispatch();
  const result = useSelector(selectResult);
  const status = useSelector(selectStatus);
  const activeTab = useSelector(selectActiveTab);
  const scriptId = useSelector(selectScriptId);       // ← inside component now
  const directorsCut = useSelector(selectDirectorsCut);
  const directorsStatus = useSelector(selectDirectorsStatus);
  const [copied, setCopied] = useState(false);

  const loading = status === 'loading';
  const directorsLoading = directorsStatus === 'loading';
  const p = PLATFORMS.find(x => x.id === platform) || PLATFORMS[0];
  const allTabs = result ? [...TABS, ...(directorsCut ? ['director'] : [])] : TABS;

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
      const data = res.data; // ✅ no await

      if (data.success) {
        const scriptHash = result.full.slice(0, 120).replace(/\s+/g, ' ').trim();
        dispatch({ type: 'directors/setResult', payload: { result: data.data, scriptHash } });

        if (scriptId) {
          authFetch(`/api/script/${scriptId}/directors-cut`, {
            method: 'PATCH',
            body: JSON.stringify({ directorsCut: data.data }),
          }).catch(err => console.error('[Directors] Failed to save to DB:', err));
        }

        dispatch(setActiveTab('director'));
      }
    } catch (err) {
      // Show upgrade modal if Pro required
      if (err.response?.data?.code === 'PRO_REQUIRED') {
       onUpgrade?.();
      }
      dispatch({ type: 'directors/setStatus', payload: 'failed' });
    }
  };

  const wordCount = result?.full ? result.full.split(/\s+/).filter(Boolean).length : 0;
  const charCount = result?.full?.length || 0;
  const readTime = wordCount ? Math.ceil(wordCount / 130) : 0;
  const sections = result?.full ? (result.full.match(/\[[A-Z ]+\]/g) || []).length : 0;

  return (
    <div className="mx-8 mb-8 border border-white/7 rounded-xl bg-surface overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/7 bg-surface2">
        <div className="font-syne font-bold text-sm">
          <span style={{ color: p.color }}>{p.icon}</span>
          <span className="ml-1">Generated Script</span>
        </div>
        {result && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-[11px] font-mono cursor-pointer rounded border transition-all"
              style={{
                borderColor: copied ? '#63dca3' : 'rgba(255,255,255,0.07)',
                background: copied ? 'rgba(99,220,163,0.1)' : 'rgba(255,255,255,0.04)',
                color: copied ? '#63dca3' : '#a8b0c0',
              }}
            >{copied ? '✓ Copied' : '⎘ Copy'}</button>
            {/* Export — Pro only */}
            <button
              onClick={isPro
                ? handleExport
                : () => onUpgrade?.()
              }
              className="px-2.5 py-1 text-[11px] font-mono cursor-pointer rounded border transition-all"
              style={{
                borderColor: isPro ? 'rgba(255,255,255,0.07)' : 'rgba(240,160,75,0.3)',
                background: isPro ? 'rgba(255,255,255,0.04)' : 'rgba(240,160,75,0.06)',
                color: isPro ? '#a8b0c0' : '#f0a04b',
              }}
            >{isPro ? '↓ Export' : '↑ Pro: Export'}</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {result && (
        <div className="flex border-b border-white/7 overflow-x-auto">
          {allTabs.map(tab => (
            <button
              key={tab}
              onClick={() => dispatch(setActiveTab(tab))}
              className="px-4 py-2.5 text-[11px] font-mono cursor-pointer bg-transparent border-none whitespace-nowrap transition-colors"
              style={{
                borderBottom: `2px solid ${activeTab === tab ? '#63dca3' : 'transparent'}`,
                color: activeTab === tab ? '#63dca3' : '#a8b0c0',
              }}
            >
              {tab === 'director' ? "🎬 Director's Cut" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Director's Cut CTA */}
      {result && !directorsCut && !directorsLoading && (
        <div className="px-6 py-4 border-t border-white/7 flex items-center justify-between gap-4"
          style={{ background: '#0a0c12' }}>
          <div>
            <p className="m-0 text-xs font-syne font-bold text-text">🎬 Want a Director's Cut?</p>
            <p className="m-0 mt-0.5 text-[11px] font-mono text-muted">
              {isPro
                ? 'Get acting directions, music cues, camera angles & editing guide'
                : '✦ Pro feature — upgrade to unlock Director\'s Cut'}
            </p>
          </div>
          <button
            onClick={isPro ? handleDirectorsCut : () => onUpgrade?.()}
            disabled={directorsLoading}
            className="px-4 py-2 text-[11px] font-mono cursor-pointer rounded-lg border shrink-0 transition-all hover:bg-accent/15"
            style={{
              borderColor: isPro ? 'rgba(99,220,163,0.4)' : 'rgba(240,160,75,0.4)',
              background: isPro ? 'rgba(99,220,163,0.08)' : 'rgba(240,160,75,0.08)',
              color: isPro ? '#63dca3' : '#f0a04b',
            }}
          >
            {isPro ? '✦ Generate Director\'s Cut' : '↑ Upgrade to Pro'}
          </button>
        </div>
      )}

      {/* Body */}
      {loading ? <SkeletonLoader /> : !result ? (
        <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 text-muted">
          <span className="text-4xl opacity-30">✦</span>
          <p className="text-xs font-mono">Configure your script above and hit Generate</p>
        </div>
      ) : (
        <div className="p-6">
          {activeTab === 'script' && <ScriptRenderer text={result.full} directorsCut={directorsCut} />}
          {activeTab === 'hooks' && (
            <div className="flex flex-col gap-4">
              {(result.hooks || []).map((hook, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/7 bg-white/2">
                  <div className="text-[10px] text-accent font-mono tracking-widest uppercase mb-2">Hook {i + 1}</div>
                  <p className="font-serif text-sm leading-relaxed text-text m-0">{hook}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'hashtags' && (
            <div className="flex flex-wrap gap-2">
              {(result.hashtags || []).map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-mono text-accent border"
                  style={{ background: 'rgba(99,220,163,0.08)', borderColor: 'rgba(99,220,163,0.2)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {activeTab === 'brief' && (
            <div>
              <div className="text-[10px] text-accent font-mono tracking-widest uppercase mb-3">Content Brief</div>
              <p className="font-serif text-sm leading-relaxed text-text m-0">{result.brief}</p>
            </div>
          )}
          {activeTab === 'director' && (
            directorsLoading ? <SkeletonLoader /> : <DirectorsCutRenderer data={directorsCut} />
          )}
        </div>
      )}

      {/* Stats */}
      {result && (
        <div className="grid grid-cols-4 gap-px border-t border-white/7 bg-white/7">
          <StatCell value={wordCount.toLocaleString()} label="Words" />
          <StatCell value={charCount.toLocaleString()} label="Characters" />
          <StatCell value={`${readTime}m`} label="Read Time" />
          <StatCell value={sections} label="Sections" />
        </div>
      )}
    </div>
  );
}