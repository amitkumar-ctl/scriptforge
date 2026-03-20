import { configureStore } from '@reduxjs/toolkit';
import scriptReducer from './slices/scriptSlice';
import uiReducer from './slices/uiSlice';
import historyReducer from './slices/historySlice';

const store = configureStore({
  reducer: {
    script: scriptReducer,
    ui: uiReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
