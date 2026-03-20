import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import OutputViewer from './OutputViewer';

// Minimal mock store for standalone development
const mockSlice = createSlice({
  name: 'script',
  initialState: {
    result: {
      full: '[HOOK]\nEver wonder why 99% of creators fail in their first year?\n\n[INTRO]\nHey, I\'m back with another deep dive — today we\'re talking about the exact system I use to grow channels from zero.\n\n[MAIN CONTENT]\nFirst: consistency beats perfection. Post before you\'re ready.\nSecond: your hook is everything. You have 3 seconds.\nThird: repurpose ruthlessly — one video, five platforms.\n\n[CTA]\nIf this helped, smash subscribe and hit the bell.\n\n[OUTRO]\nSee you next week with more creator strategies.',
      hooks: [
        '99% of creators give up before they ever go viral — here\'s the 1% secret.',
        'I grew my channel to 100k by breaking every "rule" in the book. Let me show you.',
        'What if I told you posting less actually grew my audience faster?',
      ],
      hashtags: ['#contentcreator', '#youtube', '#growyourchannel', '#socialmedia', '#viral', '#creatortips', '#youtubestrategy', '#digitalmarketing', '#contentmarketing', '#videomarketing'],
      brief: 'This script targets aspiring YouTube creators feeling stuck under 1k subscribers. It uses the Bold Claim hook to create immediate curiosity, then delivers three actionable content pillars in an energetic, no-fluff style. The CTA drives subscription by framing the channel as an ongoing series rather than a one-off video.',
    },
    status: 'succeeded',
    activeTab: 'script',
  },
  reducers: {
    setActiveTab(state, action) { state.activeTab = action.payload; },
  },
});

const mockStore = configureStore({ reducer: { script: mockSlice.reducer } });

function DevPreview() {
  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', paddingTop: 24 }}>
      <p style={{ color: '#666e85', fontSize: 11, marginBottom: 16, paddingLeft: 32 }}>
        [DEV] mfe-output standalone preview (mock data)
      </p>
      <Provider store={mockStore}>
        <OutputViewer platform="youtube" />
      </Provider>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<DevPreview />);
