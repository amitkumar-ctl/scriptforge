import React, { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import store from './store';
import { AuthProvider, useAuth } from './auth/AuthContext';
import './styles/global.css';

import Topbar       from './components/Topbar';
import Sidebar      from './components/Sidebar';
import Notification from './components/Notification';
import LoginPage    from './components/auth/LoginPage';

import GeneratorView  from './components/views/GeneratorView';
import HistoryView    from './components/views/HistoryView';
import TemplatesView  from './components/views/TemplatesView';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-accent flex items-center justify-center text-bg animate-pulse">✦</div>
        <p className="text-xs text-muted font-mono animate-pulse">Loading ScriptForge…</p>
      </div>
    </div>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle OAuth callback — tokens arrive in the hash at /auth/callback
  const isCallback = location.pathname === '/auth/callback';
  if (isCallback && loading) return <LoadingScreen />;
  if (isCallback && !loading) return <Navigate to="/" replace />;

  if (loading) return <LoadingScreen />;

  const urlParams = new URLSearchParams(location.search);
  const authError = urlParams.get('error');
  if (!user) return <LoginPage error={authError} />;

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main style={{ flex: 1, overflowY: 'auto', background: '#080a0f' }}>
          <Suspense fallback={
            <div className="flex items-center justify-center h-40 text-muted text-xs animate-pulse">Loading…</div>
          }>
            <Routes>
              <Route path="/"          element={<GeneratorView />} />
              <Route path="/history"   element={<HistoryView />} />
              <Route path="/templates" element={<TemplatesView />} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Notification />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

createRoot(document.getElementById('root')).render(<App />);