const express      = require('express');
const { v4: uuidv4 } = require('uuid');
const router       = express.Router();
const { generateScript } = require('../services/anthropicService');
const validateScript     = require('../middleware/validateScript');
const requireAuth        = require('../middleware/requireAuth');
const db                 = require('../db/database');

// POST /api/script/generate
router.post('/generate', requireAuth, validateScript, async (req, res, next) => {
  try {
    const { platform, config } = req.body;
    const userId = req.user.id;
    console.log(`[Script] user="${userId}" platform="${platform}" topic="${config.topic}"`);
    const result = await generateScript({ platform, config });
    const scriptId = uuidv4();
    db.prepare(
      'INSERT INTO scripts (id, user_id, platform, topic, config, result) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(scriptId, userId, platform, config.topic, JSON.stringify(config), JSON.stringify(result));
    res.json({ success: true, data: result, meta: { scriptId, platform, generatedAt: new Date().toISOString() } });
  } catch (err) { next(err); }
});

// GET /api/script/history
router.get('/history', requireAuth, (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  const rows   = db.prepare(
    'SELECT id, platform, topic, config, result, created_at FROM scripts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(req.user.id, limit, offset);
  const total  = db.prepare('SELECT COUNT(*) as count FROM scripts WHERE user_id = ?').get(req.user.id).count;
  res.json({
    items: rows.map(r => ({ id: r.id, platform: r.platform, topic: r.topic, config: JSON.parse(r.config), result: JSON.parse(r.result), createdAt: r.created_at })),
    total, limit, offset,
  });
});

// DELETE /api/script/:id
router.delete('/:id', requireAuth, (req, res) => {
  const { changes } = db.prepare('DELETE FROM scripts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!changes) return res.status(404).json({ error: 'Script not found or not yours' });
  res.json({ success: true });
});

module.exports = router;
