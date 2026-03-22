require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./db/database');
const passport   = require('./auth/passport');   // registers strategies

const scriptRoutes = require('./routes/script');
const authRoutes   = require('./routes/auth');
const healthRoutes = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Security ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // needed for OAuth popups
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,   // required for cookies
}));

// ─── Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── Rate limiting ────────────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
const genLimiter = rateLimit({ windowMs: 60_000, max: 5,  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many generation requests. Please wait a minute.' }
});

app.use('/api/', apiLimiter);
app.use('/api/script/generate', genLimiter);

// ─── Routes ───────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth',   authRoutes);
app.use('/api/script', scriptRoutes);

// ─── Error handler ────────────────────────────────────────────────────
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found` }));



connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 ScriptForge Backend → http://localhost:${PORT}`);
      console.log(`🔑 API Key:  ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌ Missing'}`);
      console.log(`🔐 Google:   ${process.env.GOOGLE_CLIENT_ID  ? '✅' : '⚠️  Not configured'}`);
      console.log(`🐙 GitHub:   ${process.env.GITHUB_CLIENT_ID  ? '✅' : '⚠️  Not configured'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
