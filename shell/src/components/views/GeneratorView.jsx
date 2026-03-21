import React, { Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/AuthContext';
import {
  generateScript, setPlatform, setConfigField,
  selectPlatform, selectConfig, selectStatus, selectError,
} from '../../store/slices/scriptSlice';
import { showNotification } from '../../store/slices/uiSlice';

const PlatformSelectorMFE = lazy(() => import('mfePlatform/PlatformSelector'));
const ScriptConfigMFE      = lazy(() => import('mfeConfig/ScriptConfig'));
const OutputViewerMFE      = lazy(() => import('mfeOutput/OutputViewer'));

function MFEFallback({ label }) {
  return (
    <div className="mx-8 my-4 h-24 rounded-lg bg-surface border border-white/7 flex items-center justify-center text-muted text-xs animate-pulse">
      Loading {label}…
    </div>
  );
}

export default function GeneratorView() {
  const dispatch   = useDispatch();
  const { authFetch } = useAuth();
  const platform   = useSelector(selectPlatform);
  const config     = useSelector(selectConfig);
  const status     = useSelector(selectStatus);
  const error      = useSelector(selectError);
  const loading    = status === 'loading';

  const handleGenerate = async () => {
    if (!config.topic.trim()) {
      dispatch(showNotification({ type: 'error', message: 'Please enter a topic!' }));
      return;
    }
    // Pass authFetch so the thunk uses the in-memory token
    const result = await dispatch(generateScript({ platform, config, authFetch }));
    if (generateScript.rejected.match(result)) {
      dispatch(showNotification({ type: 'error', message: result.payload || 'Generation failed' }));
    } else {
      dispatch(showNotification({ type: 'success', message: 'Script generated!' }));
    }
  };

  return (
    <div className="pb-12">
      <div className="px-8 pt-8 pb-0 animate-fade-up">
        <h1 className="font-syne font-extrabold text-2xl mb-1">Script Generator</h1>
        <p className="text-xs text-muted">AI-powered scripts for every platform</p>
      </div>

      <Suspense fallback={<MFEFallback label="Platform Selector" />}>
        <PlatformSelectorMFE selected={platform} onSelect={(p) => dispatch(setPlatform(p))} />
      </Suspense>

      <div className="mx-8 my-6 h-px bg-white/7" />

      <div className="flex items-center gap-2 px-8 mb-4">
        <h2 className="font-syne font-bold text-sm">Configure Script</h2>
        <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border border-white/7 bg-surface2 text-muted">MFE:config</span>
      </div>

      <Suspense fallback={<MFEFallback label="Script Config" />}>
        <ScriptConfigMFE config={config} platform={platform} onChange={(key, value) => dispatch(setConfigField({ key, value }))} />
      </Suspense>

      <div className="px-8 pb-6">
        <button className="btn-generate text-sm font-syne font-bold tracking-wide" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin-slow" />
              Generating your script…
            </span>
          ) : '✦ Generate Script'}
        </button>
        {error && <p className="mt-2 text-xs text-danger text-center">{error}</p>}
      </div>

      <div className="flex items-center gap-2 px-8 mb-4">
        <h2 className="font-syne font-bold text-sm">Script Output</h2>
        <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border border-white/7 bg-surface2 text-muted">MFE:output</span>
      </div>

      <Suspense fallback={<MFEFallback label="Output Viewer" />}>
        <OutputViewerMFE platform={platform} />
      </Suspense>
    </div>
  );
}
