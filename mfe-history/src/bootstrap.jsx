import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import HistoryPanel from './HistoryPanel';

const mockSlice = createSlice({
  name: 'history',
  initialState: {
    items: [
      {
        id: 1,
        platform: 'youtube',
        createdAt: new Date().toISOString(),
        config: { topic: 'How I made $10k with AI in 30 days', duration: '8 min', tone: 'Energetic', hook: 'Bold Claim', language: 'English', cta: 'Subscribe' },
        result: {
          full: '[HOOK]\nEver wonder why 99% of creators fail?\n\n[INTRO]\nToday I\'m breaking down my exact AI monetisation system.\n\n[MAIN CONTENT]\nStep 1: Pick a niche. Step 2: Use AI tools. Step 3: Monetize fast.\n\n[CTA]\nSubscribe for weekly AI money tips.\n\n[OUTRO]\nSee you next week!',
          hooks: ['The AI income secret nobody shares.'],
          hashtags: ['#ai', '#makemoney', '#youtube'],
          brief: 'Energetic YouTube tutorial targeting aspiring entrepreneurs.',
        },
      },
      {
        id: 2,
        platform: 'tiktok',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        config: { topic: 'Morning routine that changed my life', duration: '60 sec', tone: 'Funny', hook: 'Story Drop', language: 'English', cta: 'Follow' },
        result: {
          full: '[HOOK]\nI woke up at 5am for 30 days straight.\n\n[MAIN CONTENT]\nDay 1: Pure suffering. Day 15: Getting better. Day 30: Changed everything.\n\n[CTA]\nFollow for more weird experiments.',
          hooks: ['Nobody told me mornings could hit like this.'],
          hashtags: ['#morningroutine', '#tiktok', '#viral'],
          brief: 'Short-form TikTok with story hook.',
        },
      },
    ],
  },
  reducers: {
    removeHistoryItem(state, action) {
      state.items = state.items.filter((_, i) => i !== action.payload);
    },
    clearHistory(state) { state.items = []; },
  },
});

const mockStore = configureStore({ reducer: { history: mockSlice.reducer } });

function DevPreview() {
  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', paddingTop: 24 }}>
      <p style={{ color: '#a8b0c0', fontSize: 11, marginBottom: 16, paddingLeft: 32 }}>
        [DEV] mfe-history standalone preview (mock data)
      </p>
      <Provider store={mockStore}>
        <HistoryPanel onRestore={(item) => console.log('Restore:', item)} />
      </Provider>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<DevPreview />);
