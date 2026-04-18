const express      = require('express');
const router       = express.Router();
const crypto       = require('crypto');
const Subscription = require('../db/models/Subscription');

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * Razorpay sends a SHA-256 HMAC of the raw request body signed with
 * RAZORPAY_WEBHOOK_SECRET.  The signature is in the header
 * `x-razorpay-signature`.
 */
function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) return true; // skip verification in dev if secret not set
  const hmac   = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

function getBillingPeriod(planId) {
  if (planId === process.env.RAZORPAY_YEARLY_PLAN_ID)  return 'yearly';
  if (planId === process.env.RAZORPAY_MONTHLY_PLAN_ID) return 'monthly';
  return 'monthly';
}

// POST /api/webhooks/razorpay
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return res.status(401).json({ error: 'Missing signature' });

    if (!verifySignature(req.rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event     = req.body;
    const eventName = event.event;            // e.g. "subscription.activated"
    const payload   = event.payload;

    console.log(`[Webhook] Razorpay event: ${eventName}`);

    // ── subscription events ─────────────────────────────────────────
    if (payload?.subscription) {
      const sub    = payload.subscription.entity;
      const userId = sub.notes?.user_id;

      if (!userId) {
        console.warn('[Webhook] No user_id in subscription notes');
        return res.json({ received: true });
      }

      const billingPeriod = getBillingPeriod(sub.plan_id);

      switch (eventName) {
        case 'subscription.activated':
        case 'subscription.charged':
          await Subscription.findOneAndUpdate({ userId }, {
            userId,
            plan:               'pro',
            billingPeriod,
            rzSubscriptionId:   sub.id,
            rzCustomerId:       sub.customer_id || null,
            rzPlanId:           sub.plan_id,
            status:             'active',
            currentPeriodStart: sub.current_start  ? new Date(sub.current_start  * 1000) : new Date(),
            currentPeriodEnd:   sub.current_end    ? new Date(sub.current_end    * 1000) : null,
            renewsAt:           sub.charge_at      ? new Date(sub.charge_at      * 1000) : null,
            cancelledAt:        null,
          }, { upsert: true, new: true });
          break;

        case 'subscription.pending':
        case 'subscription.halted':
          await Subscription.findOneAndUpdate({ userId }, { status: 'past_due' });
          break;

        case 'subscription.cancelled':
          await Subscription.findOneAndUpdate({ userId }, {
            plan:        'free',
            status:      'cancelled',
            cancelledAt: new Date(),
          });
          break;

        case 'subscription.expired':
          await Subscription.findOneAndUpdate({ userId }, {
            plan:   'free',
            status: 'expired',
          });
          break;

        case 'subscription.paused':
          await Subscription.findOneAndUpdate({ userId }, { status: 'paused' });
          break;

        case 'subscription.resumed':
          await Subscription.findOneAndUpdate({ userId }, { status: 'active', plan: 'pro', cancelledAt: null });
          break;

        default:
          console.log(`[Webhook] Unhandled event: ${eventName}`);
      }

      return res.json({ received: true });
    }

    // ── payment events (optional — keep for future use) ─────────────
    if (payload?.payment) {
      const payment = payload.payment.entity;
      console.log(`[Webhook] Payment event: ${eventName}, status: ${payment.status}`);
      return res.json({ received: true });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;