const { Resend } = require('resend');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    conversationType,
    name,
    email,
    company,
    role,
    company_size: companySize,
    situation,
    topic,
    website
  } = req.body || {};

  // Honeypot: bots can be acknowledged without sending a notification.
  if (website) return res.status(200).json({ success: true });

  if (!['jai', 'resultant'].includes(conversationType) || !name || !email || !company) {
    return res.status(400).json({ error: 'Name, work email, and company are required.' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(email))) {
    return res.status(400).json({ error: 'Please enter a valid work email address.' });
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    company: escapeHtml(company),
    role: escapeHtml(role),
    companySize: escapeHtml(companySize),
    detail: escapeHtml(conversationType === 'jai' ? situation : topic)
  };
  const label = conversationType === 'jai' ? 'Jai conversation request' : 'Resultant conversation request';
  const detailLabel = conversationType === 'jai' ? 'What has them thinking about AI' : 'What they would like to discuss';
  const notifyEmail = process.env.NOTIFY_EMAIL || 'jennifer@airesulting.com';
  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailHTML = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;color:#132321;">
      <div style="background:#132321;padding:24px 30px;color:#f4f0e8;">
        <p style="margin:0 0 6px;color:#c6d4cc;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">AI Resulting</p>
        <h1 style="margin:0;font-size:22px;">${label}</h1>
      </div>
      <div style="padding:26px 30px;border:1px solid #d6d0c5;border-top:0;background:#f4f0e8;">
        <h2 style="margin:0 0 4px;font-size:22px;">${safe.name}</h2>
        <p style="margin:0 0 16px;color:#52605a;">${safe.role || 'Role not provided'} · ${safe.company}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${safe.email}" style="color:#ae6750;">${safe.email}</a></p>
        ${safe.companySize ? `<p style="margin:0 0 18px;"><strong>Company size:</strong> ${safe.companySize}</p>` : ''}
        <p style="margin:22px 0 7px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#ae6750;"><strong>${detailLabel}</strong></p>
        <p style="margin:0;line-height:1.6;white-space:pre-wrap;">${safe.detail || 'No additional detail provided.'}</p>
      </div>
    </div>`;

  try {
    await resend.emails.send({
      from: 'AI Resulting Leads <leads@send.airesulting.com>',
      to: notifyEmail,
      subject: `${label}: ${name} — ${company}`,
      html: emailHTML
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Conversation capture email error:', error);
    return res.status(500).json({ error: 'Unable to send the request right now.' });
  }
};
