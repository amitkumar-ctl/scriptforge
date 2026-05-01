# ScriptForge — Microfrontend Architecture

AI-powered script generator built with **Webpack Module Federation**, **React 18**, **Redux Toolkit**, **Tailwind CSS**, and a **Node.js / Express** backend that proxies the Anthropic API.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Shell App  :4001                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │ Topbar   │  │ Sidebar  │  │  Views Router    │   │    │
│  │  │ (shell)  │  │ (shell)  │  │  (shell)         │   │    │
│  │  └──────────┘  └──────────┘  └────────┬─────────┘   │    │
│  │                                       │             │    │
│  │         Lazy-loaded remote MFEs ──────┘             │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │ mfe-platform │  │  mfe-config  │                 │    │ 
│  │  │    :4002     │  │    :4003     │                 │    │
│  │  └──────────────┘  └──────────────┘                 │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │  mfe-output  │  │ mfe-history  │                 │    │
│  │  │    :4004     │  │    :4005     │                 │    │
│  │  └──────────────┘  └──────────────┘                 │    │
│  │                                                     │    │
│  │  ┌────────────────────────────────────────────────┐ │    │
│  │  │         Redux Store (singleton, shared)        │ │    │
│  │  │  script slice │ ui slice │ history slice       │ │    │
│  │  └────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP POST /api/script/generate
                          ▼
          ┌───────────────────────────────┐
          │    Node.js Backend  :4000     │
          │  Express + Helmet + RateLimit │
          │  /api/script/generate         │
          │  /api/health                  │
          └──────────────┬────────────────┘
                         │ Anthropic SDK
                         ▼
              ┌─────────────────────┐
              │   Anthropic API     │
              │  claude-sonnet-4    │
              └─────────────────────┘
```

---

## Port Map

| Service          | Port  | Description                        |
|------------------|-------|------------------------------------|
| `shell`          | 4001  | Host app — orchestrates all MFEs   |
| `mfe-platform`   | 4002  | Platform selector MFE              |
| `mfe-config`     | 4003  | Script configuration form MFE      |
| `mfe-output`     | 4004  | Output viewer MFE                  |
| `mfe-history`    | 4005  | History panel MFE                  |
| `backend`        | 4000  | Node.js API proxy (Anthropic)      |

---

## Folder Structure

```
scriptforge/
├── package.json                  ← Root monorepo (npm workspaces)
│
├── backend/                      ← Node.js + Express
│   ├── package.json
│   ├── .env.example              ← Copy to .env and add your API key
│   └── src/
│       ├── index.js              ← Entry point, Express setup
│       ├── routes/
│       │   ├── health.js         ← GET /api/health
│       │   └── script.js         ← POST /api/script/generate
│       ├── middleware/
│       │   ├── validateScript.js ← Request body validation
│       │   └── errorHandler.js   ← Global error handler
│       └── services/
│           └── anthropicService.js ← Anthropic SDK wrapper
│
├── shell/                        ← Host app (port 3000)
│   ├── package.json
│   ├── webpack.config.js         ← Module Federation host config
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.jsx             ← Deferred bootstrap
│       ├── App.jsx               ← Root: Provider + layout
│       ├── styles/
│       │   └── global.css        ← Tailwind directives + @layer
│       ├── store/
│       │   ├── index.js          ← configureStore
│       │   └── slices/
│       │       ├── scriptSlice.js   ← platform, config, result, generateScript thunk
│       │       ├── uiSlice.js       ← activeView, notifications
│       │       └── historySlice.js  ← history items (auto-saved on generate)
│       ├── components/
│       │   ├── Topbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Notification.jsx
│       │   └── views/
│       │       ├── GeneratorView.jsx  ← Lazy-loads mfe-platform, mfe-config, mfe-output
│       │       ├── HistoryView.jsx    ← Lazy-loads mfe-history
│       │       └── TemplatesView.jsx  ← Shell-owned, no remote MFE
│       └── utils/
│           └── constants.js          ← PLATFORMS, TONES, TEMPLATES (shared source of truth)
│
├── mfe-platform/                 ← Platform Selector MFE (port 3001)
│   ├── package.json
│   ├── webpack.config.js         ← Exposes: ./PlatformSelector
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/index.html
│   └── src/
│       ├── index.jsx             ← Deferred bootstrap
│       ├── bootstrap.jsx         ← Standalone dev preview
│       ├── PlatformSelector.jsx  ← The exposed component
│       └── styles.css
│
├── mfe-config/                   ← Script Config MFE (port 3002)
│   ├── package.json
│   ├── webpack.config.js         ← Exposes: ./ScriptConfig
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/index.html
│   └── src/
│       ├── index.jsx
│       ├── bootstrap.jsx
│       ├── ScriptConfig.jsx      ← Form with all config fields + tone buttons
│       └── styles.css
│
├── mfe-output/                   ← Output Viewer MFE (port 3003)
│   ├── package.json
│   ├── webpack.config.js         ← Exposes: ./OutputViewer
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/index.html
│   └── src/
│       ├── index.jsx
│       ├── bootstrap.jsx         ← Mock Redux store for standalone preview
│       ├── OutputViewer.jsx      ← Reads from shared Redux store
│       └── styles.css
│
└── mfe-history/                  ← History Panel MFE (port 3004)
    ├── package.json
    ├── webpack.config.js         ← Exposes: ./HistoryPanel
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/index.html
    └── src/
        ├── index.jsx
        ├── bootstrap.jsx         ← Mock Redux store for standalone preview
        ├── HistoryPanel.jsx      ← Expandable list, restore/delete, reads Redux
        └── styles.css
