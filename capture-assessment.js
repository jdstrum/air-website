const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    contact,       // { firstName, lastName, email, company, title }
    track,         // 'strategic' or 'technical'
    profile,       // { industry, size, revenue, platforms, aiTools }
    overall,       // number 0-100
    tier,          // 'Foundational' | 'Developing' | 'Operational' | 'Advanced'
    phase,         // { phase, name, desc }
    dimScores,     // [{ id, name, score }]
    lowest,        // { id, name, score }
    answers,       // { s1: 3, s2: 2, ... }
    ref,           // source/agent tracking code
    urgency,       // urgency selections
    openText,      // free-text responses
    timestamp
  } = req.body || {};

  if (!contact || !contact.email) {
    return res.status(400).json({ error: 'Missing contact information.' });
  }

  // ── Notification recipient(s) ──
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'jstrum68@gmail.com';

  // ── Build the lead email ──
  const tierColors = {
    'Foundational': '#B85C4F',
    'Developing': '#C4956A',
    'Operational': '#7A8B6F',
    'Advanced': '#5B8A72'
  };
  const tierColor = tierColors[tier] || '#AC9379';

  // Dimension score rows
  const dimRows = (dimScores || []).map(d => {
    const dc = tierColors[getTierFromScore(d.score)] || '#AC9379';
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E2DC;font-size:14px;color:#2F2F2F;">${d.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E2DC;font-size:14px;font-weight:700;color:${dc};text-align:center;">${d.score}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E8E2DC;font-size:13px;color:${dc};text-align:center;">${getTierFromScore(d.score)}</td>
      </tr>`;
  }).join('');

  // Platform & AI tool lists
  const platformList = (profile?.platforms || []).filter(Boolean).join(', ') || 'Not provided';
  const aiToolList = (profile?.aiTools || []).filter(Boolean).join(', ') || 'Not provided';
  const urgencyList = (urgency || []).join(', ') || 'None selected';

  const refTag = ref ? `<tr><td style="padding:8px 12px;font-size:14px;color:#2F2F2F;font-weight:600;">Referred By</td><td colspan="2" style="padding:8px 12px;font-size:14px;color:#C4956A;font-weight:700;">${ref}</td></tr>` : '';

  const emailHTML = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#2F2F2F;">

      <!-- Header -->
      <div style="background:#1C1914;padding:28px 32px;border-radius:8px 8px 0 0;">
        <h1 style="font-size:18px;font-weight:700;color:#AC9379;margin:0 0 4px;">New Assessment Lead</h1>
        <p style="font-size:13px;color:#B5AFA8;margin:0;">${new Date(timestamp || Date.now()).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })}</p>
      </div>

      <!-- Contact Card -->
      <div style="background:#FDFBF9;padding:24px 32px;border:1px solid #E8E2DC;border-top:none;">
        <h2 style="font-size:22px;font-weight:700;margin:0 0 4px;color:#1C1914;">${contact.firstName} ${contact.lastName}</h2>
        <p style="font-size:15px;color:#8A8279;margin:0 0 2px;">${contact.title || ''}</p>
        <p style="font-size:15px;color:#1C1914;font-weight:600;margin:0 0 12px;">${contact.company}</p>
        <p style="font-size:14px;margin:0;">
          <a href="mailto:${contact.email}" style="color:#AC9379;text-decoration:none;">${contact.email}</a>
        </p>
      </div>

      <!-- Overall Score -->
      <div style="background:#fff;padding:24px 32px;border:1px solid #E8E2DC;border-top:none;text-align:center;">
        <div style="font-size:48px;font-weight:700;color:${tierColor};margin-bottom:4px;">${overall}%</div>
        <div style="display:inline-block;background:${tierColor}20;color:${tierColor};font-size:13px;font-weight:700;padding:4px 14px;border-radius:20px;letter-spacing:0.04em;">${tier}</div>
        ${phase ? `<div style="margin-top:12px;font-size:14px;color:#8A8279;">Phase ${phase.phase}: ${phase.name}</div>` : ''}
      </div>

      <!-- Dimension Scores -->
      <div style="background:#fff;padding:20px 32px;border:1px solid #E8E2DC;border-top:none;">
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:2px solid #1C1914;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#8A8279;text-transform:uppercase;letter-spacing:0.08em;">Dimension</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;font-weight:600;color:#8A8279;text-transform:uppercase;letter-spacing:0.08em;">Score</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;font-weight:600;color:#8A8279;text-transform:uppercase;letter-spacing:0.08em;">Tier</th>
          </tr>
          ${dimRows}
          ${refTag}
        </table>
      </div>

      ${lowest ? `
      <!-- Biggest Gap -->
      <div style="background:#FFF8F0;padding:20px 32px;border:1px solid #E8E2DC;border-top:none;">
        <p style="font-size:12px;font-weight:600;color:#C4956A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;">Biggest Gap</p>
        <p style="font-size:16px;font-weight:700;color:#1C1914;margin:0;">${lowest.name} — ${lowest.score}%</p>
      </div>` : ''}

      <!-- Profile Details -->
      <div style="background:#fff;padding:20px 32px;border:1px solid #E8E2DC;border-top:none;">
        <p style="font-size:12px;font-weight:600;color:#8A8279;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Profile</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:4px 0;color:#8A8279;width:120px;">Track</td><td style="padding:4px 0;color:#1C1914;font-weight:500;">${track === 'strategic' ? 'Strategic' : 'Technical'}</td></tr>
          <tr><td style="padding:4px 0;color:#8A8279;">Industry</td><td style="padding:4px 0;color:#1C1914;font-weight:500;">${profile?.industry || 'Not provided'}</td></tr>
          <tr><td style="padding:4px 0;color:#8A8279;">Size</td><td style="padding:4px 0;color:#1C1914;font-weight:500;">${profile?.size || 'Not provided'}</td></tr>
          <tr><td style="padding:4px 0;color:#8A8279;">Revenue</td><td style="padding:4px 0;color:#1C1914;font-weight:500;">${profile?.revenue || 'Not provided'}</td></tr>
          <tr><td style="padding:4px 0;color:#8A8279;">Platforms</td><td style="padding:4px 0;color:#1C1914;font-weight:500;">${platformList}</td></tr>
          <tr><td style="padding:4px 0;color:#8A8279;">AI Tools</td><td style="padding:4px 0;color:#1C1914;font-weight:500;">${aiToolList}</td></tr>
          <tr><td style="padding:4px 0;color:#8A8279;">Urgency</td><td style="padding:4px 0;color:#1C1914;font-weight:500;">${urgencyList}</td></tr>
        </table>
      </div>

      ${(openText && openText.ot1) ? `
      <!-- Open Text -->
      <div style="background:#fff;padding:20px 32px;border:1px solid #E8E2DC;border-top:none;">
        <p style="font-size:12px;font-weight:600;color:#8A8279;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">In Their Own Words</p>
        <p style="font-size:14px;color:#1C1914;line-height:1.6;margin:0;font-style:italic;">"${openText.ot1}"</p>
      </div>` : ''}

      <!-- Footer -->
      <div style="background:#1C1914;padding:16px 32px;border-radius:0 0 8px 8px;">
        <p style="font-size:12px;color:#8A8279;margin:0;text-align:center;">AI Resulting — Lead Capture System</p>
      </div>
    </div>
  `;

  // ── Send via Resend ──
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'AI Resulting Leads <leads@send.airesulting.com>',
      to: NOTIFY_EMAIL,
      subject: `🎯 ${contact.firstName} ${contact.lastName} — ${contact.company} — ${tier} (${overall}%)${ref ? ' [ref: ' + ref + ']' : ''}`,
      html: emailHTML
    });

    console.log('Assessment captured:', {
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      company: contact.company,
      overall,
      tier,
      ref: ref || 'direct',
      timestamp: timestamp || new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Capture email error:', err);
    // Don't block the user experience — log the error but return success
    // The assessment results still show even if email fails
    return res.status(200).json({ success: true, note: 'Results displayed; notification pending.' });
  }
};

// Helper — score to tier
function getTierFromScore(score) {
  if (score >= 75) return 'Advanced';
  if (score >= 50) return 'Operational';
  if (score >= 25) return 'Developing';
  return 'Foundational';
}
