import { createSlice } from '@reduxjs/toolkit';
import { generateScript, restoreFromHistory } from './scriptSlice';

const STORAGE_KEY = 'sf_directors_map';

function getScriptHash(scriptFull) {
  if (!scriptFull) return null;
  return scriptFull.slice(0, 120).replace(/\s+/g, ' ').trim();
}

function loadMap() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveMap(map) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch {}
}

function getCurrentScriptHash() {
  try {
    const restored = sessionStorage.getItem('sf_restored');
    if (restored) {
      const parsed = JSON.parse(restored);
      return getScriptHash(parsed?.result?.full);
    }
  } catch {}
  return null;
}

const initialHash   = getCurrentScriptHash();
const initialMap    = loadMap();
const initialResult = initialHash ? (initialMap[initialHash] || null) : null;

const directorsSlice = createSlice({
  name: 'directors',
  initialState: {
    result:      initialResult,
    status:      initialResult ? 'succeeded' : 'idle',
    currentHash: initialHash,
  },
  reducers: {
    setResult(state, action) {
      const { result, scriptHash } = action.payload;
      state.result      = result;
      state.currentHash = scriptHash;
      state.status      = 'succeeded';
      // save into the map
      const map = loadMap();
      map[scriptHash] = result;
      saveMap(map);
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    clearDirectorsCut(state) {
      state.result      = null;
      state.currentHash = null;
      state.status      = 'idle';
    },
  },
  extraReducers: (builder) => {
    // New generation — clear current view only, don't wipe the map
    builder.addCase(generateScript.pending, (state) => {
      state.result      = null;
      state.currentHash = null;
      state.status      = 'idle';
    });

    // Restoring history — look up the map for this script's cut
    builder.addCase(restoreFromHistory, (state, action) => {
      const hash = getScriptHash(action.payload?.result?.full);
      state.currentHash = hash;
      if (hash) {
        const map = loadMap();
        state.result = map[hash] || null;
        state.status = map[hash] ? 'succeeded' : 'idle';
      } else {
        state.result = null;
        state.status = 'idle';
      }
    });
  },
});

export const { setResult, setStatus, clearDirectorsCut } = directorsSlice.actions;
export default directorsSlice.reducer;