import React from 'react';
import './styles.css';

const TONES = ['Energetic', 'Professional', 'Funny', 'Emotional', 'Educational', 'ASMR', 'Hype', 'Storytelling'];
const HOOK_STYLES = ['Bold Claim', 'Shocking Stat', 'Relatable Problem', 'Question Hook', 'Controversy', 'Story Drop'];

const DURATIONS = {
  youtube:   ['3 min', '5 min', '8 min', '12 min', '20 min'],
  instagram: ['15 sec', '30 sec', '60 sec', '90 sec'],
  tiktok:    ['15 sec', '30 sec', '60 sec', '3 min'],
  linkedin:  ['1 min', '2 min', '5 min'],
  podcast:   ['5 min', '15 min', '30 min', '60 min'],
  twitter:   ['30 sec', '1 min'],
  custom:    ['1 min', '5 min', '10 min', 'Custom'],
};

function Field({ label, children, full }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}>
      <label className="text-[10px] text-muted tracking-widest uppercase font-mono">{label}</label>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange }) {
  return (
    <input
      className="bg-surface border border-white/7 rounded-md text-text font-mono text-xs px-3 py-2.5
                 outline-none transition-colors duration-200 focus:border-accent w-full"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="bg-surface border border-white/7 rounded-md text-text font-mono text-xs px-3 py-2.5
                 outline-none transition-colors duration-200 focus:border-accent w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: '#141720' }}>{o}</option>
      ))}
    </select>
  );
}

/**
 * ScriptConfigMFE
 * Props:
 *   config   {object}   - current config state
 *   platform {string}   - currently selected platform id
 *   onChange {function} - called with (key, value)
 */
export default function ScriptConfig({ config, platform, onChange }) {
  const durations = DURATIONS[platform] || DURATIONS.custom;

  return (
    <div className="px-8 pb-6">
      <div className="grid grid-cols-2 gap-4">

        <Field label="Topic / Niche" full>
          <Input
            placeholder="e.g. How I made $10k with AI in 30 days..."
            value={config.topic}
            onChange={(v) => onChange('topic', v)}
          />
        </Field>

        <Field label="Target Audience" full>
          <Input
            placeholder="e.g. Gen Z entrepreneurs, fitness beginners..."
            value={config.audience}
            onChange={(v) => onChange('audience', v)}
          />
        </Field>

        <Field label="Duration">
          <Select
            value={config.duration}
            onChange={(v) => onChange('duration', v)}
            options={durations}
          />
        </Field>

        <Field label="Hook Style">
          <Select
            value={config.hook}
            onChange={(v) => onChange('hook', v)}
            options={HOOK_STYLES}
          />
        </Field>

        <Field label="Language / Region">
          <Input
            placeholder="English, Hindi, Spanish..."
            value={config.language}
            onChange={(v) => onChange('language', v)}
          />
        </Field>

        <Field label="Call-to-Action">
          <Input
            placeholder="Subscribe, Follow, Buy now..."
            value={config.cta}
            onChange={(v) => onChange('cta', v)}
          />
        </Field>

        <Field label="Tone & Style" full>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => onChange('tone', t)}
                className={`px-3 py-1.5 rounded-full text-[11px] border transition-all duration-200 font-mono cursor-pointer
                  ${config.tone === t
                    ? 'bg-accent/10 text-accent border-accent'
                    : 'bg-transparent text-muted border-white/7 hover:text-text hover:border-white/20'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Extra Context / Notes" full>
          <textarea
            rows={2}
            className="bg-surface border border-white/7 rounded-md text-text font-mono text-xs px-3 py-2.5
                       outline-none transition-colors duration-200 focus:border-accent w-full resize-none"
            placeholder="Any brand voice, keywords to include, things to avoid..."
            value={config.notes}
            onChange={(e) => onChange('notes', e.target.value)}
          />
        </Field>

      </div>
    </div>
  );
}
