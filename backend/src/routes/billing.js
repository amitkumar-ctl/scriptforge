const express      = require('express');
const router       = express.Router();
const requireAuth  = require('../middleware/requireAuth');
const { createCheckout, cancelSubscription, getVariantId } = require('../services/lemonSequeezyService');
const Subscription = require('../db/models/Subscription');
const User         = require('../db/models/User');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4001';

// GET /api/billing/plan
router.get('/plan', requireAuth, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id });
    if (!sub || sub.plan === 'free') {
      return res.json({ plan: 'free', status: 'inactive', limits: { scriptsPerMonth: 5 } });
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
    const user      = await User.findById(req.user.id).lean();
    const variantId = getVariantId(period);
    const checkoutUrl = await createCheckout({
      variantId,
      userId:     String(req.user.id),
      email:      user.email || '',
      name:       user.name  || '',
      successUrl: `${CLIENT_URL}/app?upgraded=true`,
    });
    res.json({ checkoutUrl });
  } catch (err) { next(err); }
});

// POST /api/billing/cancel
router.post('/cancel', requireAuth, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id });
    if (!sub || !sub.lsSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    await cancelSubscription(sub.lsSubscriptionId);
    sub.cancelledAt = new Date();
    sub.status      = 'cancelled';
    await sub.save();
    res.json({ message: 'Subscription cancelled. You retain Pro access until end of billing period.' });
  } catch (err) { next(err); }
});

module.exports = router;