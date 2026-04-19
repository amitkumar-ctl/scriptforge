import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

const SUBJECTS = [
  'Script generation not working',
  'Director\'s cut not working',
  'Payment / billing issue',
  'Feature request',
  'Bug report',
  'Other',
];

export default function SupportWidget() {
  const { authFetch, user } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status,  setStatus]  = useState('idle');
  const [error,   setError]   = useState(null);

  if (!user) return null;

  const handleSubmit = async () => {
  if (!subject || !message.trim()) {
    setError('Please select a subject and enter your message.');
    return;
  }
  setStatus('sending');
  setError(null);
  try {
    await authFetch('/api/support/ticket', {
      method: 'POST',
      body:   JSON.stringify({ subject, message }),
    });
    // ✅ axios throws on non-2xx so if we reach here it succeeded
    setStatus('success');
  } catch (err) {
    // ✅ axios error message is in err.response.data.error
    const message = err.response?.data?.error || err.message || 'Failed to submit';
    setError(message);
    setStatus('error');
  }
};

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setSubject('');
      setMessage('');
      setError(null);
    }, 300);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        title="Get Support"
        aria-label="Open support"
        className="fixed bottom-6 right-6 z-[150] w-12 h-12 rounded-full
                   bg-gradient-accent border-none cursor-pointer
                   flex items-center justify-center text-bg text-xl font-bold
                   shadow-[0_4px_24px_rgba(99,220,163,0.35)]
                   hover:scale-110 hover:shadow-[0_6px_32px_rgba(99,220,163,0.5)]
                   transition-all duration-200"
      >
        ?
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-[160] flex items-end justify-end p-6
                     bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-surface border border-white/10
                       rounded-2xl p-6 max-h-[90vh] overflow-y-auto
                       animate-fade-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-syne font-extrabold text-lg mb-0.5">Support</h3>
                <p className="text-[11px] text-muted font-mono">We reply within 24 hours</p>
              </div>
              <button
                onClick={handleClose}
                className="text-muted hover:text-text transition-colors
                           bg-none border-none cursor-pointer text-lg p-1"
              >✕</button>
            </div>

            {status === 'success' ? (
              /* Success state */
              <div className="text-center py-8">
                <div className="text-5xl mb-4 text-accent">✦</div>
                <p className="font-syne font-bold text-base text-accent mb-2">
                  Message received!
                </p>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  We'll get back to you at<br />
                  <span className="text-text font-mono">{user.email}</span><br />
                  within 24 hours.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2 rounded-lg cursor-pointer
                             bg-accent/10 border border-accent/30 text-accent
                             font-mono text-xs hover:bg-accent/20 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form */
              <div className="flex flex-col gap-4">

                {/* User info pill */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                                bg-white/3 border border-white/7">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30
                                    flex items-center justify-center text-accent text-[11px] font-bold">
                      {(user.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-text font-mono truncate">{user.name}</p>
                    <p className="text-[10px] text-muted font-mono truncate">{user.email}</p>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono tracking-widest uppercase">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface2 border border-white/7
                               rounded-lg font-mono text-xs outline-none cursor-pointer
                               focus:border-accent transition-colors"
                    style={{ color: subject ? '#eef0f6' : '#666e85' }}
                  >
                    <option value="" disabled style={{ background: '#141720' }}>
                      Select a subject…
                    </option>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s} style={{ background: '#141720', color: '#eef0f6' }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono tracking-widest uppercase">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe your issue in detail. The more info you provide, the faster we can help."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface2 border border-white/7
                               rounded-lg text-text font-mono text-xs outline-none
                               focus:border-accent transition-colors resize-y leading-relaxed"
                  />
                  <p className="text-[10px] text-muted font-mono">
                    {message.length} characters
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-[11px] text-danger font-mono px-3 py-2
                                bg-danger/8 border border-danger/20 rounded-lg">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={status === 'sending'}
                  className="w-full py-3 rounded-xl border-none font-syne font-bold text-sm
                             transition-all duration-200 cursor-pointer
                             disabled:cursor-not-allowed"
                  style={{
                    background: status === 'sending'
                      ? '#0a3d24'
                      : 'linear-gradient(135deg, #63dca3, #1a9a6a)',
                    color: status === 'sending' ? '#63dca3' : '#070d0a',
                  }}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}