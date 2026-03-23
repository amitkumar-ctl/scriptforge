import React from 'react';
import './styles.css';

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',     icon: '▶', color: '#ff4545', rgb: '255,69,69' },
  { id: 'instagram', label: 'Instagram',   icon: '◈', color: '#e040fb', rgb: '224,64,251' },
  { id: 'tiktok',    label: 'TikTok',      icon: '♪', color: '#00f5d4', rgb: '0,245,212' },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '⬡', color: '#4fa3e0', rgb: '79,163,224' },
  { id: 'podcast',   label: 'Podcast',     icon: '⊚', color: '#f0a04b', rgb: '240,160,75' },
  { id: 'twitter',   label: 'X / Twitter', icon: '✕', color: '#5bc8e0', rgb: '91,200,224' },
  { id: 'custom',    label: 'Custom',      icon: '⊕', color: '#aaaaaa', rgb: '170,170,170' },
];

/**
 * PlatformSelectorMFE
 * Props:
 *   selected  {string}   - currently selected platform id
 *   onSelect  {function} - called with platform id when user clicks
 */
export default function PlatformSelector({ selected, onSelect }) {
  return (
    <div className="px-8 py-6">
      <p className="text-[9px] tracking-[0.12em] uppercase text-muted mb-3 font-mono">
        ① Select Platform
      </p>
      <div className="flex flex-wrap gap-2.5">
        {PLATFORMS.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-mono
                         transition-all duration-200 cursor-pointer"
              style={{
                borderColor: isSelected ? p.color : 'rgba(255,255,255,0.07)',
                background: isSelected ? `rgba(${p.rgb}, 0.08)` : '#0e1118',
                color: isSelected ? '#eef0f6' : '#a8b0c0',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.background = '#141720';
                  e.currentTarget.style.color = '#eef0f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.background = '#0e1118';
                  e.currentTarget.style.color = '#a8b0c0';
                }
              }}
            >
              <span style={{ color: p.color, fontSize: 16 }}>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
