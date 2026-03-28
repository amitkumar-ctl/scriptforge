import { createSlice } from '@reduxjs/toolkit';

const PATH_TO_VIEW = {
  '/': 'generator',
  '/history': 'history',
  '/templates': 'templates',
};

function loadPersistedHistoryId() {
  try { return sessionStorage.getItem('sf_active_history_id') || null; }
  catch { return null; }
}


function viewFromPath() {
  return PATH_TO_VIEW[window.location.pathname] ?? 'generator';
}


const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeView: viewFromPath(),   // 'generator' | 'history' | 'templates'
    activeHistoryId: loadPersistedHistoryId(),
    sidebarOpen: true,
    notification: null,        // { type: 'success'|'error', message: string }
  },
  reducers: {
    setActiveView(state, action) {
      state.activeView = action.payload;
      // only clear activeHistoryId when navigating away from generator
      if (action.payload !== 'generator') {
        state.activeHistoryId = null;
        try { sessionStorage.removeItem('sf_active_history_id'); } catch { }
      }
    },
    setActiveHistoryId(state, action) {
      state.activeHistoryId = action.payload;
      try {
        if (action.payload) sessionStorage.setItem('sf_active_history_id', action.payload);
        else sessionStorage.removeItem('sf_active_history_id');
      } catch { }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showNotification(state, action) {
      state.notification = action.payload;
    },
    clearNotification(state) {
      state.notification = null;
    },
  },
});

export const {
  setActiveView,
  toggleSidebar,
  showNotification,
  clearNotification,
  setActiveHistoryId
} = uiSlice.actions;

export const selectActiveHistoryId = (s) => s.ui.activeHistoryId;

export const selectActiveView = (s) => s.ui.activeView;
export const selectSidebarOpen = (s) => s.ui.sidebarOpen;
export const selectNotification = (s) => s.ui.notification;

export default uiSlice.reducer;