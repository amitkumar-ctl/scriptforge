const express = require('express');
const router = express.Router();
const { generateScript } = require('../services/anthropicService');
const validateScript = require('../middleware/validateScript');
const requireAuth = require('../middleware/requireAuth');
const Script = require('../db/models/Script');
const Subscription = require('../db/models/Subscription');
const UsageCounter = require('../db/models/UsageCounter');

const FREE_LIMIT = 5;
const FREE_HISTORY_DAYS = 7;

// ── Get current month key e.g. "2026-04" ─────────────────────────────
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ── Increment usage counter for this month ────────────────────────────
async function incrementUsage(userId) {
  const month = getCurrentMonth();
  await UsageCounter.findOneAndUpdate(
    { userId, month },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
}

// ── Get usage count for this month ───────────────────────────────────
async function getUsageCount(userId) {
  const month = getCurrentMonth();
  const counter = await UsageCounter.findOne({ userId, month });
  return counter?.count || 0;
}

async function checkPlanLimit(userId) {
  const sub = await Subscription.findOne({ userId });
  const isPro = sub &&
    sub.plan === 'pro' &&
    sub.status === 'active' &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());

  if (isPro) return { allowed: true, isPro: true };

  // ✅ Use counter — not script count
  const count = await getUsageCount(userId);

  if (count >= FREE_LIMIT) {
    return {
      allowed: false, isPro: false, count, limit: FREE_LIMIT,
      error: `Free plan limit reached (${FREE_LIMIT} scripts/month). Upgrade to Pro for unlimited scripts.`,
    };
  }
  return { allowed: true, isPro: false, count, limit: FREE_LIMIT };
}

async function getUserPlan(userId) {
  const sub = await Subscription.findOne({ userId });
  const isPro = sub &&
    sub.plan === 'pro' &&
    sub.status === 'active' &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());
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

    // ✅ Increment counter after successful generation
    if (!planCheck.isPro) {
      await incrementUsage(userId);
    }

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

// POST /api/script/directors-cut — Pro only
router.post('/directors-cut', requireAuth, async (req, res, next) => {
  try {
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
    const result = await generateDirectorsCut({ platform, config, script: script.slice(0, 3000) });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// PATCH /api/script/:id/directors-cut
router.patch('/:id/directors-cut', requireAuth, async (req, res, next) => {
  try {
    const { isPro } = await getUserPlan(req.user.id);
    if (!isPro) {
      return res.status(403).json({ error: 'Pro required', code: 'PRO_REQUIRED' });
    }

    const { directorsCut } = req.body;
    if (!directorsCut) return res.status(400).json({ error: 'directorsCut is required' });

    const script = await Script.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { directorsCut } },
      { returnDocument: 'after' }
    );

    if (!script) return res.status(404).json({ error: 'Script not found or not yours' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/script/history
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.user.id;

    const { isPro } = await getUserPlan(userId);

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
        id: s._id,
        platform: s.platform,
        topic: s.topic,
        config: s.config,
        result: s.result,
        createdAt: s.createdAt,
        directorsCut: s.directorsCut || null,
      })),
      total, limit, offset,
      plan: isPro ? 'pro' : 'free',
      historyDays: isPro ? null : FREE_HISTORY_DAYS,
    });
  } catch (err) { next(err); }
});

// DELETE /api/script/:id - delete a script
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const deleted = await Script.findOneAndDelete({
      _id: req.params.id, userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: 'Script not found or not yours' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;