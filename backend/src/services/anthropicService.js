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
  const platformGuides = {
    youtube: `
YOUTUBE SCRIPT RULES (non-negotiable):
- Hook (first 15 words): Must create a knowledge gap or make a bold claim that forces curiosity. Never start with "In this video" or "Today I'm going to".
- First 30 seconds: Tease the payoff WITHOUT delivering it. Create a loop the viewer must close.
- Structure: Hook → Credibility (why should I listen to you) → Problem → Solution in 3 steps → CTA → Outro
- Pacing: No sentence longer than 15 words. No paragraph longer than 3 sentences. Use line breaks aggressively.
- Pattern interrupts: Every 60-90 seconds, shift — ask a question, make a surprising statement, or reframe the topic.
- Retention trick: End every section with a micro-tease ("But here's where it gets interesting...").
- CTA placement: Soft CTA at 30% mark, hard CTA at the end. Never beg — frame it as a benefit.`,

    tiktok: `
TIKTOK SCRIPT RULES (non-negotiable):
- First word must be a power word: "Stop", "Wait", "Nobody", "This", "POV", "Imagine".
- Hook must be under 7 words and create instant curiosity or controversy.
- Pattern interrupt every 3-5 seconds — change angle, ask a question, reveal a fact.
- No fluff. Every single sentence must earn its place. Cut anything that doesn't add value.
- Use "but wait" and "here's the thing" as pivots to keep viewers watching.
- End on a cliffhanger or a reframe that makes them want to comment or share.
- Script should feel like a conversation, not a presentation. Use "you" constantly.`,

    instagram: `
INSTAGRAM REELS SCRIPT RULES (non-negotiable):
- Hook: Visual + verbal hook simultaneously. Describe what's happening on screen AND what's being said.
- Structure: Problem (5 sec) → Agitate (5 sec) → Solution (remainder) → CTA (last 3 sec).
- Aesthetic tone: Aspirational but relatable. Not corporate. Not salesy.
- Use second person ("you") throughout. Make it personal.
- CTA must feel natural: "save this for later" or "send this to someone who needs it" outperforms "follow me".
- Captions matter: First line of caption must continue the hook from the video.`,

    linkedin: `
LINKEDIN VIDEO SCRIPT RULES (non-negotiable):
- Hook: A counterintuitive professional insight or a personal story with a business lesson.
- Structure: Personal story (30 sec) → Insight extracted from story → 3 actionable takeaways → Reflection question for comments.
- Tone: Confident but humble. First-person experience. No jargon.
- Engagement driver: End with a genuine question that invites debate or personal stories in comments.
- Avoid: Corporate speak, passive voice, humble bragging without substance.
- The goal is shares among professionals — make the insight so good people want their network to see it.`,

    tiktok: `
TIKTOK SCRIPT RULES (non-negotiable):
- First word must be a power word: "Stop", "Wait", "Nobody", "This", "POV", "Imagine".
- Hook must be under 7 words and create instant curiosity or controversy.
- Pattern interrupt every 3-5 seconds — change angle, ask a question, reveal a fact.
- No fluff. Every single sentence must earn its place.
- End on a cliffhanger or reframe that makes them want to comment or share.`,

    podcast: `
PODCAST SCRIPT RULES (non-negotiable):
- Opening: Start mid-story or mid-insight. Never "Welcome to the podcast". Drop the listener into the action.
- Structure: Cold open (30 sec) → Brief intro → Main topic in 3-5 segments → Takeaway summary → Outro with next episode tease.
- Conversational rhythm: Write for the ear, not the eye. Short sentences. Rhetorical questions. Natural pauses marked with [pause].
- Depth over brevity: Podcast listeners opted in for long form — reward them with nuance and stories.
- Personality: The host's voice must come through. Generic = forgettable.`,

    twitter: `
X/TWITTER VIDEO SCRIPT RULES (non-negotiable):
- Hook: First 3 words must stop the scroll. Bold statement or number ("3 things nobody...").
- Maximum 60 seconds. Every second counts. Cut brutally.
- One idea only. Do not try to cover multiple points.
- End with a quote-worthy line — something people will screenshot.
- CTA: "Repost if this helped" or a question that drives replies.`,

    custom: `
SCRIPT RULES:
- Strong hook that immediately communicates value.
- Clear structure: Hook → Value → CTA.
- Conversational and direct. No fluff.
- Every sentence earns its place.`,
  };

  const hookGuides = {
    'Bold Claim': 'Make a statement so strong it forces the viewer to either agree or disagree — both reactions keep them watching.',
    'Story Drop': 'Start in the middle of a story at its most interesting moment. Context comes later.',
    'Curiosity Gap': 'Reveal just enough to make the viewer feel they are missing critical information they need to know.',
    'Question': 'Ask a question the target audience is already asking themselves internally.',
    'Controversy': 'Take a stance that challenges conventional wisdom in the niche. Make it defensible but surprising.',
    'Number': 'Lead with a specific number ("I made X in Y days", "3 things nobody tells you about Z").',
    'Statistic': 'Open with a surprising data point that reframes how the viewer thinks about the topic.',
    'Shocking Stat': 'Hit the viewer with a statistic so unexpected it stops the scroll and forces them to question what they thought they knew.',
    'Relatable Problem': 'Open by describing a pain point so precisely that the viewer feels you are reading their mind.',
  };

  const toneGuides = {
    'Energetic': 'High energy. Short punchy sentences. Exclamation points used sparingly but effectively. Feels like a friend who is genuinely excited.',
    'Funny': 'Observational humour. Self-deprecating where appropriate. Unexpected comparisons. Never try-hard.',
    'Educational': 'Clear, structured, authoritative but approachable. The smart friend who explains things simply.',
    'Inspirational': 'Vulnerable, honest, story-driven. Earned optimism — not toxic positivity.',
    'Conversational': 'Casual, warm, like talking to a trusted friend. Uses contractions, informal language, rhetorical questions.',
    'Professional': 'Confident, data-backed, polished. Credibility in every line. No slang.',
    'Controversial': 'Challenges assumptions. Takes a clear stance. Invites debate without being offensive.',
    'Emotional': 'Deeply empathetic and human. Taps into real feelings — joy, fear, nostalgia, hope. Makes the viewer feel seen and understood.',
    'Hype': 'Maximum energy. Bold, loud, excitement in every line. Short sentences. Capitalisation for emphasis. Feels like a hype man.',
    'Storytelling': 'Narrative-driven. Every point is delivered through a story or anecdote. Cinematic pacing. Makes the viewer feel like they are watching a film.',
  };

  return `You are a world-class viral content strategist and scriptwriter. You have studied the top 0.1% of performing content on every major platform and understand exactly what makes viewers watch, share, and return.

ASSIGNMENT:
Write a complete, ready-to-record script optimised for maximum viewer retention and engagement.

PLATFORM: ${platform.toUpperCase()}
TOPIC: ${config.topic}
TARGET AUDIENCE: ${config.audience || 'General audience interested in this topic'}
DURATION: ${config.duration}
TONE: ${config.tone} — ${toneGuides[config.tone] || 'Authentic and engaging.'}
HOOK STYLE: ${config.hook} — ${hookGuides[config.hook] || 'Grab attention immediately.'}
LANGUAGE: ${config.language || 'English'}
CTA GOAL: ${config.cta || 'Subscribe / Follow'}
ADDITIONAL NOTES: ${config.notes || 'None'}

${platformGuides[platform] || platformGuides.custom}

QUALITY STANDARDS (apply to every script):
- The hook must be so strong that if someone read only the first line, they would feel compelled to keep reading.
- Every transition between sections must feel natural — no jarring jumps.
- The CTA must feel like a natural conclusion, not an interruption.
- Read the script aloud mentally. If any sentence feels awkward spoken, rewrite it.
- The script must feel specifically written for THIS topic and THIS audience — not a generic template with the topic swapped in.

RULES — READ CAREFULLY:
1. Reply with RAW JSON only. No prose, no explanation.
2. Do NOT use markdown. Do NOT wrap in \`\`\`json or \`\`\`.
3. Your reply must start with { and end with }. Nothing before, nothing after.
4. Inside the "full" field, separate sections with a blank line. Use [HOOK], [INTRO], [MAIN CONTENT], [CTA], [OUTRO] as section headers on their own line.

Required JSON shape:
{
  "full": "string — the complete ready-to-record script",
  "hooks": ["alternative hook 1", "alternative hook 2", "alternative hook 3"],
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
  "brief": "string — 3-4 sentence content brief explaining the strategy behind this script"
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
  const end = text.lastIndexOf('}');
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
          parsed.full = inner.full;
          parsed.hooks = inner.hooks;
          parsed.hashtags = inner.hashtags;
          parsed.brief = inner.brief;
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
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

  const message = await anthropic.messages.create({
    model,
    max_tokens: 4096,
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
      full: rawText,
      hooks: ['See the Script tab for your generated content.'],
      hashtags: ['#content', '#creator', '#viral', '#socialmedia'],
      brief: 'Script generated. Please review the Script tab.',
    };
  }
}

module.exports = { generateScript };