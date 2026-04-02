import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const API_BASE = config.API_URL || 'http://localhost:4000';

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',     icon: '▶', color: '#ff4545' },
  { id: 'instagram', label: 'Instagram',   icon: '◈', color: '#e040fb' },
  { id: 'tiktok',    label: 'TikTok',      icon: '♪', color: '#00f5d4' },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '⬡', color: '#4fa3e0' },
  { id: 'podcast',   label: 'Podcast',     icon: '⊚', color: '#f0a04b' },
  { id: 'twitter',   label: 'X / Twitter', icon: '✕', color: '#5bc8e0' },
  { id: 'custom',    label: 'Custom',      icon: '⊕', color: '#aaaaaa' },
];

const DEMO_SCRIPTS = {
  youtube: `[HOOK]
Nobody tells you that 90% of YouTube channels fail in the first 3 months.

Here's exactly why — and the 3-step system I used to hit 10k subscribers.

[INTRO]
I've spent the last two years studying what separates channels that explode from channels that die quietly.

The answer isn't better equipment. It isn't better editing. It's something most creators never even think about.

[MAIN CONTENT]
Step 1: Stop making videos people want to watch. Start making videos people need to share.

Step 2: Your first 30 seconds is the only thing that matters. If you lose them there, you've lost them forever.

Step 3: The algorithm doesn't pick winners. Viewers do. Give viewers a reason to come back.

[CTA]
If this is making sense, subscribe right now. Every week I break down exactly what's working on YouTube today.

[OUTRO]
The channels winning right now aren't the most talented. They're the most strategic. Let's go.`,

  tiktok: `[HOOK]
Stop. Nobody told you this about TikTok.

[MAIN CONTENT]
The creators blowing up right now? They're not more talented than you.

They figured out one thing: the first word of your video determines everything.

But wait — here's where it gets weird.

The algorithm doesn't care about your content. It cares about how long people watch.

Here's the thing — if you can make someone watch 3 extra seconds, you win.

[CTA]
Follow for the tactics that actually work in 2024.`,

  instagram: `[HOOK]
POV: You just discovered why your Reels aren't getting views.

[MAIN CONTENT]
It's not your content. It's your hook.

You have 1.7 seconds to stop the scroll.

Most people waste it with "Hey guys, welcome back."

The creators getting millions of views? They start in the middle of the story.

Problem first. Solution second. CTA third. Every time.

[CTA]
Save this for the next time you film. Your future self will thank you.`,
};

function useTypewriter(text, speed = 18, active = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); indexRef.current = 0; return; }
    setDisplayed(''); setDone(false); indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active]);

  return { displayed, done };
}

