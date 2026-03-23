import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ScriptConfig from './ScriptConfig';

const defaultConfig = {
  topic: '', audience: '', duration: '5 min',
  tone: 'Energetic', hook: 'Bold Claim',
  language: 'English', cta: 'Subscribe', notes: '',
};

function DevPreview() {
  const [config, setConfig] = useState(defaultConfig);

  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', paddingTop: 24 }}>
      <p style={{ color: '#a8b0c0', fontSize: 11, marginBottom: 16, paddingLeft: 32 }}>
        [DEV] mfe-config standalone preview
      </p>
      <ScriptConfig
        config={config}
        platform="youtube"
        onChange={(key, value) => setConfig((prev) => ({ ...prev, [key]: value }))}
      />
      <pre style={{ color: '#63dca3', fontSize: 10, paddingLeft: 32, marginTop: 16 }}>
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<DevPreview />);