```

---

## Quick Start

### 1. Clone & install dependencies

```bash
# Install root tooling (concurrently)
npm install

# Install all workspace dependencies
cd backend      && npm install && cd ..
cd shell        && npm install && cd ..
cd mfe-platform && npm install && cd ..
cd mfe-config   && npm install && cd ..
cd mfe-output   && npm install && cd ..
cd mfe-history  && npm install && cd ..
```

### 2. Configure the backend API key

```bash
cp backend/.env.example backend/.env
# Open backend/.env and set your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start everything

Open **6 terminals** (or use the root `concurrently` script):

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Shell (host)
cd shell && npm run dev

# Terminal 3 — Platform MFE
cd mfe-platform && npm run dev

# Terminal 4 — Config MFE
cd mfe-config && npm run dev

# Terminal 5 — Output MFE
cd mfe-output && npm run dev

# Terminal 6 — History MFE
cd mfe-history && npm run dev
```

Or from the root (requires `concurrently` installed):

```bash
npm run dev
```

Then open **http://localhost:3000**

---

## How Module Federation Works Here

Each MFE is a separate Webpack build that:
1. Runs its own dev server
2. Exposes a named component via `remoteEntry.js`
3. Shares singleton copies of `react`, `react-dom`, `react-redux`, `@reduxjs/toolkit`

The **shell** declares each MFE as a `remote` and lazy-loads components with `React.lazy(() => import('mfePlatform/PlatformSelector'))`.

The **Redux store** lives only in the shell and is provided via `<Provider store={store}>` at the root. Remote MFEs that need store access (`mfe-output`, `mfe-history`) declare `react-redux` as a **singleton shared module** — this means they receive the shell's store instance automatically, not a separate copy.

---

## State Flow

```
User types topic
    │
    ▼
ScriptConfig MFE (mfe-config)
    │ calls onChange(key, value)
    ▼
Shell dispatches setConfigField({ key, value })
    │
    ▼
scriptSlice.config updated in Redux store
    │
    ▼
User clicks Generate
    │
    ▼
Shell dispatches generateScript(thunk)
    │ POST /api/script/generate
    ▼
Node.js backend → Anthropic API → JSON response
    │
    ▼
scriptSlice.result populated
historySlice auto-saves entry (extraReducers)
    │
    ▼
OutputViewer MFE (mfe-output) re-renders
HistoryPanel MFE (mfe-history) re-renders
```

---

## API Reference

### `POST /api/script/generate`

**Request body:**
```json
{
  "platform": "youtube",
  "config": {
    "topic": "How I grew my channel to 100k",
    "audience": "aspiring creators",
    "duration": "8 min",
    "tone": "Energetic",
    "hook": "Bold Claim",
    "language": "English",
    "cta": "Subscribe",
    "notes": "avoid fluff, use bullet points"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "full": "[HOOK]\n...\n\n[INTRO]\n...",
    "hooks": ["Alt hook 1", "Alt hook 2", "Alt hook 3"],
    "hashtags": ["#tag1", "#tag2"],
    "brief": "Short strategy summary..."
  },
  "meta": {
    "platform": "youtube",
    "generatedAt": "2026-03-20T10:00:00.000Z"
  }
}
```

### `GET /api/health`

```json
{
  "status": "ok",
  "service": "scriptforge-backend",
  "timestamp": "...",
  "apiKeyConfigured": true
}
```

---

## Developing a Single MFE in Isolation

Every MFE has a `bootstrap.jsx` with a standalone dev preview. You can work on `mfe-config` alone without starting the shell:

```bash
cd mfe-config && npm run dev
# Open http://localhost:3002
```

The `bootstrap.jsx` files contain mock data / mock Redux stores so each MFE is fully independently testable.

---

## Adding a New MFE

1. Create a new folder `mfe-yourname/`
2. Copy the `package.json`, `webpack.config.js`, `tailwind.config.js`, `postcss.config.js`, `public/index.html` from any existing MFE and adjust:
   - `name` in `package.json`
   - `publicPath` + `port` in `webpack.config.js`
   - `exposes` object in `ModuleFederationPlugin`
3. Add it to the shell's `webpack.config.js` under `remotes`
4. Lazy-import it in the appropriate view file

---

## Tech Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Architecture | Webpack Module Federation             |
| Frontend     | React 18 + React DOM                  |
| State        | Redux Toolkit (shared singleton)      |
| Styling      | Tailwind CSS 3 + PostCSS              |
| Routing      | React Router v6 (shell-only)          |
| Backend      | Node.js + Express 4                   |
| AI           | Anthropic SDK (`claude-sonnet-4`)     |
| Security     | Helmet, express-rate-limit, CORS      |
| Dev tooling  | Webpack 5, Babel 7, nodemon           |