function LoginModal({ onClose }) {
  const handleLogin = (provider) => {
    window.location.href = `${API_BASE}/api/auth/${provider}`;
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-white/10 rounded-2xl p-8 w-full max-w-sm relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-text bg-transparent border-none cursor-pointer text-lg">✕</button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 font-syne font-extrabold text-2xl mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center text-bg text-base">✦</div>
            Script<span className="text-accent">Forge</span>
          </div>
          <p className="text-muted text-xs font-mono mt-1">Sign in to start generating scripts</p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { id: 'google', label: 'Continue with Google', icon: (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )},
            { id: 'github', label: 'Continue with GitHub', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )},
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleLogin(p.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-text cursor-pointer font-mono text-sm hover:border-white/25 transition-all"
            >
              {p.icon}
              <span className="flex-1 text-center">{p.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted font-mono leading-relaxed">
          We never store your OAuth passwords. Sessions are secured with JWT tokens.
        </p>
      </div>
    </div>
  );
}

function ContactForm() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus('sent'); setForm({ name: '', email: '', message: '' }); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  if (status === 'sent') {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✦</div>
        <p className="font-syne font-bold text-xl text-accent mb-2">Message sent!</p>
        <p className="font-mono text-sm text-muted">We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'name',  placeholder: 'Your name',      type: 'text'  },
          { key: 'email', placeholder: 'your@email.com', type: 'email' },
        ].map(f => (
          <input
            key={f.key}
            type={f.type}
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
            className="field-input"
          />
        ))}
      </div>
      <textarea
        rows={4}
        placeholder="What are you working on? How can we help?"
        value={form.message}
        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
        className="field-input resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={status === 'sending'}
        className="btn-generate"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
      {status === 'error' && (
        <p className="text-danger text-xs font-mono text-center">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [showModal,      setShowModal]      = useState(false);
  const [demoStarted,    setDemoStarted]    = useState(false);
  const [demoPlatform,   setDemoPlatform]   = useState('youtube');
  const [demoGenerating, setDemoGenerating] = useState(false);

  const demoScript = DEMO_SCRIPTS[demoPlatform] || DEMO_SCRIPTS.youtube;
  const { displayed, done } = useTypewriter(demoScript, 12, demoStarted);

  useEffect(() => {
    if (user) navigate('/app');
  }, [user]);

  const handleGetStarted = () => setShowModal(true);

  const handleDemoGenerate = () => {
    setDemoStarted(false);
    setDemoGenerating(true);
    setTimeout(() => { setDemoGenerating(false); setDemoStarted(true); }, 1200);
  };

  const activePlatform = PLATFORMS.find(p => p.id === demoPlatform);

  return (
    <div className="bg-bg min-h-screen text-text font-mono">
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#4fa3e0]/4 blur-[100px]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-5 md:px-10 h-16 bg-bg/90 border-b border-white/6 backdrop-blur-xl">
        <div className="flex items-center gap-2 font-syne font-extrabold text-lg md:text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center text-bg text-sm">✦</div>
          Script<span className="text-accent">Forge</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Demo', 'Pricing', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-muted text-sm hover:text-text transition-colors no-underline">{item}</a>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={handleGetStarted} className="px-3 md:px-4 py-2 rounded-lg border border-white/10 bg-transparent text-text cursor-pointer font-mono text-xs hover:border-white/25 transition-all">
            Sign In
          </button>
          <button onClick={handleGetStarted} className="px-3 md:px-5 py-2 rounded-lg border-none bg-gradient-accent text-bg cursor-pointer font-syne font-bold text-xs hover:-translate-y-px transition-all">
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-5 md:px-10 pt-16 md:pt-24 pb-12 md:pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-8">
          <span className="text-accent text-xs">✦</span>
          <span className="text-accent text-xs tracking-widest uppercase">AI-Powered Script Generation</span>
        </div>

        <h1 className="font-syne font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 tracking-tight">
          Stop staring at a<br />
          <span className="bg-gradient-to-r from-accent to-[#4fa3e0] bg-clip-text text-transparent">blank page.</span>
        </h1>

        <p className="text-base md:text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          AI-powered scripts for every platform. YouTube, TikTok, Instagram, LinkedIn and more — generated in seconds, engineered to perform.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border-none bg-gradient-accent text-bg cursor-pointer font-syne font-bold text-base hover:-translate-y-px transition-all shadow-[0_8px_32px_rgba(99,220,163,0.25)]"
          >✦ Start Generating Free</button>
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-transparent text-text font-mono text-sm no-underline inline-flex items-center justify-center hover:border-white/25 transition-all"
          >Watch Demo →</a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 md:gap-12 justify-center mt-16">
          {[
            { value: '7',    label: 'Platforms' },
            { value: '10+',  label: 'Script Styles' },
            { value: '<30s', label: 'Generation Time' },
            { value: '100%', label: 'AI-Powered' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-syne font-extrabold text-3xl text-accent">{s.value}</div>
              <div className="text-xs text-muted uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platforms ── */}
      <section id="features" className="relative z-10 px-5 md:px-10 py-16 md:py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-accent uppercase tracking-[0.15em] mb-4">Supported Platforms</p>
          <h2 className="font-syne font-extrabold text-3xl md:text-4xl mb-12">Every platform. One tool.</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {PLATFORMS.map(p => (
              <div
                key={p.id}
                className="py-6 px-4 rounded-2xl border border-white/7 bg-surface text-center transition-all duration-200 cursor-default card-surface"
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + '60'; e.currentTarget.style.background = p.color + '12'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
              >
                <div className="text-3xl mb-2" style={{ color: p.color }}>{p.icon}</div>
                <div className="text-xs font-syne font-bold">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 px-5 md:px-10 py-16 md:py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-accent uppercase tracking-[0.15em] mb-4">How It Works</p>
          <h2 className="font-syne font-extrabold text-3xl md:text-4xl mb-16">Three steps to your script.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick your platform',   desc: 'Choose from YouTube, TikTok, Instagram, LinkedIn, Podcast, Twitter or Custom.', icon: '⊞', color: 'text-accent' },
              { step: '02', title: 'Configure your script', desc: 'Set your topic, tone, hook style, duration and target audience. The more specific, the better.', icon: '⚙', color: 'text-[#4fa3e0]' },
              { step: '03', title: 'Generate & use',        desc: 'Get a complete, ready-to-record script with hooks, hashtags, and a content brief. In seconds.', icon: '✦', color: 'text-[#f0a04b]' },
            ].map(s => (
              <div key={s.step} className="p-8 rounded-2xl border border-white/7 bg-surface text-left relative overflow-hidden">
                <div className="absolute top-4 right-5 font-syne font-extrabold text-5xl text-white/5">{s.step}</div>
                <div className={`text-3xl mb-4 ${s.color}`}>{s.icon}</div>
                <h3 className="font-syne font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section id="demo" className="relative z-10 px-5 md:px-10 py-16 md:py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-accent uppercase tracking-[0.15em] mb-4">Live Demo</p>
            <h2 className="font-syne font-extrabold text-3xl md:text-4xl mb-4">See it in action.</h2>
            <p className="text-sm text-muted">Pick a platform and watch ScriptForge generate a script in real time.</p>
          </div>

          {/* Platform picker */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {PLATFORMS.filter(p => DEMO_SCRIPTS[p.id]).map(p => (
              <button
                key={p.id}
                onClick={() => { setDemoPlatform(p.id); setDemoStarted(false); }}
                className="px-4 py-2 rounded-full font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                style={{
                  border: `1px solid ${demoPlatform === p.id ? p.color : 'rgba(255,255,255,0.07)'}`,
                  background: demoPlatform === p.id ? p.color + '15' : 'transparent',
                  color: demoPlatform === p.id ? p.color : '#a8b0c0',
                }}
              >
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </div>

          {/* Script output box */}
          <div className="bg-surface border border-white/7 rounded-2xl overflow-hidden mb-5">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/7 bg-surface2">
              <div className="font-syne font-bold text-sm">
                <span style={{ color: activePlatform?.color }}>{activePlatform?.icon}</span>
                <span className="ml-1">Generated Script</span>
              </div>
              <span className="text-xs text-accent font-mono uppercase tracking-widest">
                {demoGenerating ? '⟳ Generating…' : done ? '✓ Complete' : demoStarted ? '● Writing…' : 'Ready'}
              </span>
            </div>
            <div className="p-6 min-h-[280px] font-serif text-base leading-relaxed text-text whitespace-pre-wrap">
              {demoGenerating ? (
                <div className="flex flex-col gap-3">
                  {[100, 80, 100, 60, 90, 70].map((w, i) => (
                    <div key={i} className="h-3.5 rounded bg-surface2 animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : demoStarted ? (
                <>
                  {displayed}
                  {!done && <span className="text-accent animate-[blink_1s_step-end_infinite]">▌</span>}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted">
                  <span className="text-4xl opacity-30">✦</span>
                  <p className="text-sm">Click "Generate Script" to see a demo</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleDemoGenerate} className="btn-generate sm:w-auto px-8">
              ✦ Generate Script
            </button>
            <button
              onClick={handleGetStarted}
              className="px-8 py-3.5 rounded-lg border border-accent/30 bg-accent/5 text-accent cursor-pointer font-mono text-sm hover:bg-accent/10 transition-all"
            >Sign in for real scripts →</button>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 px-5 md:px-10 py-16 md:py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-accent uppercase tracking-[0.15em] mb-4">Pricing</p>
          <h2 className="font-syne font-extrabold text-3xl md:text-4xl mb-4">Simple, honest pricing.</h2>
          <p className="text-sm text-muted mb-12">We're in early access. Right now ScriptForge is completely free while we build and improve.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                name: 'Free', price: '$0', period: 'forever',
                color: '#a8b0c0', borderClass: 'border-muted/20',
                features: ['5 scripts per month', 'All 7 platforms', 'Script history (7 days)', 'Hooks & hashtags'],
                cta: 'Get Started Free',
                ctaClass: 'border border-white/10 bg-transparent text-text hover:border-white/25',
              },
              {
                name: 'Pro', price: 'Coming Soon', period: '',
                color: '#63dca3', borderClass: 'border-accent/20', badge: 'Soon',
                bg: 'bg-accent/4',
                features: ["Unlimited scripts", 'All 7 platforms', 'Unlimited history', "Director's Cut", 'Export PDF/DOCX', 'Priority generation'],
                cta: 'Join Waitlist',
                ctaClass: 'border-none bg-gradient-accent text-bg hover:-translate-y-px shadow-[0_4px_16px_rgba(99,220,163,0.2)]',
              },
            ].map(plan => (
              <div key={plan.name} className={`p-8 rounded-2xl border ${plan.borderClass} ${plan.bg || 'bg-surface'} text-left relative`}>
                {plan.badge && (
                  <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-xs text-accent font-mono">{plan.badge}</div>
                )}
                <div className="font-syne font-extrabold text-lg mb-2">{plan.name}</div>
                <div className="font-syne font-extrabold text-3xl mb-1" style={{ color: plan.color }}>{plan.price}</div>
                {plan.period && <div className="text-xs text-muted mb-6">{plan.period}</div>}
                <div className="h-px bg-white/5 my-4" />
                <div className="flex flex-col gap-2.5 mb-7">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-muted">
                      <span className="text-xs" style={{ color: plan.color }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-xl cursor-pointer font-syne font-bold text-sm transition-all ${plan.ctaClass}`}
                >{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="relative z-10 px-5 md:px-10 py-16 md:py-20 border-t border-white/5">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-accent uppercase tracking-[0.15em] mb-4">Contact</p>
            <h2 className="font-syne font-extrabold text-3xl md:text-4xl mb-4">Get in touch.</h2>
            <p className="text-sm text-muted">Have a question, feedback, or want to partner with us? We'd love to hear from you.</p>
          </div>
          <div className="bg-surface border border-white/7 rounded-2xl p-6 md:p-10">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 px-5 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2 font-syne font-extrabold text-lg">
          <div className="w-7 h-7 rounded-md bg-gradient-accent flex items-center justify-center text-bg text-sm">✦</div>
          Script<span className="text-accent">Forge</span>
        </div>
        <p className="text-xs text-muted">© 2026 ScriptForge. Built for creators.</p>
        <div className="flex gap-6">
          {['Features', 'Demo', 'Pricing', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-xs text-muted hover:text-text no-underline transition-colors">{item}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .no-underline { text-decoration: none; }
      `}</style>
    </div>
  );
}