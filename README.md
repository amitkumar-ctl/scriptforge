# ScriptForge

> AI-powered script generator built with **Webpack Module Federation**, **React 18**, **Redux Toolkit**, **Tailwind CSS**, **MongoDB**, and a **Node.js / Express** backend that proxies the Anthropic API — with full **OAuth authentication**, **Razorpay billing**, and a **Cloudflare Workers** deployment target.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Port Map](#port-map)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Plans & Billing](#plans--billing)
- [API Reference](#api-reference)
- [State Flow](#state-flow)
- [Module Federation Deep Dive](#module-federation-deep-dive)
- [Developing a Single MFE in Isolation](#developing-a-single-mfe-in-isolation)
- [Adding a New MFE](#adding-a-new-mfe)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                          BROWSER                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │               Shell App  :4001                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │    │
│  │  │  Topbar  │  │ Sidebar  │  │   Views Router    │  │    │
│  │  │ (shell)  │  │ (shell)  │  │   (shell)         │  │    │
│  │  └──────────┘  └──────────┘  └────────┬──────────┘  │    │
│  │                                       │             │    │
│  │          Lazy-loaded remote MFEs ─────┘             │    │
│  │  ┌────────────────┐  ┌────────────────┐             │    │
│  │  │  mfe-platform  │  │   mfe-config   │             │    │
│  │  │     :4002      │  │     :4003      │             │    │
│  │  └────────────────┘  └────────────────┘             │    │
│  │  ┌────────────────┐  ┌────────────────┐             │    │
│  │  │   mfe-output   │  │  mfe-history   │             │    │
│  │  │     :4004      │  │     :4005      │             │    │
│  │  └────────────────┘  └────────────────┘             │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │        Redux Store (singleton, shared)        │  │    │
│  │  │  script slice │ ui slice │ history slice      │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │   AuthContext (JWT + refresh token rotation)  │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                 │ HTTP (REST + cookie-based auth)
                 ▼
   ┌─────────────────────────────────────┐
   │     Node.js Backend  :4000          │
   │  Express + Helmet + RateLimit       │
   │  Passport (Google, GitHub OAuth)    │
   │  JWT access tokens + refresh tokens │
   │  Razorpay billing + webhooks        │
   │  Resend transactional email         │
   │  node-cron subscription expiry job  │
   └──────────┬──────────────┬───────────┘
              │              │
     Anthropic SDK        MongoDB (Mongoose)
              │
              ▼
   ┌─────────────────────┐
   │    Anthropic API    │
   │  claude-haiku-4-5   │
   └─────────────────────┘
```

---

## Port Map

| Service        | Port | Description                                      |
| -------------- | ---- | ------------------------------------------------ |
| `backend`      | 4000 | Node.js API — auth, billing, script generation   |
| `shell`        | 4001 | Host app — orchestrates all MFEs, owns the store |
| `mfe-platform` | 4002 | Platform selector MFE                            |
| `mfe-config`   | 4003 | Script configuration form MFE                    |
| `mfe-output`   | 4004 | Output viewer MFE                                |
| `mfe-history`  | 4005 | History panel MFE                                |

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Architecture   | Webpack 5 Module Federation                         |
| Frontend       | React 18 + React DOM                                |
| State          | Redux Toolkit (shared singleton across all MFEs)    |
| Styling        | Tailwind CSS 3 + PostCSS                            |
| Routing        | React Router v6 (shell-only)                        |
| HTTP client    | Axios (with automatic token refresh interceptor)    |
| Backend        | Node.js + Express 4                                 |
| Database       | MongoDB via Mongoose                                |
| Auth           | Passport.js — Google OAuth 2.0, GitHub OAuth        |
| Tokens         | JWT (15 min access) + rotating refresh tokens (7 d) |
| AI             | Anthropic SDK (`claude-haiku-4-5-20251001`)         |
| Billing        | Razorpay subscriptions + webhook verification       |
| Email          | Resend (support tickets, contact form)              |
| Scheduled jobs | node-cron (daily subscription expiry check)         |
| Security       | Helmet, express-rate-limit, CORS allowlist, HMAC    |
| Dev tooling    | Webpack 5, Babel 7, nodemon, concurrently           |
| Deployment     | Cloudflare Workers (shell via Wrangler)             |

---

## Folder Structure

```
scriptforge/
├── package.json                       ← Root monorepo (npm workspaces + concurrently)
│
├── backend/                           ← Node.js + Express API
│   ├── index.js                       ← Entry point, Express setup, route mounting
│   ├── package.json
│   ├── .env                           ← Copy from .env.example, fill in secrets
│   └── src/
│       ├── auth/
│       │   ├── passport.js            ← Google + GitHub strategies
│       │   ├── tokenService.js        ← JWT sign, refresh, rotate, revoke
│       │   ├── cookieHelper.js        ← Set / clear httpOnly token cookies
│       │   └── userService.js         ← getUserById helper
│       ├── db/
│       │   ├── database.js            ← Mongoose connect (singleton)
│       │   └── models/
│       │       ├── User.js
│       │       ├── Script.js
│       │       ├── Subscription.js
│       │       ├── UsageCounter.js    ← Monthly script usage per user
│       │       ├── SupportTicket.js
│       │       └── RefreshToken.js    ← Token family + revocation
│       ├── jobs/
│       │   └── expireSubscriptions.js ← Cron: marks stale Pro subs as expired
│       ├── middleware/
│       │   ├── requireAuth.js         ← JWT bearer validation
│       │   ├── validateScript.js      ← Request body validation
│       │   └── errorHandler.js        ← Global error handler
│       ├── routes/
│       │   ├── health.js              ← GET /api/health
│       │   ├── auth.js                ← OAuth callbacks, /refresh, /me, /logout
│       │   ├── script.js              ← Generate, history, delete, Director's Cut
│       │   ├── billing.js             ← Plan info, checkout, verify, cancel
│       │   ├── webhook.js             ← Razorpay webhook (HMAC-verified)
│       │   ├── support.js             ← Support ticket submission (Resend)
│       │   └── contact.js             ← Contact form (Resend)
│       └── services/
│           ├── anthropicService.js    ← Anthropic SDK wrapper (generate + Director's Cut)
│           └── razorpayService.js     ← Razorpay subscription create / cancel
│
├── shell/                             ← Host MFE (port 4001)
│   ├── webpack.config.js              ← Module Federation host config
│   ├── package.json                   ← Also contains wrangler deploy scripts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/index.html
│   └── src/
│       ├── index.jsx                  ← Deferred bootstrap
│       ├── App.jsx                    ← Provider + AuthProvider + layout + routing
│       ├── auth/
│       │   └── AuthContext.jsx        ← JWT context, token refresh, authFetch helper
│       ├── hooks/
│       │   └── usePlan.js             ← Fetches /api/billing/plan, exposes isPro
│       ├── styles/
│       │   └── global.css             ← Tailwind directives + @layer base
│       ├── store/
│       │   ├── index.js               ← configureStore
│       │   └── slices/
│       │       ├── scriptSlice.js     ← platform, config, result, generateScript thunk
│       │       ├── uiSlice.js         ← activeView, notifications
│       │       └── historySlice.js    ← history items (auto-saved on generate)
│       ├── components/
│       │   ├── Topbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Notification.jsx
│       │   └── views/
│       │       ├── GeneratorView.jsx  ← Lazy-loads mfe-platform, mfe-config, mfe-output
│       │       ├── HistoryView.jsx    ← Lazy-loads mfe-history
│       │       └── TemplatesView.jsx  ← Shell-owned, no remote MFE
│       └── utils/
│           └── constants.js          ← PLATFORMS, TONES, HOOK_STYLES, DURATIONS, TEMPLATES
│
├── mfe-platform/                      ← Platform Selector MFE (port 4002)
│   ├── webpack.config.js              ← Exposes: ./PlatformSelector
│   └── src/
│       ├── index.jsx
│       ├── bootstrap.jsx              ← Standalone dev preview
│       ├── PlatformSelector.jsx       ← The exposed component
│       └── styles.css
│
├── mfe-config/                        ← Script Config MFE (port 4003)
│   ├── webpack.config.js              ← Exposes: ./ScriptConfig
│   └── src/
│       ├── index.jsx
│       ├── bootstrap.jsx
│       ├── ScriptConfig.jsx           ← Form: topic, audience, tone, hook, duration, CTA…
│       └── styles.css
│
├── mfe-output/                        ← Output Viewer MFE (port 4004)
│   ├── webpack.config.js              ← Exposes: ./OutputViewer
│   └── src/
│       ├── index.jsx
│       ├── bootstrap.jsx              ← Mock Redux store for standalone preview
│       ├── OutputViewer.jsx           ← Reads result from shared Redux store
│       └── styles.css
│
└── mfe-history/                       ← History Panel MFE (port 4005)
    ├── webpack.config.js              ← Exposes: ./HistoryPanel
    └── src/
        ├── index.jsx
        ├── bootstrap.jsx              ← Mock Redux store for standalone preview
        ├── HistoryPanel.jsx           ← Expandable list, restore / delete, reads Redux
        └── styles.css
```

---

## Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- A running **MongoDB** instance (local or Atlas)
- An **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- A **Razorpay account** with a subscription plan created — [razorpay.com](https://razorpay.com)
- (Optional) **Google** and/or **GitHub** OAuth apps for social login
- (Optional) A **Resend** account for transactional email

---

## Quick Start

### 1. Clone & install dependencies

```bash
git clone https://github.com/your-org/scriptforge.git
cd scriptforge

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

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Open backend/.env and fill in values — see Environment Variables section below
```

### 3. Start everything

**Option A — single command from root:**

```bash
npm run dev
```

This runs all six services in parallel via `concurrently`.

**Option B — six terminals (recommended for debugging):**

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

Then open **http://localhost:4001**

The backend startup log confirms which services are wired up:

```
🚀 ScriptForge Backend → http://localhost:4000
🔑 Anthropic:  ✅
💳 Razorpay:   ✅
🔐 Google:     ✅
🐙 GitHub:     ✅
✅ MongoDB connected
```

---

## Environment Variables

All variables live in `backend/.env`. Generate strong secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

| Variable                   | Required | Description                                                   |
| -------------------------- | -------- | ------------------------------------------------------------- |
| `PORT`                     | No       | Backend port (default: `4000`)                                |
| `NODE_ENV`                 | No       | `development` or `production`                                 |
| `MONGODB_URI`              | **Yes**  | MongoDB connection string                                     |
| `ANTHROPIC_API_KEY`        | **Yes**  | Your Anthropic secret key                                     |
| `ANTHROPIC_MODEL`          | No       | Model override (default: `claude-haiku-4-5-20251001`)         |
| `JWT_SECRET`               | **Yes**  | Secret for signing access tokens                              |
| `JWT_REFRESH_SECRET`       | **Yes**  | Secret for signing refresh tokens                             |
| `JWT_ACCESS_EXPIRES`       | No       | Access token TTL (default: `15m`)                             |
| `JWT_REFRESH_EXPIRES`      | No       | Refresh token TTL (default: `7d`)                             |
| `CLIENT_URL`               | **Yes**  | Shell origin for OAuth redirects & CORS (e.g. `http://localhost:4001`) |
| `ALLOWED_ORIGINS`          | **Yes**  | Comma-separated list of allowed CORS origins                  |
| `GOOGLE_CLIENT_ID`         | OAuth    | Google OAuth app client ID                                    |
| `GOOGLE_CLIENT_SECRET`     | OAuth    | Google OAuth app client secret                                |
| `GITHUB_CLIENT_ID`         | OAuth    | GitHub OAuth app client ID                                    |
| `GITHUB_CLIENT_SECRET`     | OAuth    | GitHub OAuth app client secret                                |
| `RAZORPAY_KEY_ID`          | Billing  | Razorpay key ID                                               |
| `RAZORPAY_KEY_SECRET`      | Billing  | Razorpay key secret                                           |
| `RAZORPAY_WEBHOOK_SECRET`  | Billing  | Razorpay webhook signing secret                               |
| `RAZORPAY_MONTHLY_PLAN_ID` | Billing  | Razorpay plan ID for monthly subscription                     |
| `RAZORPAY_YEARLY_PLAN_ID`  | Billing  | Razorpay plan ID for yearly subscription                      |
| `RESEND_API_KEY`           | Email    | Resend API key for transactional email                        |
| `SUPPORT_EMAIL`            | Email    | Email address that receives support tickets                   |

> **Note:** The Webpack shell configs inject `__API_BASE_URL__` at build time. Make sure your `webpack.config.js` `DefinePlugin` entry matches `CLIENT_URL` in the backend.

---

## Authentication

ScriptForge uses a **stateless JWT + rotating refresh token** architecture.

### Flow

```
User clicks "Sign in with Google / GitHub"
    │
    ▼
Backend initiates Passport OAuth flow
    │
    ▼
OAuth provider redirects to /api/auth/{provider}/callback
    │
    ▼
Passport strategy upserts User in MongoDB
    │
    ▼
Backend mints access token (15 min) + refresh token (7 days)
    │
    ├─ Sets httpOnly cookies (for server-side requests)
    └─ Redirects to /auth/callback#access=...&refresh=...
                                │
                                ▼
                    Shell's AuthContext parses hash fragment
                    Stores refresh token in localStorage (sf_rt)
                    Schedules proactive token refresh at T-60s
```

### Token Refresh

`AuthContext` schedules a refresh 60 seconds before the access token expires. If a request returns `401 TOKEN_EXPIRED`, `authFetch` automatically calls `/api/auth/refresh`, rotates the refresh token, and retries the original request — completely transparent to calling code.

### Logout

- **Single device:** `POST /api/auth/logout` — revokes the current refresh token family.
- **All devices:** `POST /api/auth/logout-all` — revokes all tokens for the user.

### Using `authFetch`

All authenticated API calls should go through `authFetch` from `useAuth()`:

```jsx
const { authFetch } = useAuth();

// GET
const res = await authFetch('/api/script/history');
console.log(res.data);

// POST
const res = await authFetch('/api/script/generate', {
  method: 'POST',
  body: JSON.stringify({ platform, config }),
});
```

`authFetch` returns an Axios response — access data via `res.data` (no `.json()` needed).

---

## Plans & Billing

ScriptForge has two plans:

| Feature                | Free          | Pro              |
| ---------------------- | ------------- | ---------------- |
| Scripts per month      | 5             | Unlimited        |
| Script history         | Last 7 days   | Full history     |
| Director's Cut feature | ✗             | ✓                |
| Price                  | Free          | Monthly / Yearly |

### Checking the Plan in Components

```jsx
import { usePlan } from '../hooks/usePlan';

function MyComponent() {
  const { isPro, isFree, loading } = usePlan();
  if (loading) return null;
  return isPro ? <ProFeature /> : <UpgradeBanner />;
}
```

### Billing Flow

```
User clicks "Upgrade"
    │
    ▼
POST /api/billing/checkout  { period: 'monthly' | 'yearly' }
    │
    ▼
Backend creates Razorpay subscription
    │
    ▼
Frontend opens Razorpay checkout modal
    │
    ▼
Payment succeeds → POST /api/billing/verify (signature verified server-side)
    │
    ▼
Subscription activated in MongoDB (plan: 'pro', status: 'active')
    │
    ▼
Razorpay also sends webhook to POST /api/webhooks/razorpay (HMAC-verified)
    │
    ▼
Cron job (daily midnight) marks expired subscriptions accordingly
```

### Cancellation

```
POST /api/billing/cancel
```

Cancels the Razorpay subscription at period end. Pro access is retained until `currentPeriodEnd`.

---

## API Reference

All endpoints are prefixed `/api/`. Protected endpoints require a valid `Authorization: Bearer <token>` header (or httpOnly cookie).

### Auth

| Method | Endpoint                    | Auth | Description                              |
| ------ | --------------------------- | ---- | ---------------------------------------- |
| GET    | `/api/auth/google`          | No   | Initiate Google OAuth                    |
| GET    | `/api/auth/google/callback` | No   | Google OAuth callback                    |
| GET    | `/api/auth/github`          | No   | Initiate GitHub OAuth                    |
| GET    | `/api/auth/github/callback` | No   | GitHub OAuth callback                    |
| POST   | `/api/auth/refresh`         | No   | Rotate refresh token, get new access token |
| GET    | `/api/auth/me`              | Yes  | Get current user                         |
| POST   | `/api/auth/logout`          | Yes  | Logout current device                    |
| POST   | `/api/auth/logout-all`      | Yes  | Logout all devices                       |

### Script Generation

#### `POST /api/script/generate`

Enforces plan limits (5/month on free). Increments `UsageCounter` on success.

**Request:**
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

**Response (200):**
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
    "scriptId": "664abc...",
    "platform": "youtube",
    "generatedAt": "2026-05-01T10:00:00.000Z",
    "plan": "free",
    "usage": { "count": 3, "limit": 5 }
  }
}
```

**Response (403 — limit reached):**
```json
{
  "error": "Free plan limit reached (5 scripts/month). Upgrade to Pro for unlimited scripts.",
  "code": "PLAN_LIMIT_REACHED",
  "count": 5,
  "limit": 5,
  "upgradeUrl": "/pricing"
}
```

#### `POST /api/script/directors-cut` _(Pro only)_

Generates an enhanced, production-ready version of an existing script.

**Request:**
```json
{
  "platform": "youtube",
  "config": { "...": "same config as generate" },
  "script": "Your existing generated script text..."
}
```

**Response (200):**
```json
{ "success": true, "data": { "directorsCut": "Enhanced script..." } }
```

**Response (403):**
```json
{ "error": "Director's Cut is a Pro feature. Upgrade to unlock it.", "code": "PRO_REQUIRED" }
```

#### `PATCH /api/script/:id/directors-cut` _(Pro only)_

Persists a Director's Cut to an existing Script document.

#### `GET /api/script/history`

Returns paginated script history. Free users see only the last 7 days.

**Query params:** `limit` (max 100, default 20), `offset` (default 0)

```json
{
  "items": [{ "id": "...", "platform": "youtube", "topic": "...", "result": {}, "createdAt": "..." }],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "plan": "free",
  "historyDays": 7
}
```

#### `DELETE /api/script/:id`

Deletes a script owned by the authenticated user.

### Billing

| Method | Endpoint                  | Auth | Description                                      |
| ------ | ------------------------- | ---- | ------------------------------------------------ |
| GET    | `/api/billing/plan`       | Yes  | Current plan, status, limits, renewal date       |
| POST   | `/api/billing/checkout`   | Yes  | Create Razorpay subscription; returns `subscriptionId` |
| POST   | `/api/billing/verify`     | Yes  | Verify payment signature; activate subscription  |
| POST   | `/api/billing/cancel`     | Yes  | Cancel subscription at period end                |

### Other

| Method | Endpoint                    | Auth | Description                 |
| ------ | --------------------------- | ---- | --------------------------- |
| GET    | `/api/health`               | No   | Health check + API key status |
| POST   | `/api/support/ticket`       | Yes  | Submit support ticket (saved to DB + emailed via Resend) |
| POST   | `/api/contact`              | No   | Public contact form (Resend) |
| POST   | `/api/webhooks/razorpay`    | No*  | Razorpay event webhook (HMAC-verified) |

*Verified via `x-razorpay-signature` header, not JWT.

### `GET /api/health`

```json
{
  "status": "ok",
  "service": "scriptforge-backend",
  "timestamp": "2026-05-01T10:00:00.000Z",
  "apiKeyConfigured": true
}
```

---

## State Flow

```
User types topic in ScriptConfig MFE
    │
    ▼ onChange(key, value)
Shell dispatches setConfigField({ key, value })
    │
    ▼
scriptSlice.config updated in Redux store
    │
User clicks "Generate"
    │
    ▼
Shell dispatches generateScript thunk
    │ authFetch POST /api/script/generate
    ▼
backend validates JWT → checks plan limit → calls Anthropic
    │
    ▼
scriptSlice.result populated
historySlice auto-saves entry via extraReducers
    │
    ▼
OutputViewer MFE (mfe-output) re-renders ← shared Redux store
HistoryPanel MFE (mfe-history) re-renders ← shared Redux store
```

The Redux store lives exclusively in the shell and is provided via `<Provider store={store}>` at the root. Remote MFEs that need store access declare `react-redux` and `@reduxjs/toolkit` as **singleton shared modules** in their `ModuleFederationPlugin` config — they receive the shell's store instance automatically.

---

## Module Federation Deep Dive

Each MFE is a separate Webpack build that:

1. Runs its own dev server
2. Exposes a named component via `remoteEntry.js`
3. Declares shared singleton packages:

```js
// In each MFE's webpack.config.js
shared: {
  react:              { singleton: true, requiredVersion: deps.react },
  'react-dom':        { singleton: true, requiredVersion: deps['react-dom'] },
  'react-redux':      { singleton: true, requiredVersion: deps['react-redux'] },
  '@reduxjs/toolkit': { singleton: true, requiredVersion: deps['@reduxjs/toolkit'] },
}
```

The shell declares each MFE as a `remote`:

```js
// shell/webpack.config.js
remotes: {
  mfePlatform: 'mfePlatform@http://localhost:4002/remoteEntry.js',
  mfeConfig:   'mfeConfig@http://localhost:4003/remoteEntry.js',
  mfeOutput:   'mfeOutput@http://localhost:4004/remoteEntry.js',
  mfeHistory:  'mfeHistory@http://localhost:4005/remoteEntry.js',
}
```

And lazy-loads components:

```jsx
const PlatformSelector = React.lazy(() => import('mfePlatform/PlatformSelector'));
const ScriptConfig     = React.lazy(() => import('mfeConfig/ScriptConfig'));
const OutputViewer     = React.lazy(() => import('mfeOutput/OutputViewer'));
const HistoryPanel     = React.lazy(() => import('mfeHistory/HistoryPanel'));
```

> **Why deferred bootstrap?** Each MFE has an `index.jsx` that dynamically imports `bootstrap.jsx`. This ensures the shared module negotiation completes before any component code runs, avoiding version conflicts.

---

## Developing a Single MFE in Isolation

Every MFE ships a `bootstrap.jsx` with a standalone dev preview and a mock Redux store. You can work on any MFE without starting the shell or other remotes:

```bash
cd mfe-config && npm run dev
# Open http://localhost:4003
```

The `bootstrap.jsx` files contain mock data / mock Redux stores, making each MFE fully independently testable. `mfe-output` and `mfe-history` also mock the Redux store shape so UI state can be verified standalone.

---

## Adding a New MFE

1. Create `mfe-yourname/` and copy the boilerplate from any existing MFE:
   - `package.json` — update `name`
   - `webpack.config.js` — update `name`, `port`, `publicPath`, and `exposes`
   - `tailwind.config.js`, `postcss.config.js`, `public/index.html`

2. Register it in `shell/webpack.config.js`:
   ```js
   // Under ModuleFederationPlugin → remotes
   mfeYourname: 'mfeYourname@http://localhost:4006/remoteEntry.js',
   ```

3. Lazy-import it in the appropriate shell view:
   ```jsx
   const YourComponent = React.lazy(() => import('mfeYourname/YourComponent'));
   ```

4. If the MFE reads from the Redux store, declare the shared singletons in its `webpack.config.js` as shown above.

---

## Deployment

### Backend (Node.js)

Deploy to any Node.js host (Railway, Render, Fly.io, EC2, etc.):

```bash
cd backend && npm start
```

Ensure all environment variables are set in the host's secrets manager. MongoDB must be reachable (use MongoDB Atlas for zero-ops).

### Shell (Cloudflare Workers via Wrangler)

The shell is configured for Cloudflare Workers deployment:

```bash
cd shell

# Preview locally with Workers runtime
npm run preview   # wrangler dev

# Deploy to production
npm run deploy    # wrangler deploy
```

Update `CLIENT_URL` and `ALLOWED_ORIGINS` in `backend/.env` to match your production shell URL.

### Remote MFEs

Each MFE is a static Webpack bundle. Deploy `dist/` to any CDN (Cloudflare Pages, Vercel, S3 + CloudFront). Update the remote URLs in `shell/webpack.config.js` to point to the CDN origins before deploying the shell.

---

## Troubleshooting

**`remoteEntry.js` 404 in browser console**
All MFE dev servers must be running before the shell loads. Start all six services and hard-refresh.

**`Shared module is not available for eager consumption`**
This happens when a component at the top of an MFE uses a shared package before the federation handshake completes. Make sure each MFE entry point is `index.jsx` with a dynamic import of `bootstrap.jsx`, not the reverse.

**`MongoDB connection failed: MONGODB_URI is not set`**
Copy `.env.example` to `.env` in `backend/` and set `MONGODB_URI`.

**OAuth redirect loops (`/login?error=oauth_failed`)**
- Confirm `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (or GitHub equivalents) are correct.
- Verify the callback URL registered in the OAuth app matches exactly: `http://localhost:4000/api/auth/google/callback`.
- Check that `CLIENT_URL` in `.env` matches the shell origin (`http://localhost:4001`).

**`CORS blocked: http://localhost:4001`**
Add the origin to `ALLOWED_ORIGINS` in `backend/.env`:
```
ALLOWED_ORIGINS=http://localhost:4001,http://localhost:4002,...
```

**`401 TOKEN_EXPIRED` on every request after refresh**
Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are stable between restarts (not randomly generated at startup).

**Razorpay webhook signature mismatch**
Set `RAZORPAY_WEBHOOK_SECRET` in `.env` to match the secret configured in the Razorpay dashboard. In development without a public URL, test with `ngrok` or disable verification temporarily (only in dev).

**Rate limit hit during development (`429 Too Many Requests`)**
The generation endpoint is limited to 5 requests/minute. Wait 60 seconds or temporarily raise `max` in the `genLimiter` config in `backend/index.js`.