const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_IDS = {
  monthly: process.env.RAZORPAY_MONTHLY_PLAN_ID,
  yearly:  process.env.RAZORPAY_YEARLY_PLAN_ID,
};

/**
 * Create a Razorpay subscription for a given period.
 * Returns the subscription object (id, short_url, etc.)
 */
async function createSubscription({ period, userId, email, name }) {
  const planId = PLAN_IDS[period];
  if (!planId) throw new Error(`Invalid period: ${period}`);

  const subscription = await razorpay.subscriptions.create({
    plan_id:         planId,
    total_count:     period === 'yearly' ? 5 : 60,   // up to 5 years / 60 months
    quantity:        1,
    customer_notify: 1,
    notes: {
      user_id: String(userId),
      email,
      name,
    },
  });

  return subscription;
}

/**
 * Cancel a Razorpay subscription immediately (cancel_at_cycle_end = false)
 * or at cycle end (cancel_at_cycle_end = true).
 */
async function cancelSubscription(rzSubscriptionId, cancelAtCycleEnd = true) {
  await razorpay.subscriptions.cancel(rzSubscriptionId, cancelAtCycleEnd);
}

/**
 * Fetch subscription details from Razorpay.
 */
async function fetchSubscription(rzSubscriptionId) {
  return razorpay.subscriptions.fetch(rzSubscriptionId);
}

function getPlanId(period) {
  return PLAN_IDS[period] || PLAN_IDS.monthly;
}

module.exports = { createSubscription, cancelSubscription, fetchSubscription, getPlanId };