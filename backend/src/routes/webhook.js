const express      = require('express');
const router       = express.Router();
const crypto       = require('crypto');
const Subscription = require('../db/models/Subscription');

const WEBHOOK_SECRET     = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const MONTHLY_VARIANT_ID = process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID;
const YEARLY_VARIANT_ID  = process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID;

function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) return true;
  const hmac   = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

function getBillingPeriod(variantId) {
  if (String(variantId) === String(YEARLY_VARIANT_ID))  return 'yearly';
  if (String(variantId) === String(MONTHLY_VARIANT_ID)) return 'monthly';
  return 'monthly';
}

router.post('/lemonsqueezy', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    if (!signature) return res.status(401).json({ error: 'Missing signature' });

    if (!verifySignature(req.rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event     = req.body;
    const meta      = event.meta;
    const data      = event.data;
    const eventName = meta?.event_name;
    const userId    = meta?.custom_data?.user_id;

    console.log(`[Webhook] Event: ${eventName}`);

    if (!userId) return res.status(400).json({ error: 'No user_id in custom_data' });

    const attrs     = data?.attributes || {};
    const variantId = attrs.variant_id || attrs.first_subscription_item?.variant_id;

    switch (eventName) {
      case 'subscription_created':
        await Subscription.findOneAndUpdate({ userId }, {
          userId,
          plan:               'pro',
          billingPeriod:      getBillingPeriod(variantId),
          lsCustomerId:       String(attrs.customer_id),
          lsSubscriptionId:   String(data.id),
          lsVariantId:        String(variantId),
          status:             'active',
          currentPeriodStart: attrs.created_at ? new Date(attrs.created_at) : new Date(),
          currentPeriodEnd:   attrs.ends_at    ? new Date(attrs.ends_at)    : null,
          renewsAt:           attrs.renews_at  ? new Date(attrs.renews_at)  : null,
          cancelledAt:        null,
        }, { upsert: true, new: true });
        break;

      case 'subscription_updated':
        const updateData = {
          status:           attrs.status,
          currentPeriodEnd: attrs.ends_at   ? new Date(attrs.ends_at)   : null,
          renewsAt:         attrs.renews_at ? new Date(attrs.renews_at) : null,
        };
        if (attrs.status === 'active') { updateData.plan = 'pro'; updateData.cancelledAt = null; }
        if (['cancelled', 'expired', 'unpaid'].includes(attrs.status)) {
          updateData.plan = 'free'; updateData.cancelledAt = new Date();
        }
        await Subscription.findOneAndUpdate({ userId }, updateData);
        break;

      case 'subscription_cancelled':
        await Subscription.findOneAndUpdate({ userId }, { status: 'cancelled', cancelledAt: new Date() });
        break;

      case 'subscription_expired':
        await Subscription.findOneAndUpdate({ userId }, { plan: 'free', status: 'expired' });
        break;

      case 'subscription_payment_success':
        await Subscription.findOneAndUpdate({ userId }, {
          status: 'active', plan: 'pro',
          currentPeriodEnd: attrs.next_bill_date ? new Date(attrs.next_bill_date) : null,
        });
        break;

      case 'subscription_payment_failed':
        await Subscription.findOneAndUpdate({ userId }, { status: 'past_due' });
        break;

      default:
        console.log(`[Webhook] Unhandled event: ${eventName}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;