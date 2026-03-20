require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const scriptRoutes = require('./routes/script');
const healthRoutes = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security middleware ────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) in dev
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// ─── Rate limiting ──────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 10,                   // 10 requests/min per IP (Anthropic API is expensive)
  message: { error: 'Too many requests. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ─── Body parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/script', scriptRoutes);

// ─── Global error handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── 404 ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ScriptForge Backend running at http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Anthropic API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ Loaded' : '❌ Missing!'}\n`);
});

module.exports = app;
