import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import './styles/global.css';

// Shell-owned layout components (not federated)
import Topbar    from './components/Topbar';
import Sidebar   from './components/Sidebar';
import Notification from './components/Notification';

// Views (each view lazy-loads the remote MFEs it needs)
import GeneratorView from './components/views/GeneratorView';
import HistoryView   from './components/views/HistoryView';
import TemplatesView from './components/views/TemplatesView';

import { useSelector } from 'react-redux';
import { selectActiveView } from './store/slices/uiSlice';

function MFEFallback({ name }) {
  return (
    <div className="flex items-center justify-center h-40 text-muted text-xs animate-pulse">
      Loading {name}…
    </div>
  );
}

function Main() {
  const view = useSelector(selectActiveView);

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-bg">
          <Suspense fallback={<MFEFallback name="view" />}>
            {view === 'generator'  && <GeneratorView />}
            {view === 'history'    && <HistoryView />}
            {view === 'templates'  && <TemplatesView />}
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
      <Main />
    </Provider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
