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

function buildScriptPrompt({ platform, config }) {
  return `You are an expert viral content script writer for ${platform}.

Generate a complete script with these specs:
- Platform: ${platform}
- Topic: ${config.topic}
- Target Audience: ${config.audience || 'General audience'}
- Duration: ${config.duration}
- Tone: ${config.tone}
- Hook Style: ${config.hook}
- Language: ${config.language || 'English'}
- CTA: ${config.cta || 'Follow/Subscribe'}
- Notes: ${config.notes || 'None'}

RULES — READ CAREFULLY:
1. Reply with RAW JSON only. No prose, no explanation.
2. Do NOT use markdown. Do NOT wrap in \`\`\`json or \`\`\`.
3. Your reply must start with { and end with }. Nothing before, nothing after.
4. Inside the "full" field, separate sections with a blank line. Use [HOOK], [INTRO], [MAIN CONTENT], [CTA], [OUTRO] as section headers on their own line.

Required JSON shape:
{
  "full": "string — the complete script",
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
  "brief": "string — 3-4 sentence content brief"
}`;
}

function extractAndParse(rawText) {
  let text = rawText.trim();

  // ── Step 1: strip outer markdown fences ──────────────────────────
  text = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // ── Step 2: extract first { ... } block ──────────────────────────
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  // ── Step 3: parse ─────────────────────────────────────────────────
  const parsed = JSON.parse(text);

  // ── Step 4: detect double-encoded response ────────────────────────
  // Happens when the model puts the whole JSON inside the "full" field as a string.
  // e.g. parsed.full === '```json\n{ "full": "...", "hooks": [...] }\n```'
  if (parsed.full && typeof parsed.full === 'string') {
    const innerText = parsed.full
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (innerText.startsWith('{')) {
      try {
        const inner = JSON.parse(innerText);
        // Confirmed double-encoded — use the inner object
        if (inner.full && inner.hooks && inner.hashtags) {
          parsed.full      = inner.full;
          parsed.hooks     = inner.hooks;
          parsed.hashtags  = inner.hashtags;
          parsed.brief     = inner.brief;
        }
      } catch {
        // Not double-encoded JSON — leave as-is
      }
    }
  }

  // ── Step 5: normalise escaped newlines ───────────────────────────
  if (parsed.full) {
    parsed.full = parsed.full.replace(/\\n/g, '\n');
  }
  if (Array.isArray(parsed.hooks)) {
    parsed.hooks = parsed.hooks.map(h => h.replace(/\\n/g, '\n'));
  }

  return parsed;
}

async function generateScript({ platform, config }) {
  const anthropic = getClient();
  const model     = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

  const message = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: buildScriptPrompt({ platform, config }) }],
  });

  const rawText = message.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  try {
    return extractAndParse(rawText);
  } catch (err) {
    console.error('[Anthropic] Parse failed:', err.message);
    return {
      full:     rawText,
      hooks:    ['See the Script tab for your generated content.'],
      hashtags: ['#content', '#creator', '#viral', '#socialmedia'],
      brief:    'Script generated. Please review the Script tab.',
    };
  }
}

module.exports = { generateScript };