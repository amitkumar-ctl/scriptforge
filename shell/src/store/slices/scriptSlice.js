import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:4000';

// ─── Async thunk ────────────────────────────────────────────────────
export const generateScript = createAsyncThunk(
  'script/generate',
  async ({ platform, config }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/script/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, config }),
      });

      if (!res.ok) {
        const err = await res.json();
        return rejectWithValue(err.error || 'Generation failed');
      }

      const data = await res.json();
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message || 'Network error');
    }
  }
);

// ─── Duration defaults per platform ─────────────────────────────────
export const durationsByPlatform = {
  youtube:   ['3 min', '5 min', '8 min', '12 min', '20 min'],
  instagram: ['15 sec', '30 sec', '60 sec', '90 sec'],
  tiktok:    ['15 sec', '30 sec', '60 sec', '3 min'],
  linkedin:  ['1 min', '2 min', '5 min'],
  podcast:   ['5 min', '15 min', '30 min', '60 min'],
  twitter:   ['30 sec', '1 min'],
  custom:    ['1 min', '5 min', '10 min', 'Custom'],
};

// ─── Initial state ───────────────────────────────────────────────────
const initialState = {
  platform: 'youtube',

  config: {
    topic: '',
    audience: '',
    duration: '5 min',
    tone: 'Energetic',
    hook: 'Bold Claim',
    language: 'English',
    cta: 'Subscribe',
    notes: '',
  },

  // Generated output
  result: null,

  // Async status
  status: 'idle',      // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // Which output tab is active
  activeTab: 'script',
};

// ─── Slice ───────────────────────────────────────────────────────────
const scriptSlice = createSlice({
  name: 'script',
  initialState,
  reducers: {
    setPlatform(state, action) {
      state.platform = action.payload;
      const durations = durationsByPlatform[action.payload] || durationsByPlatform.custom;
      state.config.duration = durations[1] || durations[0];
    },
    setConfigField(state, action) {
      const { key, value } = action.payload;
      state.config[key] = value;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    clearResult(state) {
      state.result = null;
      state.status = 'idle';
      state.error = null;
    },
    restoreFromHistory(state, action) {
      const { platform, config, result } = action.payload;
      state.platform = platform;
      state.config = config;
      state.result = result;
      state.status = 'succeeded';
      state.activeTab = 'script';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateScript.pending, (state) => {
        state.status = 'loading';
        state.result = null;
        state.error = null;
      })
      .addCase(generateScript.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.result = action.payload;
        state.activeTab = 'script';
      })
      .addCase(generateScript.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const {
  setPlatform,
  setConfigField,
  setActiveTab,
  clearResult,
  restoreFromHistory,
} = scriptSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────
export const selectPlatform  = (s) => s.script.platform;
export const selectConfig    = (s) => s.script.config;
export const selectResult    = (s) => s.script.result;
export const selectStatus    = (s) => s.script.status;
export const selectError     = (s) => s.script.error;
export const selectActiveTab = (s) => s.script.activeTab;

export default scriptSlice.reducer;
