const Subscription = require('../db/models/Subscription');

async function expireStaleSubscriptions() {
  const now = new Date();
  const result = await Subscription.updateMany(
    {
      plan:             'pro',
      status:           { $ne: 'active' }, // halted, past_due, cancelled
      currentPeriodEnd: { $lt: now },      // period has passed
    },
    {
      $set: { plan: 'free', status: 'expired' }
    }
  );
  if (result.modifiedCount > 0) {
    console.log(`[Cron] Expired ${result.modifiedCount} stale subscriptions`);
  }
}

module.exports = { expireStaleSubscriptions };