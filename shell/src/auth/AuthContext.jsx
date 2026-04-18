import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

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
      const res = await axios.post(
        `${__API_BASE_URL__}/api/auth/refresh`,
        { refreshToken: rt },
        { withCredentials: true }
      );
      const { accessToken: at, refreshToken: newRt } = res.data;
      const base64  = at.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
      applyTokens(at, newRt, {
        id: payload.sub, name: payload.name, email: payload.email, avatar: payload.avatar,
      });
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [applyTokens, clearSession]);

  const handleCallback = useCallback((hash) => {
    try {
      const p  = new URLSearchParams(hash.replace(/^#/, ''));
      const at = p.get('access');
      const rt = p.get('refresh');
      if (!at || !rt) return false;
      const base64  = at.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
      applyTokens(at, rt, {
        id: payload.sub, name: payload.name, email: payload.email, avatar: payload.avatar,
      });
      window.history.replaceState(null, '', window.location.pathname);
      return true;
    } catch (e) {
      console.error('[Auth] handleCallback error:', e);
      return false;
    }
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
      await axios.post(
        `${__API_BASE_URL__}/api/auth/logout`,
        { refreshToken: rt },
        {
          withCredentials: true,
          headers: {
            ...(atRef.current ? { Authorization: `Bearer ${atRef.current}` } : {}),
          },
        }
      );
    } catch {}
    clearSession();
    try {
      sessionStorage.removeItem('sf_restored');
      sessionStorage.removeItem('sf_directors_map');
      sessionStorage.removeItem('sf_active_history_id');
    } catch {}
    window.location.href = '/';
  }, [clearSession]);

  // Main authenticated request helper
  // Returns axios response — access res.data directly (no .json() needed)
  const authFetch = useCallback(async (url, options = {}) => {
    const fullUrl = url.startsWith('http') ? url : `${__API_BASE_URL__}${url}`;
    const { method = 'GET', body, headers = {} } = options;

    const makeRequest = (token) => axios({
      url:            fullUrl,
      method,
      data:           body ? JSON.parse(body) : undefined,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    try {
      const res = await makeRequest(atRef.current);
      return res;
    } catch (err) {
      // Axios throws on non-2xx — check if it's a 401 TOKEN_EXPIRED
      if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED') {
        const refreshed = await doRefresh();
        if (refreshed) {
          try {
            return await makeRequest(atRef.current);
          } catch (retryErr) {
            throw retryErr;
          }
        }
      }
      throw err;
    }
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