import { createSlice } from '@reduxjs/toolkit';
import { generateScript } from './scriptSlice';

const MAX_HISTORY = 20;

const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: [],   // [{ id, platform, config, result, createdAt }]
  },
  reducers: {
    removeHistoryItem(state, action) {
      state.items = state.items.filter((_, i) => i !== action.payload);
    },
    clearHistory(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // Auto-save to history every time a script is successfully generated
    builder.addCase(generateScript.fulfilled, (state, action) => {
      // Pull platform & config from the action meta (passed as arg)
      const { platform, config } = action.meta.arg;
      const entry = {
        id: Date.now(),
        platform,
        config: { ...config },
        result: action.payload,
        createdAt: new Date().toISOString(),
      };
      state.items = [entry, ...state.items].slice(0, MAX_HISTORY);
    });
  },
});

export const { removeHistoryItem, clearHistory } = historySlice.actions;

export const selectHistory      = (s) => s.history.items;
export const selectHistoryCount = (s) => s.history.items.length;

export default historySlice.reducer;
