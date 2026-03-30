import { configureStore } from '@reduxjs/toolkit';
import scriptReducer  from './slices/scriptSlice';
import uiReducer      from './slices/uiSlice';
import historyReducer from './slices/historySlice';
import directorsReducer from './slices/directorsSlice'

// History is now stored server-side (SQLite) per user.
// No localStorage persistence needed — fetchHistory thunk loads it on login.

const store = configureStore({
  reducer: {
    script:  scriptReducer,
    ui:      uiReducer,
    history: historyReducer,
    directors: directorsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
