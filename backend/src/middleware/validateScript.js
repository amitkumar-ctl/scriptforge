const VALID_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'linkedin', 'podcast', 'twitter', 'custom'];
const VALID_TONES = ['Energetic', 'Professional', 'Funny', 'Emotional', 'Educational', 'ASMR', 'Hype', 'Storytelling'];

/**
 * Validates the /api/script/generate request body.
 */
function validateScript(req, res, next) {
  const { platform, config } = req.body;

  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return res.status(400).json({
      error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
    });
  }

  if (!config || typeof config !== 'object') {
    return res.status(400).json({ error: 'config object is required' });
  }

  if (!config.topic || typeof config.topic !== 'string' || config.topic.trim().length < 3) {
    return res.status(400).json({ error: 'config.topic must be at least 3 characters' });
  }

  if (config.topic.length > 500) {
    return res.status(400).json({ error: 'config.topic must be under 500 characters' });
  }

  if (config.tone && !VALID_TONES.includes(config.tone)) {
    return res.status(400).json({
      error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}`,
    });
  }

  next();
}

module.exports = validateScript;
