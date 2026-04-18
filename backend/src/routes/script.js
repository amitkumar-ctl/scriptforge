const express = require('express');
const router = express.Router();
const { generateScript } = require('../services/anthropicService');
const validateScript = require('../middleware/validateScript');
const requireAuth = require('../middleware/requireAuth');
const Script = require('../db/models/Script');
const Subscription = require('../db/models/Subscription');

const FREE_LIMIT = 5;
const FREE_HISTORY_DAYS = 7;

async function checkPlanLimit(userId) {
  const sub = await Subscription.findOne({ userId });
  const isPro = sub && sub.plan === 'pro' && sub.status === 'active';
  if (isPro) return { allowed: true, isPro: true };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await Script.countDocuments({ userId, createdAt: { $gte: startOfMonth } });

  if (count >= FREE_LIMIT) {
    return {
      allowed: false, isPro: false, count, limit: FREE_LIMIT,
      error: `Free plan limit reached (${FREE_LIMIT} scripts/month). Upgrade to Pro for unlimited scripts.`,
    };
  }
  return { allowed: true, isPro: false, count, limit: FREE_LIMIT };
}

// ── helper: get plan for a user ───────────────────────────────────────
async function getUserPlan(userId) {
  const sub = await Subscription.findOne({ userId });
  const isPro = sub && sub.plan === 'pro' && sub.status === 'active';
  return { isPro, sub };
}

// POST /api/script/generate
router.post('/generate', requireAuth, validateScript, async (req, res, next) => {
  try {
    const { platform, config } = req.body;
    const userId = req.user.id;

    const planCheck = await checkPlanLimit(userId);
    if (!planCheck.allowed) {
      return res.status(403).json({
        error: planCheck.error,
        code: 'PLAN_LIMIT_REACHED',
        count: planCheck.count,
        limit: planCheck.limit,
        upgradeUrl: '/pricing',
      });
    }

    const result = await generateScript({ platform, config });

    const script = await Script.create({ userId, platform, topic: config.topic, config, result });

    res.json({
      success: true,
      data: result,
      meta: {
        scriptId: script._id,
        platform,
        generatedAt: script.createdAt,
        plan: planCheck.isPro ? 'pro' : 'free',
        usage: planCheck.isPro ? null : { count: planCheck.count + 1, limit: planCheck.limit },
      },
    });
  } catch (err) { next(err); }
});

// POST /api/script/directors-cut — Pro only ✅
router.post('/directors-cut', requireAuth, async (req, res, next) => {
  try {
    // ── Pro gate ──────────────────────────────────────────────────────
    const { isPro } = await getUserPlan(req.user.id);
    if (!isPro) {
      return res.status(403).json({
        error: "Director's Cut is a Pro feature. Upgrade to unlock it.",
        code: 'PRO_REQUIRED',
        upgradeUrl: '/pricing',
      });
    }

    const { platform, config, script } = req.body;
    if (!script || !platform) {
      return res.status(400).json({ error: 'platform and script are required' });
    }

    const { generateDirectorsCut } = require('../services/anthropicService');
    const trimmedScript = script.slice(0, 3000);
    const result = await generateDirectorsCut({ platform, config, script: trimmedScript });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// PATCH /api/script/:id/directors-cut
router.patch('/:id/directors-cut', requireAuth, async (req, res, next) => {
  try {
    const { isPro } = await getUserPlan(req.user.id);
    if (!isPro) {
      return res.status(403).json({ error: "Pro required", code: 'PRO_REQUIRED' });
    }

    const { directorsCut } = req.body;
    if (!directorsCut) return res.status(400).json({ error: 'directorsCut is required' });

    const script = await Script.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { directorsCut } },
      { new: true }
    );

    if (!script) return res.status(404).json({ error: 'Script not found or not yours' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/script/history — 7-day limit for free users ✅
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.user.id;

    const { isPro } = await getUserPlan(userId);

    // Free users only see last 7 days
    const dateFilter = isPro ? {} : {
      createdAt: { $gte: new Date(Date.now() - FREE_HISTORY_DAYS * 24 * 60 * 60 * 1000) },
    };

    const query = { userId, ...dateFilter };

    const [items, total] = await Promise.all([
      Script.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      Script.countDocuments(query),
    ]);

    res.json({
      items: items.map(s => ({
        id:          s._id,
        platform:    s.platform,
        topic:       s.topic,
        config:      s.config,
        result:      s.result,
        createdAt:   s.createdAt,
        directorsCut: s.directorsCut || null,
      })),
      total, limit, offset,
      plan: isPro ? 'pro' : 'free',
      // tell frontend why history might be limited
      historyDays: isPro ? null : FREE_HISTORY_DAYS,
    });
  } catch (err) { next(err); }
});

// DELETE /api/script/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const deleted = await Script.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Script not found or not yours' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;