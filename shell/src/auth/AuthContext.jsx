import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
      const res = await fetch(`${__API_BASE_URL__}/api/auth/refresh`, {
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

    // ✅ Safe base64 decode that handles URL-safe chars
    const base64 = at.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));

    applyTokens(at, rt, {
      id: payload.sub, name: payload.name, email: payload.email, avatar: payload.avatar,
    });
    window.history.replaceState(null, '', window.location.pathname);
    return true;
  } catch(e) { 
    console.error('[Auth] handleCallback error:', e); // ← add this to see exact error
    return false; 
  }
}, [applyTokens]);

useEffect(() => {
  const hash = window.location.hash;
  const path = window.location.pathname;
  console.log('[Auth] Mount - pathname:', path);
  console.log('[Auth] Mount - hash:', hash);
  console.log('[Auth] Mount - full URL:', window.location.href);

  if (hash.includes('access=')) {
    console.log('[Auth] Processing callback...');
    const ok = handleCallback(hash);
    console.log('[Auth] Callback result:', ok);
    if (!ok) clearSession();
    setLoading(false);
  } else {
    console.log('[Auth] No callback, trying silent refresh...');
    doRefresh().finally(() => setLoading(false));
  }
  return () => { if (timerRef.current) clearTimeout(timerRef.current); };
}, []);

const logout = useCallback(async () => {
  const rt = RT.load();
  try {
    await fetch(`${__API_BASE_URL__}/api/auth/logout`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(atRef.current ? { Authorization: `Bearer ${atRef.current}` } : {}),
      },
      body: JSON.stringify({ refreshToken: rt }),
    });
  } catch {}
  clearSession();
  // Clear all persisted state so landing page doesn't auto-redirect
  try {
    sessionStorage.removeItem('sf_restored');
    sessionStorage.removeItem('sf_directors_map');
    sessionStorage.removeItem('sf_active_history_id');
  } catch {}
  window.location.href = '/';
}, [clearSession]);

  const authFetch = useCallback(async (url, options = {}) => {
    const fullUrl = url.startsWith('http') ? url : `${__API_BASE_URL__}${url}`;
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