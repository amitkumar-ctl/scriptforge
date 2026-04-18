import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateScript } from './scriptSlice';

const MAX_LOCAL = 20;

// ─── Thunk: fetch history from API ───────────────────────────────────
export const fetchHistory = createAsyncThunk(
  'history/fetch',
  async ({ authFetch }, { rejectWithValue }) => {
    try {
      const res = await authFetch('/api/script/history');
      const data = res.data; // ✅ no await, no res.ok
      return data.items;
    } catch (e) {
      const message = e.response?.data?.error || e.message || 'Failed to load history';
      return rejectWithValue(message);
    }
  }
);

// ─── Thunk: delete a script from API ─────────────────────────────────
export const deleteScript = createAsyncThunk(
  'history/delete',
  async ({ id, authFetch }, { rejectWithValue }) => {
    try {
      await authFetch(`/api/script/${id}`, { method: 'DELETE' }); // ✅ no need to read response
      return id;
    } catch (e) {
      const message = e.response?.data?.error || e.message || 'Failed to delete';
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────
const historySlice = createSlice({
  name: 'history',
  initialState: {
    items:  [],
    status: 'idle',
    error:  null,
  },
  reducers: {
    clearHistory(state) {
      state.items  = [];
      state.status = 'idle';
    },
    prependItem(state, action) {
      state.items = [action.payload, ...state.items].slice(0, MAX_LOCAL);
    },
  },
  extraReducers: (builder) => {
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

    builder
      .addCase(deleteScript.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });

    builder.addCase(generateScript.fulfilled, (state, action) => {
      const { platform, config } = action.meta.arg;
      const entry = {
        id:        `temp-${Date.now()}`,
        platform,
        topic:     config.topic,
        config:    { ...config },
        result:    action.payload.result,
        createdAt: new Date().toISOString(),
      };
      state.items = [entry, ...state.items].slice(0, MAX_LOCAL);
    });
  },
});

export const { clearHistory, prependItem } = historySlice.actions;

export const selectHistory       = (s) => s.history.items;
export const selectHistoryCount  = (s) => s.history.items.length;
export const selectHistoryStatus = (s) => s.history.status;

export default historySlice.reducer;