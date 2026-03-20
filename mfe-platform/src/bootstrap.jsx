import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import PlatformSelector from './PlatformSelector';

function DevPreview() {
  const [selected, setSelected] = useState('youtube');
  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', padding: 24 }}>
      <p style={{ color: '#666e85', fontSize: 11, marginBottom: 16 }}>
        [DEV] mfe-platform standalone preview — selected: <strong style={{ color: '#63dca3' }}>{selected}</strong>
      </p>
      <PlatformSelector selected={selected} onSelect={setSelected} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<DevPreview />);
