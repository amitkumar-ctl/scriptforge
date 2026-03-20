const express = require('express');
const router = express.Router();
const { generateScript } = require('../services/anthropicService');
const validateScript = require('../middleware/validateScript');

/**
 * POST /api/script/generate
 * Body: { platform: string, config: ScriptConfig }
 */
router.post('/generate', validateScript, async (req, res, next) => {
  try {
    const { platform, config } = req.body;
    console.log(`[Script] Generating for platform="${platform}" topic="${config.topic}"`);

    const script = await generateScript({ platform, config });

    res.json({
      success: true,
      data: script,
      meta: {
        platform,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
