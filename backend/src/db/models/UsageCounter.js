// src/db/models/UsageCounter.js
const mongoose = require('mongoose');

const UsageCounterSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month:     { type: String, required: true }, // e.g. "2026-04"
  count:     { type: Number, default: 0 },
}, { timestamps: true });

// One counter per user per month
UsageCounterSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('UsageCounter', UsageCounterSchema);