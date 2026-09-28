// Writes the one AI slot on the Where AI Starts results page: the situation paragraph.
// Everything else on the page is prewritten. If anything here fails, the page keeps
// its prewritten paragraph, so this route never blocks a result.
//
// Needs ANTHROPIC_API_KEY in Vercel. Optional: AIR_MODEL (defaults below).

const MODEL = process.env.AIR_MODEL || 'claude-sonnet-4-5';
const MAX_WORDS = 75;

const BANNED = [
  'unlock', 'leverage', 'empower', 'seamless', 'cutting-edge', 'game-changer', 'game changer',
  'revolutionize', 'transformative', 'journey', 'synergy', 'robust', 'holistic', 'delve',
  'in today', 'landscape', 'paradigm', 'best-in-class', 'world-class', 'supercharge',
  'most companies', 'your size', 'companies like yours', 'we help'
];
const VENDORS = [
  'microsoft', 'copilot', 'openai', 'chatgpt', 'anthropic', 'claude', 'google', 'gemini',
  'cisco', 'aws', 'amazon', 'azure', 'salesforce', 'zoom', 'webex', 'ringcentral', 'five9',
  'genesys', 'nice', 'expedient', 'bridgepointe', 'meter', 'servicenow', 'oracle', 'ibm'
];

const BRIEF = `You write one paragraph for AI Resulting, a vendor-neutral technology advisory for mid-market companies.
The reader just answered six questions about their company. Everything else on their results page is already written.
Your paragraph sits under the headline and says, in plain words, what their answers add up to.

Position: AI results from what's underneath it. Build from the bottom up. The foundation (data, network and systems, security, customer experience) decides whether AI works.

Rules:
- One paragraph, ${MAX_WORDS} words or fewer. Second person ("you", "your").
- Use only what the answers, notes and website text say. Never invent facts, numbers, names, tools, headcount or company size.
- No vendor or product names. No percentages or statistics.
- Start with what limits their growth, then the one or two answers that matter most for it.
- Plain, direct sentences. No hype, no hedging, no em dashes, no rhetorical questions, no exclamation marks.
- If the website text says what the company does, you may name it in a few words. If it doesn't, don't guess.
- Return only the paragraph.`;

const EXAMPLES = `Example answers: Seat: I run technology. Growth limit: supporting customers as we grow. Knowledge: most of how the work gets done lives with one person. Systems: hours every day moving information between systems. AI in use: personal accounts, nothing approved.
Example paragraph: What limits growth is support, and your answers point to why. The people who know how things work are carrying it in their heads, and your team spends hours a day moving information between systems that don't talk. Meanwhile people are already using AI in personal accounts. Before AI can take load off support, it needs connected systems to read from and rules for what it can see.`;

const clean = (v, max) => String(v || '').trim().slice(0, max);
const words = t => t.split(/\s+/).filter(Boolean).length;

function safeUrl(raw) {
  let value = clean(raw, 200);
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const host = u.hostname.toLowerCase();
    if (!host.includes('.') || /^[\d.]+$/.test(host) || host.includes(':') ||
        host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
    return `https://${host}/`;
  } catch (e) { return null; }
}

async function siteText(raw) {
  const url = safeUrl(raw);
  if (!url) return '';
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(4000), headers: { 'User-Agent': 'AI Resulting results page' } });
    if (!r.ok) return '';
    const html = (await r.text()).slice(0, 200000);
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
    const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || '';
    const body = html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    return clean(`${title}. ${desc}. ${body}`, 2500);
  } catch (e) { return ''; }
}

function passes(text, source) {
  if (!text || words(text) > MAX_WORDS + 5 || words(text) < 25) return false;
  const low = text.toLowerCase();
  if (BANNED.some(b => low.includes(b))) return false;
  if (VENDORS.some(v => new RegExp(`\\b${v}\\b`).test(low))) return false;
  if (/[—!%]/.test(text) || /\?/.test(text)) return false;
  // No numbers unless the reader supplied them.
  const nums = text.match(/\d+/g) || [];
  if (nums.some(n => !source.includes(n))) return false;
  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(204).end();

  const body = req.body || {};
  const answers = clean(body.answers, 4000);
  if (!answers) return res.status(204).end();
  const site = await siteText(body.url);

  const prompt = `${EXAMPLES}\n\nAnswers:\n${answers}\n\n${site ? `Text from their website:\n${site}\n\n` : ''}Write the paragraph.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: AbortSignal.timeout(12000),
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: BRIEF, messages: [{ role: 'user', content: prompt }] })
    });
    if (!r.ok) {
      console.error('AIR read: model call failed', r.status);
      return res.status(204).end();
    }
    const data = await r.json();
    const text = clean((data.content || []).map(c => c.text || '').join(' '), 1200).replace(/\s+/g, ' ');
    if (!passes(text, answers)) {
      console.warn('AIR read: output failed checks, using prewritten', { text });
      return res.status(204).end();
    }
    console.log('AIR read: written', { text });
    return res.status(200).json({ situation: text });
  } catch (e) {
    console.error('AIR read: error', e.message);
    return res.status(204).end();
  }
};
