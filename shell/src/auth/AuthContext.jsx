import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import config from '../config';
const API = config.API_URL || 'http://localhost:4000';

const RT_KEY = 'sf_rt';

const RT = {
  save:  (t) => { try { localStorage.setItem(RT_KEY, t);    } catch {} },
  load:  ()  => { try { return localStorage.getItem(RT_KEY); } catch { return null; } },
  clear: ()  => { try { localStorage.removeItem(RT_KEY);    } catch {} },
};

function getExpiry(token) {
  try { return JSON.parse(atob(token.split('.')[1])).exp * 1000; }
  catch { return null; }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const timerRef = useRef(null);
  const atRef    = useRef(null);

  const applyTokens = useCallback((at, rt, userObj) => {
    atRef.current = at;
    setAccessToken(at);
    setUser(userObj);
    RT.save(rt);
    if (timerRef.current) clearTimeout(timerRef.current);
    const expiry = getExpiry(at);
    if (expiry) {
      const delay = Math.max(expiry - Date.now() - 60_000, 0);
      timerRef.current = setTimeout(() => doRefresh(), delay);
    }
  }, []);

  const clearSession = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    atRef.current = null;
    setAccessToken(null);
    setUser(null);
    RT.clear();
  }, []);

  const doRefresh = useCallback(async () => {
    const rt = RT.load();
    if (!rt) { clearSession(); return false; }
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) { clearSession(); return false; }
      const data    = await res.json();
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      applyTokens(data.accessToken, data.refreshToken, {
        id: payload.sub, name: payload.name, email: payload.email, avatar: payload.avatar,
      });
      return true;
    } catch { clearSession(); return false; }
  }, [applyTokens, clearSession]);

  const handleCallback = useCallback((hash) => {
    try {
      const p  = new URLSearchParams(hash.replace(/^#/, ''));
      const at = p.get('access');
      const rt = p.get('refresh');
      if (!at || !rt) return false;
      const payload = JSON.parse(atob(at.split('.')[1]));
      applyTokens(at, rt, {
        id: payload.sub, name: payload.name, email: payload.email, avatar: payload.avatar,
      });
      window.history.replaceState(null, '', window.location.pathname);
      return true;
    } catch { return false; }
  }, [applyTokens]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access=')) {
      const ok = handleCallback(hash);
      if (!ok) clearSession();
      setLoading(false);
    } else {
      doRefresh().finally(() => setLoading(false));
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const logout = useCallback(async () => {
    const rt = RT.load();
    try {
      await fetch(`${API}/api/auth/logout`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(atRef.current ? { Authorization: `Bearer ${atRef.current}` } : {}),
        },
        body: JSON.stringify({ refreshToken: rt }),
      });
    } catch {}
    clearSession();
  }, [clearSession]);

  const authFetch = useCallback(async (url, options = {}) => {
    const fullUrl = url.startsWith('http') ? url : `${API}${url}`;
    const doFetch = (token) => fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    let res = await doFetch(atRef.current);
    if (res.status === 401) {
      const body = await res.json().catch(() => ({}));
      if (body.code === 'TOKEN_EXPIRED') {
        const refreshed = await doRefresh();
        if (refreshed) res = await doFetch(atRef.current);
      }
    }
    return res;
  }, [doRefresh]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}