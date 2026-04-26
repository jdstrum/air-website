const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { contact, ref, timestamp } = req.body || {};

  if (!contact || !contact.email) {
    return res.status(400).json({ error: 'Missing contact information.' });
  }

  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'jstrum68@gmail.com';

  const refTag = ref
    ? `<p style="font-size:14px;color:#C88A50;margin:0 0 8px;"><strong>Referred by:</strong> ${ref}</p>`
    : '';

  const tsFormatted = new Date(timestamp || Date.now()).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const emailHTML = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;color:#2F2F2F;">
      <div style="background:#1C1914;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="font-size:18px;font-weight:700;color:#C88A50;margin:0 0 4px;">🟡 Lead Started Assessment</h1>
        <p style="font-size:13px;color:#B5AFA8;margin:0;">${tsFormatted}</p>
      </div>
      <div style="background:#FDFBF9;padding:24px 32px;border:1px solid #E8E2DC;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="font-size:22px;font-weight:700;margin:0 0 4px;color:#1C1914;">${contact.firstName} ${contact.lastName}</h2>
        <p style="font-size:15px;color:#8A8279;margin:0 0 2px;">${contact.title || ''}</p>
        <p style="font-size:15px;color:#1C1914;font-weight:600;margin:0 0 12px;">${contact.company}</p>
        <p style="font-size:14px;margin:0 0 16px;">
          <a href="mailto:${contact.email}" style="color:#C88A50;text-decoration:none;">${contact.email}</a>
        </p>
        ${refTag}
        <p style="font-size:13px;color:#8A8279;margin:16px 0 0;font-style:italic;">If a 'COMPLETED' email doesn't follow, they may have abandoned mid-assessment — worth a follow-up.</p>
      </div>
    </div>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'AI Resulting Leads <leads@send.airesulting.com>',
      to: NOTIFY_EMAIL,
      subject: `🟡 STARTED: ${contact.firstName} ${contact.lastName} — ${contact.company}${ref ? ' [ref: ' + ref + ']' : ''}`,
      html: emailHTML
    });

    console.log('Lead start captured:', {
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      company: contact.company,
      ref: ref || 'direct',
      timestamp: timestamp || new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Lead start email error:', err);
    // Don't block — let the user proceed even if this fails
    return res.status(200).json({ success: false });
  }
};
