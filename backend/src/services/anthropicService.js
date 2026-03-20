const Anthropic = require('@anthropic-ai/sdk');

let client;

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables.');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Builds the prompt for script generation.
 */
function buildScriptPrompt({ platform, config }) {
  return `You are an expert viral content script writer for ${platform}.

Generate a complete, production-ready script with these specs:
- Platform: ${platform}
- Topic: ${config.topic}
- Target Audience: ${config.audience || 'General audience'}
- Duration: ${config.duration}
- Tone: ${config.tone}
- Hook Style: ${config.hook}
- Language: ${config.language || 'English'}
- CTA: ${config.cta || 'Follow/Subscribe'}
- Extra Notes: ${config.notes || 'None'}

Respond ONLY with valid JSON (no markdown, no code fences, no extra text). Use exactly this structure:
{
  "full": "Complete script with sections labeled [HOOK], [INTRO], [MAIN CONTENT], [CTA], [OUTRO]. Use double newlines between sections.",
  "hooks": ["Alternative hook 1 (2-3 sentences)", "Alternative hook 2", "Alternative hook 3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"],
  "brief": "Short 3-4 sentence content brief summarizing script strategy, target audience insight, and engagement tactics."
}`;
}

/**
 * Generate a script using the Anthropic API.
 * @param {object} params - { platform, config }
 * @returns {Promise<object>} Parsed script JSON
 */
async function generateScript({ platform, config }) {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: buildScriptPrompt({ platform, config }),
      },
    ],
  });

  const rawText = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('');

  // Strip any accidental code fences
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Graceful fallback: return raw text in expected shape
    parsed = {
      full: rawText,
      hooks: ['See the Script tab for your generated content.'],
      hashtags: ['#content', '#creator', '#viral', '#socialmedia'],
      brief: 'Script generated. Please review the Script tab.',
    };
  }

  return parsed;
}

module.exports = { generateScript };
