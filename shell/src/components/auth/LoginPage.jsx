import React, { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';


const providers = [
  {
    id:    'google',
    label: 'Continue with Google',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    ),
    color: 'border-white/10 hover:border-white/25 hover:bg-white/5',
  },
  {
    id:    'github',
    label: 'Continue with GitHub',
    icon:  (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
    color: 'border-white/10 hover:border-white/25 hover:bg-white/5',
  },
];

export default function LoginPage({ error }) {
  const { user } = useAuth();

  // If already logged in, redirect to generator
  useEffect(() => {
    if (user) window.location.hash = '';
  }, [user]);

  const handleLogin = (provider) => {
    window.location.href = `${__API_BASE_URL__}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 font-syne font-extrabold text-2xl mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center text-bg text-base">
              ✦
            </div>
            Script<span className="text-accent">Forge</span>
          </div>
          <p className="text-sm text-muted font-mono">AI-powered scripts for every platform</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-white/7 rounded-2xl p-8">
          <h1 className="font-syne font-bold text-lg text-center mb-1">Welcome back</h1>
          <p className="text-xs text-muted text-center font-mono mb-7">
            Sign in to access your script history
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-5 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-mono text-center">
              Login failed. Please try again.
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => handleLogin(p.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl border
                  font-mono text-sm text-text transition-all duration-200 cursor-pointer
                  ${p.color}
                `}
              >
                <span className="shrink-0">{p.icon}</span>
                <span className="flex-1 text-center">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/7" />
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">secure login</span>
            <div className="flex-1 h-px bg-white/7" />
          </div>

          {/* Security note */}
          <p className="text-[10px] text-muted font-mono text-center leading-relaxed">
            We never store your OAuth passwords.{' '}
            Sessions are secured with short-lived JWT tokens and httpOnly cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
