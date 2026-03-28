import React, { Suspense, lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../auth/AuthContext';
import { restoreFromHistory } from '../../store/slices/scriptSlice';
import { setActiveView } from '../../store/slices/uiSlice';
import { fetchHistory, deleteScript, selectHistoryStatus } from '../../store/slices/historySlice';

const HistoryPanelMFE = lazy(() => import('mfeHistory/HistoryPanel'));

export default function HistoryView() {
  const dispatch = useDispatch();
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const status = useSelector(selectHistoryStatus);

  // Load from API when view mounts
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHistory({ authFetch }));
    }
  }, []);

  const handleRestore = (item) => {
    dispatch(restoreFromHistory(item));
    dispatch(setActiveView('generator'));
    navigate('/');
  };

  const handleDelete = (id) => {
    dispatch(deleteScript({ id, authFetch }));
  };

  const handleRefresh = () => {
    dispatch(fetchHistory({ authFetch }));
  };

  return (
    <div className="pb-12">
      <div className="px-8 pt-8 pb-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-extrabold text-2xl mb-1">History</h1>
            <p className="text-xs text-muted">Your previously generated scripts, saved to your account</p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs font-mono text-muted border border-white/7 px-3 py-1.5 rounded-lg hover:text-text hover:border-white/20 transition-all cursor-pointer"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-8 mb-4">
        <h2 className="font-syne font-bold text-sm">Generated Scripts</h2>
      </div>

      <Suspense fallback={
        <div className="mx-8 h-32 rounded-lg bg-surface border border-white/7 flex items-center justify-center text-muted text-xs animate-pulse">
          Loading History Panel…
        </div>
      }>
        <HistoryPanelMFE onRestore={handleRestore} onDelete={handleDelete} />
      </Suspense>
    </div>
  );
}
