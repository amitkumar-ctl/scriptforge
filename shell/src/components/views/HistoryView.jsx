import React, { Suspense, lazy } from 'react';
import { useDispatch } from 'react-redux';
import { restoreFromHistory } from '../../store/slices/scriptSlice';
import { setActiveView } from '../../store/slices/uiSlice';

const HistoryPanelMFE = lazy(() => import('mfeHistory/HistoryPanel'));

export default function HistoryView() {
  const dispatch = useDispatch();

  const handleRestore = (item) => {
    dispatch(restoreFromHistory(item));
    dispatch(setActiveView('generator'));
  };

  return (
    <div className="pb-12">
      <div className="px-8 pt-8 pb-6 animate-fade-up">
        <h1 className="font-syne font-extrabold text-2xl mb-1">History</h1>
        <p className="text-xs text-muted">Your previously generated scripts</p>
      </div>

      <div className="flex items-center gap-2 px-8 mb-4">
        <h2 className="font-syne font-bold text-sm">Generated Scripts</h2>
      </div>

      <Suspense fallback={
        <div className="mx-8 h-32 rounded-lg bg-surface border border-white/7 flex items-center justify-center text-muted text-xs animate-pulse">
          Loading History Panel…
        </div>
      }>
        <HistoryPanelMFE onRestore={handleRestore} />
      </Suspense>
    </div>
  );
}
