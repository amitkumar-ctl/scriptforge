import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateScript } from './scriptSlice';

const MAX_LOCAL = 20; // max items kept in Redux memory

// ─── Thunk: fetch history from API ───────────────────────────────────
export const fetchHistory = createAsyncThunk(
  'history/fetch',
  async ({ authFetch }, { rejectWithValue }) => {
    try {
      const res = await authFetch('/api/script/history?limit=50');
      if (!res.ok) {
        const err = await res.json();
        return rejectWithValue(err.error || 'Failed to load history');
      }
      const data = await res.json();
      return data.items;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ─── Thunk: delete a script from API ─────────────────────────────────
export const deleteScript = createAsyncThunk(
  'history/delete',
  async ({ id, authFetch }, { rejectWithValue }) => {
    try {
      const res = await authFetch(`/api/script/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        return rejectWithValue(err.error || 'Failed to delete');
      }
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────
const historySlice = createSlice({
  name: 'history',
  initialState: {
    items:  [],
    status: 'idle',   // 'idle' | 'loading' | 'succeeded' | 'failed'
    error:  null,
  },
  reducers: {
    clearHistory(state) {
      state.items  = [];
      state.status = 'idle';
    },
    // Optimistic prepend when a new script is generated (before API confirms)
    prependItem(state, action) {
      state.items = [action.payload, ...state.items].slice(0, MAX_LOCAL);
    },
  },
  extraReducers: (builder) => {
    // Fetch history
    builder
      .addCase(fetchHistory.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items  = action.payload;
      })
      .addCase(fetchHistory.rejected,  (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    // Delete script
    builder
      .addCase(deleteScript.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });

    // Auto-prepend to local list when generateScript succeeds
    // The real ID will come in on the next fetchHistory call
    builder.addCase(generateScript.fulfilled, (state, action) => {
      const { platform, config } = action.meta.arg;
      const entry = {
        id:        `temp-${Date.now()}`,
        platform,
        topic:     config.topic,
        config:    { ...config },
        result:    action.payload,
        createdAt: new Date().toISOString(),
      };
      state.items = [entry, ...state.items].slice(0, MAX_LOCAL);
    });
  },
});

export const { clearHistory, prependItem } = historySlice.actions;

export const selectHistory      = (s) => s.history.items;
export const selectHistoryCount = (s) => s.history.items.length;
export const selectHistoryStatus = (s) => s.history.status;

export default historySlice.reducer;
