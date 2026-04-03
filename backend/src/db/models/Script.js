const { mongoose } = require('../database');

const scriptSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, required: true },
  topic:    { type: String, required: true },
  config:   { type: mongoose.Schema.Types.Mixed, required: true },
  result:   { type: mongoose.Schema.Types.Mixed, required: true },
  directorsCut: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

scriptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Script', scriptSchema);