export const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',     icon: '▶', color: '#ff4545', rgb: '255,69,69' },
  { id: 'instagram', label: 'Instagram',   icon: '◈', color: '#e040fb', rgb: '224,64,251' },
  { id: 'tiktok',    label: 'TikTok',      icon: '♪', color: '#00f5d4', rgb: '0,245,212' },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '⬡', color: '#4fa3e0', rgb: '79,163,224' },
  { id: 'podcast',   label: 'Podcast',     icon: '⊚', color: '#f0a04b', rgb: '240,160,75' },
  { id: 'twitter',   label: 'X / Twitter', icon: '✕', color: '#5bc8e0', rgb: '91,200,224' },
];

export const TONES = [
  'Energetic',
  'Funny',
  'Hype',
  'Emotional',
  'Educational',
  'Inspirational',
  'Conversational',
  'Professional',
  'Controversial',
];

export const HOOK_STYLES = [
  'Bold Claim',
  'Story Drop',
  'Curiosity Gap',
  'Question',
  'Shocking Stat',
  'Relatable Problem',
  'Controversy',
  'Controversy',
  'Number',
  'Statistic',
];

export const DURATIONS = {
  youtube:   ['3 min', '5 min', '8 min', '12 min', '20 min'],
  instagram: ['15 sec', '30 sec', '60 sec', '90 sec'],
  tiktok:    ['15 sec', '30 sec', '60 sec', '3 min'],
  linkedin:  ['1 min', '2 min', '5 min'],
  podcast:   ['5 min', '15 min', '30 min', '60 min'],
  twitter:   ['30 sec', '1 min'],
  custom:    ['1 min', '5 min', '10 min', 'Custom'],
};

export const TEMPLATES = [
  { title: 'YouTube Tutorial',            platform: 'youtube',   icon: '▶', color: '#ff4545', topic: 'How to [achieve result] in [timeframe]',        tone: 'Educational', hook: 'Bold Claim' },
  { title: 'Instagram Reel Hook',         platform: 'instagram', icon: '◈', color: '#e040fb', topic: 'POV: You discovered [life-changing thing]',       tone: 'Emotional',   hook: 'Story Drop' },
  { title: 'TikTok Trending',             platform: 'tiktok',    icon: '♪', color: '#00f5d4', topic: 'I tried [viral trend] for 30 days',              tone: 'Funny',       hook: 'Shocking Stat' },
  { title: 'LinkedIn Thought Leadership', platform: 'linkedin',  icon: '⬡', color: '#4fa3e0', topic: 'The unpopular opinion about [industry topic]',   tone: 'Professional', hook: 'Controversy' },
  { title: 'Podcast Intro',              platform: 'podcast',   icon: '⊚', color: '#f0a04b', topic: 'Deep dive into [complex subject]',               tone: 'Storytelling', hook: 'Question Hook' },
  { title: 'Viral Thread',               platform: 'twitter',   icon: '✕', color: '#5bc8e0', topic: 'Nobody talks about [hidden insight]',            tone: 'Hype',         hook: 'Shocking Stat' },
];