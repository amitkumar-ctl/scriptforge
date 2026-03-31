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

// Typewriter hook
function useTypewriter(text, speed = 18, active = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); indexRef.current = 0; return; }
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active]);

  return { displayed, done };
}

// Login Modal
function LoginModal({ onClose }) {
  const handleLogin = (provider) => {
    window.location.href = `${API_BASE}/api/auth/${provider}`;
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0e1118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#a8b0c0', cursor: 'pointer', fontSize: 18 }}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#070d0a' }}>✦</div>
            Script<span style={{ color: '#63dca3' }}>Forge</span>
          </div>
          <p style={{ color: '#a8b0c0', fontSize: 13, fontFamily: '"DM Mono", monospace', margin: 0 }}>Sign in to start generating scripts</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#eef0f6', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              {p.icon}
              <span style={{ flex: 1, textAlign: 'center' }}>{p.label}</span>
            </button>
          ))}
        </div>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#a8b0c0', fontFamily: '"DM Mono", monospace', lineHeight: 1.6 }}>
          We never store your OAuth passwords. Sessions are secured with JWT tokens.
        </p>
      </div>
    </div>
  );
}

// Contact form
function ContactForm() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

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
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#63dca3', marginBottom: 8 }}>Message sent!</p>
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 13, color: '#a8b0c0' }}>We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { key: 'name',  placeholder: 'Your name',         type: 'text' },
          { key: 'email', placeholder: 'your@email.com',    type: 'email' },
        ].map(f => (
          <input
            key={f.key}
            type={f.type}
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
            style={{ background: '#0e1118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', color: '#eef0f6', fontFamily: '"DM Mono", monospace', fontSize: 13, outline: 'none' }}
          />
        ))}
      </div>
      <textarea
        rows={4}
        placeholder="What are you working on? How can we help?"
        value={form.message}
        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
        style={{ background: '#0e1118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', color: '#eef0f6', fontFamily: '"DM Mono", monospace', fontSize: 13, outline: 'none', resize: 'none' }}
      />
      <button
        onClick={handleSubmit}
        disabled={status === 'sending'}
        style={{ padding: '14px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', color: '#070d0a', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
      {status === 'error' && <p style={{ color: '#e05b5b', fontSize: 12, fontFamily: '"DM Mono", monospace', textAlign: 'center' }}>Something went wrong. Please try again.</p>}
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [showModal,      setShowModal]      = useState(false);
  const [demoStarted,    setDemoStarted]    = useState(false);
  const [demoPlatform,   setDemoPlatform]   = useState('youtube');
  const [demoGenerating, setDemoGenerating] = useState(false);

  const demoScript = DEMO_SCRIPTS[demoPlatform] || DEMO_SCRIPTS.youtube;
  const { displayed, done } = useTypewriter(demoScript, 12, demoStarted);

  // If already logged in, go straight to app
  useEffect(() => {
    if (user) navigate('/app');
  }, [user]);

  const handleGetStarted = () => setShowModal(true);

  const handleDemoGenerate = () => {
    setDemoStarted(false);
    setDemoGenerating(true);
    setTimeout(() => {
      setDemoGenerating(false);
      setDemoStarted(true);
    }, 1200);
  };

  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', color: '#eef0f6', fontFamily: '"DM Mono", monospace' }}>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}

      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,220,163,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '60%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,163,224,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 64, background: 'rgba(8,10,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#070d0a' }}>✦</div>
          Script<span style={{ color: '#63dca3' }}>Forge</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Demo', 'Pricing', 'Contact'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{ color: '#a8b0c0', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#eef0f6'}
              onMouseLeave={e => e.target.style.color = '#a8b0c0'}
            >{item}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleGetStarted}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#eef0f6', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: 13 }}
          >Sign In</button>
          <button
            onClick={handleGetStarted}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', color: '#070d0a', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}
          >Get Started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 40px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(99,220,163,0.2)', background: 'rgba(99,220,163,0.06)', marginBottom: 32 }}>
          <span style={{ color: '#63dca3', fontSize: 11 }}>✦</span>
          <span style={{ color: '#63dca3', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI-Powered Script Generation</span>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
          Stop staring at a<br />
          <span style={{ background: 'linear-gradient(135deg, #63dca3, #4fa3e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>blank page.</span>
        </h1>

        <p style={{ fontSize: 18, color: '#a8b0c0', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          AI-powered scripts for every platform. YouTube, TikTok, Instagram, LinkedIn and more — generated in seconds, engineered to perform.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetStarted}
            style={{ padding: '16px 36px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', color: '#070d0a', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, boxShadow: '0 8px 32px rgba(99,220,163,0.25)' }}
          >✦ Start Generating Free</button>
          <a
            href="#demo"
            style={{ padding: '16px 36px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#eef0f6', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >Watch Demo →</a>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
          {[
            { value: '7',    label: 'Platforms' },
            { value: '10+',  label: 'Script Styles' },
            { value: '<30s', label: 'Generation Time' },
            { value: '100%', label: 'AI-Powered' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: '#63dca3' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#a8b0c0', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platforms ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#63dca3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Supported Platforms</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 48 }}>Every platform. One tool.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            {PLATFORMS.map(p => (
              <div
                key={p.id}
                style={{ padding: '24px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', background: '#0e1118', textAlign: 'center', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + '60'; e.currentTarget.style.background = p.color + '10'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#0e1118'; }}
              >
                <div style={{ fontSize: 28, color: p.color, marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#63dca3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>How It Works</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 64 }}>Three steps to your script.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              { step: '01', title: 'Pick your platform', desc: 'Choose from YouTube, TikTok, Instagram, LinkedIn, Podcast, Twitter or Custom.', icon: '⊞', color: '#63dca3' },
              { step: '02', title: 'Configure your script', desc: 'Set your topic, tone, hook style, duration and target audience. The more specific, the better.', icon: '⚙', color: '#4fa3e0' },
              { step: '03', title: 'Generate & use', desc: 'Get a complete, ready-to-record script with hooks, hashtags, and a content brief. In seconds.', icon: '✦', color: '#f0a04b' },
            ].map(s => (
              <div key={s.step} style={{ padding: 32, borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: '#0e1118', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, color: 'rgb(255 255 255 / 34%)' }}>{s.step}</div>
                <div style={{ fontSize: 28, color: s.color, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#a8b0c0', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section id="demo" style={{ position: 'relative', zIndex: 1, padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, color: '#63dca3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Live Demo</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 16 }}>See it in action.</h2>
            <p style={{ fontSize: 14, color: '#a8b0c0' }}>Pick a platform and watch ScriptForge generate a script in real time.</p>
          </div>

          {/* Platform picker */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {PLATFORMS.filter(p => DEMO_SCRIPTS[p.id]).map(p => (
              <button
                key={p.id}
                onClick={() => { setDemoPlatform(p.id); setDemoStarted(false); }}
                style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${demoPlatform === p.id ? p.color : 'rgba(255,255,255,0.07)'}`, background: demoPlatform === p.id ? p.color + '15' : 'transparent', color: demoPlatform === p.id ? p.color : '#a8b0c0', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </div>

          {/* Script output */}
          <div style={{ background: '#0e1118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#141720', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
                <span style={{ color: PLATFORMS.find(p => p.id === demoPlatform)?.color }}>
                  {PLATFORMS.find(p => p.id === demoPlatform)?.icon}
                </span>&nbsp;Generated Script
              </div>
              <span style={{ fontSize: 10, color: '#63dca3', fontFamily: '"DM Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {demoGenerating ? '⟳ Generating…' : done ? '✓ Complete' : demoStarted ? '● Writing…' : 'Ready'}
              </span>
            </div>
            <div style={{ padding: 24, minHeight: 280, fontFamily: '"Instrument Serif", serif', fontSize: 15, lineHeight: 1.85, color: '#eef0f6', whiteSpace: 'pre-wrap' }}>
              {demoGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[100, 80, 100, 60, 90, 70].map((w, i) => (
                    <div key={i} style={{ height: 14, borderRadius: 4, width: `${w}%`, background: 'linear-gradient(90deg, #141720 25%, rgba(255,255,255,0.07) 50%, #141720 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.5s ${i * 0.1}s ease-in-out infinite` }} />
                  ))}
                  <style>{`@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }`}</style>
                </div>
              ) : demoStarted ? (
                <>
                  {displayed}
                  {!done && <span style={{ animation: 'blink 1s step-end infinite', color: '#63dca3' }}>▌</span>}
                  <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#a8b0c0' }}>
                  <span style={{ fontSize: 40, opacity: 0.3 }}>✦</span>
                  <p style={{ fontSize: 13, margin: 0 }}>Click "Generate Script" to see a demo</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={handleDemoGenerate}
              style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', color: '#070d0a', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}
            >✦ Generate Script</button>
            <button
              onClick={handleGetStarted}
              style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid rgba(99,220,163,0.3)', background: 'rgba(99,220,163,0.05)', color: '#63dca3', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: 13 }}
            >Sign in for real scripts →</button>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#63dca3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Pricing</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 16 }}>Simple, honest pricing.</h2>
          <p style={{ fontSize: 14, color: '#a8b0c0', marginBottom: 48 }}>We're in early access. Right now ScriptForge is completely free while we build and improve.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              {
                name: 'Free', price: '$0', period: 'forever',
                color: '#a8b0c0',
                features: ['5 scripts per month', 'All 7 platforms', 'Script history (7 days)', 'Hooks & hashtags'],
                cta: 'Get Started Free', ctaStyle: { border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#eef0f6' },
              },
              {
                name: 'Pro', price: 'Coming Soon', period: '',
                color: '#63dca3',
                badge: 'Soon',
                features: ['Unlimited scripts', 'All 7 platforms', 'Unlimited history', 'Director\'s Cut', 'Export PDF/DOCX', 'Priority generation'],
                cta: 'Join Waitlist', ctaStyle: { border: 'none', background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', color: '#070d0a' },
              },
            ].map(plan => (
              <div
                key={plan.name}
                style={{ padding: 32, borderRadius: 20, border: `1px solid ${plan.color}30`, background: plan.name === 'Pro' ? 'rgba(99,220,163,0.04)' : '#0e1118', textAlign: 'left', position: 'relative' }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 20, background: 'rgba(99,220,163,0.15)', border: '1px solid rgba(99,220,163,0.3)', fontSize: 10, color: '#63dca3', fontFamily: '"DM Mono", monospace' }}>{plan.badge}</div>
                )}
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: plan.color, marginBottom: 4 }}>{plan.price}</div>
                {plan.period && <div style={{ fontSize: 12, color: '#a8b0c0', marginBottom: 24 }}>{plan.period}</div>}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 0 20px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#a8b0c0' }}>
                      <span style={{ color: plan.color, fontSize: 10 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleGetStarted}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, ...plan.ctaStyle }}
                >{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ position: 'relative', zIndex: 1, padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, color: '#63dca3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Contact</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 16 }}>Get in touch.</h2>
            <p style={{ fontSize: 14, color: '#a8b0c0' }}>Have a question, feedback, or want to partner with us? We'd love to hear from you.</p>
          </div>
          <div style={{ background: '#0e1118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 40 }}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #63dca3, #1a9a6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#070d0a' }}>✦</div>
          Script<span style={{ color: '#63dca3' }}>Forge</span>
        </div>
        <p style={{ fontSize: 12, color: '#a8b0c0', margin: 0 }}>© 2026 ScriptForge. Built for creators.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Features', 'Demo', 'Pricing', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 12, color: '#a8b0c0', textDecoration: 'none' }}>{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}