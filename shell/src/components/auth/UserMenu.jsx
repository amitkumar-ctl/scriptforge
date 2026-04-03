import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen]   = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const initials = (user.name || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/7
                   hover:border-white/20 hover:bg-white/4 transition-all duration-200 cursor-pointer"
      >
        {/* Avatar */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-[9px] font-syne font-bold">
            {initials}
          </div>
        )}
        <span className="text-xs font-mono text-text max-w-[120px] truncate">
          {user.name?.split(' ')[0]}
        </span>
        <span className={`text-muted text-[10px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface2 border border-white/10 rounded-xl shadow-2xl z-[200] overflow-hidden animate-fade-up">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-white/7">
            <p className="text-xs font-mono text-text truncate">{user.name}</p>
            {user.email && (
              <p className="text-[10px] font-mono text-muted truncate mt-0.5">{user.email}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); logout()}}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono
                         text-muted hover:text-danger hover:bg-danger/5 transition-all duration-150 cursor-pointer text-left"
            >
              <span>⎋</span> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
