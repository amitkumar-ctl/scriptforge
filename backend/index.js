require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./src/db/database');
const passport = require('./src/auth/passport');   // registers strategies

const scriptRoutes  = require('./src/routes/script');
const authRoutes    = require('./src/routes/auth');
const healthRoutes  = require('./src/routes/health');
const errorHandler  = require('./src/middleware/errorHandler');
const contactRoutes = require('./src/routes/contact');
const billingRoutes = require('./src/routes/billing');
const webhookRoutes = require('./src/routes/webhook');

const app  = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

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
  credentials: true,
}));

// ─── Raw body for Razorpay webhook signature verification ─────────────
app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  try { req.body = JSON.parse(req.rawBody); } catch { req.body = {}; }
  next();
});

// ─── Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── Rate limiting ────────────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
const genLimiter = rateLimit({
  windowMs: 60_000, max: 5, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many generation requests. Please wait a minute.' }
});

app.use('/api/', apiLimiter);
app.use('/api/script/generate', genLimiter);

// Serve the privacy page
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// ─── Routes ───────────────────────────────────────────────────────────
app.use('/api/health',   healthRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/script',   scriptRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/billing',  billingRoutes);
app.use('/api/webhooks', webhookRoutes);

// ─── Error handler ────────────────────────────────────────────────────
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found` }));

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 ScriptForge Backend → http://localhost:${PORT}`);
      console.log(`🔑 Anthropic:  ${process.env.ANTHROPIC_API_KEY    ? '✅' : '❌ Missing'}`);
      console.log(`💳 Razorpay:   ${process.env.RAZORPAY_KEY_ID      ? '✅' : '❌ Missing'}`);
      console.log(`🔐 Google:     ${process.env.GOOGLE_CLIENT_ID     ? '✅' : '⚠️  Not configured'}`);
      console.log(`🐙 GitHub:     ${process.env.GITHUB_CLIENT_ID     ? '✅' : '⚠️  Not configured'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;