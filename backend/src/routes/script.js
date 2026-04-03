const express = require('express');
const router = express.Router();
const { generateScript } = require('../services/anthropicService');
const validateScript = require('../middleware/validateScript');
const requireAuth = require('../middleware/requireAuth');
const Script = require('../db/models/Script');

// POST /api/script/generate
router.post('/generate', requireAuth, validateScript, async (req, res, next) => {
  try {
    const { platform, config } = req.body;
    const userId = req.user.id;

    console.log(`[Script] user="${userId}" platform="${platform}" topic="${config.topic}"`);

    const result = await generateScript({ platform, config });

    const script = await Script.create({
      userId,
      platform,
      topic: config.topic,
      config,
      result,
    });

    res.json({
      success: true,
      data: result,
      meta: { scriptId: script._id, platform, generatedAt: script.createdAt },
    });
  } catch (err) { next(err); }
});

// POST /api/script/directors-cut
router.post('/directors-cut', requireAuth, async (req, res, next) => {
  try {
    const { platform, config, script } = req.body;

    if (!script || !platform) {
      return res.status(400).json({ error: 'platform and script are required' });
    }

    const { generateDirectorsCut } = require('../services/anthropicService');
    const trimmedScript = script.slice(0, 3000);
    const result = await generateDirectorsCut({ platform, config, script: trimmedScript });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// PATCH /api/script/:id/directors-cut — save directors cut to existing script
router.patch('/:id/directors-cut', requireAuth, async (req, res, next) => {
  try {
    const { directorsCut } = req.body;
    if (!directorsCut) {
      return res.status(400).json({ error: 'directorsCut is required' });
    }

    const script = await Script.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { directorsCut } },
      { new: true }
    );

    if (!script) return res.status(404).json({ error: 'Script not found or not yours' });

    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/script/history
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.user.id;

    const [items, total] = await Promise.all([
      Script.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Script.countDocuments({ userId }),
    ]);

    res.json({
      items: items.map(s => ({
        id: s._id,
        platform: s.platform,
        topic: s.topic,
        config: s.config,
        result: s.result,
        createdAt: s.createdAt,
        directorsCut: s.directorsCut || null,
      })),
      total, limit, offset,
    });
  } catch (err) { next(err); }
});

// DELETE /api/script/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const deleted = await Script.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: 'Script not found or not yours' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;