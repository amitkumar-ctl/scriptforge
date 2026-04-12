const { mongoose } = require('../database');

const subscriptionSchema = new mongoose.Schema({
  userId:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true ,index: true },
  plan:                 { type: String, enum: ['free', 'pro'], default: 'free' },
  billingPeriod:        { type: String, enum: ['monthly', 'yearly', null], default: null },
  lsCustomerId:         { type: String, default: null },
  lsSubscriptionId:     { type: String, default: null },
  lsOrderId:            { type: String, default: null },
  lsVariantId:          { type: String, default: null },
  status:               { type: String, default: 'inactive' },
  currentPeriodStart:   { type: Date, default: null },
  currentPeriodEnd:     { type: Date, default: null },
  cancelledAt:          { type: Date, default: null },
  renewsAt:             { type: Date, default: null },
}, { timestamps: true });

subscriptionSchema.index({ lsSubscriptionId: 1 });
subscriptionSchema.index({ lsCustomerId: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);