const { mongoose } = require('../database');

const refreshTokenSchema = new mongoose.Schema({
  _id:       { type: String },   // UUID string — override default ObjectId
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  family:    { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revoked:   { type: Boolean, default: false },
}, {
  timestamps: true,
  _id: false,   // tell mongoose we're managing _id ourselves
});

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ family: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);