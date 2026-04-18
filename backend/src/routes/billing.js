const express     = require('express');
const router      = express.Router();
const crypto      = require('crypto');
const requireAuth = require('../middleware/requireAuth');
const { createSubscription, cancelSubscription } = require('../services/razorpayService');
const Subscription = require('../db/models/Subscription');
const User         = require('../db/models/User');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4001';

// GET /api/billing/plan
router.get('/plan', requireAuth, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id });

    // ── No subscription or free plan ──────────────────────────────
    if (!sub || sub.plan === 'free') {
      return res.json({ plan: 'free', status: 'inactive', limits: { scriptsPerMonth: 5 } });
    }

    // ── Check if Pro period has actually expired ───────────────────
    const now = new Date();
    const periodExpired = sub.currentPeriodEnd && sub.currentPeriodEnd < now;

    if (periodExpired && sub.status !== 'active') {
      // Period ended and not renewed — treat as free
      // Optionally update DB to reflect this
      await Subscription.findOneAndUpdate(
        { userId: req.user.id },
        { $set: { plan: 'free', status: 'expired' } }
      );
      return res.json({ plan: 'free', status: 'expired', limits: { scriptsPerMonth: 5 } });
    }

    res.json({
      plan:             sub.plan,
      billingPeriod:    sub.billingPeriod,
      status:           sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      renewsAt:         sub.renewsAt,
      cancelledAt:      sub.cancelledAt,
      limits:           { scriptsPerMonth: -1 },
    });
  } catch (err) { next(err); }
});

// POST /api/billing/checkout
router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const { period } = req.body;
    if (!['monthly', 'yearly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Use monthly or yearly.' });
    }

    const user = await User.findById(req.user.id).lean();

    const subscription = await createSubscription({
      period,
      userId: String(req.user.id),
      email:  user.email || '',
      name:   user.name  || '',
    });

    res.json({
      subscriptionId: subscription.id,
      razorpayKeyId:  process.env.RAZORPAY_KEY_ID,
      checkoutUrl:    subscription.short_url || null,
      period,
    });
  } catch (err) { next(err); }
});

// POST /api/billing/verify
// Called from frontend immediately after Razorpay payment success
// Verifies signature and activates subscription in DB without needing webhooks
router.post('/verify', requireAuth, async (req, res, next) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      period,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment fields' });
    }

    // 1. Verify Razorpay signature
    const body     = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = (() => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(expected),
          Buffer.from(razorpay_signature)
        );
      } catch {
        return false;
      }
    })();

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // 2. Activate subscription in DB
    const periodDays = period === 'yearly' ? 365 : 30;
    await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          userId:           req.user.id,
          plan:             'pro',
          status:           'active',
          billingPeriod:    period || 'monthly',
          rzSubscriptionId: razorpay_subscription_id,
          currentPeriodEnd: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000),
          cancelledAt:      null,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[Billing] Subscription activated for user ${req.user.id} — ${period}`);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// POST /api/billing/cancel
router.post('/cancel', requireAuth, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id });
    if (!sub || !sub.rzSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    await cancelSubscription(sub.rzSubscriptionId, true);
    sub.cancelledAt = new Date();
    sub.status      = 'cancelled';
    await sub.save();
    res.json({ message: 'Subscription cancelled. You retain Pro access until end of billing period.' });
  } catch (err) { next(err); }
});

module.exports = router;