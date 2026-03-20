import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeView: 'generator',   // 'generator' | 'history' | 'templates'
    sidebarOpen: true,
    notification: null,        // { type: 'success'|'error', message: string }
  },
  reducers: {
    setActiveView(state, action) {
      state.activeView = action.payload;
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
} = uiSlice.actions;

export const selectActiveView    = (s) => s.ui.activeView;
export const selectSidebarOpen   = (s) => s.ui.sidebarOpen;
export const selectNotification  = (s) => s.ui.notification;

export default uiSlice.reducer;
