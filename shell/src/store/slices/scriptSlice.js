import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

function loadPersistedScript() {
  try {
    const saved = sessionStorage.getItem('sf_restored');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

const persisted = loadPersistedScript();

export const generateScript = createAsyncThunk(
  'script/generate',
  async ({ platform, config, authFetch }, { rejectWithValue }) => {
    try {
      const res = await authFetch('/api/script/generate', {
        method: 'POST',
        body: JSON.stringify({ platform, config }),
      });
      if (!res.ok) {
        const err = await res.json();
        return rejectWithValue(err.error || 'Generation failed');
      }
      const data = await res.json();
      return {
        result:   data.data,
        scriptId: data.meta.scriptId,
      };
    } catch (e) {
      return rejectWithValue(e.message || 'Network error');
    }
  }
);

export const durationsByPlatform = {
  youtube:   ['3 min', '5 min', '8 min', '12 min', '20 min'],
  instagram: ['15 sec', '30 sec', '60 sec', '90 sec'],
  tiktok:    ['15 sec', '30 sec', '60 sec', '3 min'],
  linkedin:  ['1 min', '2 min', '5 min'],
  podcast:   ['5 min', '15 min', '30 min', '60 min'],
  twitter:   ['30 sec', '1 min'],
  custom:    ['1 min', '5 min', '10 min', 'Custom'],
};

const initialState = {
  platform: persisted?.platform || 'youtube',
  config:   persisted?.config || {
    topic: '', audience: '', duration: '5 min',
    tone: 'Energetic', hook: 'Bold Claim',
    language: 'English', cta: 'Subscribe', notes: '',
  },
  result:   persisted?.result    || null,
  scriptId: persisted?.scriptId  || null,
  status:   persisted ? 'succeeded' : 'idle',
  error:    null,
  activeTab: 'script',
};

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
      state.result   = null;
      state.scriptId = null;
      state.status   = 'idle';
      state.error    = null;
      try { sessionStorage.removeItem('sf_restored'); } catch {}
    },
    restoreFromHistory(state, action) {
      const { platform, config, result, id, _id, directorsCut } = action.payload;
      const scriptId = id || (_id ? _id.toString() : null); // ← fix Bug 1
      state.platform  = platform;
      state.config    = config;
      state.result    = result;
      state.scriptId  = scriptId;
      state.status    = 'succeeded';
      state.activeTab = 'script';
      try {
        sessionStorage.setItem('sf_restored', JSON.stringify({ platform, config, result, scriptId }));
      } catch {}
    },
    resetConfig(state) {
      state.platform  = 'youtube';
      state.scriptId  = null;
      state.config    = {
        topic: '', audience: '', duration: '5 min',
        tone: 'Energetic', hook: 'Bold Claim',
        language: 'English', cta: 'Subscribe', notes: '',
      };
      state.result    = null;
      state.status    = 'idle';
      state.error     = null;
      try { sessionStorage.removeItem('sf_restored'); } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateScript.pending, (state) => {
        state.status   = 'loading';
        state.result   = null;
        state.scriptId = null;
        state.error    = null;
      })
      .addCase(generateScript.fulfilled, (state, action) => {
        state.status   = 'succeeded';
        state.result   = action.payload.result;   // ← fix Bug 2
        state.scriptId = action.payload.scriptId;
        state.activeTab = 'script';
      })
      .addCase(generateScript.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload || 'Unknown error';
      });
  },
});

export const {
  setPlatform, setConfigField, setActiveTab,
  clearResult, restoreFromHistory, resetConfig,
} = scriptSlice.actions;

export const selectPlatform  = (s) => s.script.platform;
export const selectConfig    = (s) => s.script.config;
export const selectResult    = (s) => s.script.result;
export const selectStatus    = (s) => s.script.status;
export const selectError     = (s) => s.script.error;
export const selectActiveTab = (s) => s.script.activeTab;
export const selectScriptId  = (s) => s.script.scriptId;

export default scriptSlice.reducer;