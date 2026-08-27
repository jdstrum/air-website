const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, title } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // Validate work email (block personal domains)
  const blockedDomains = [
    'gmail.com','yahoo.com','yahoo.co.uk','hotmail.com','outlook.com',
    'live.com','aol.com','icloud.com','me.com','mac.com','mail.com',
    'protonmail.com','proton.me','zoho.com','yandex.com','gmx.com',
    'gmx.net','inbox.com','fastmail.com','hushmail.com','tutanota.com',
    'msn.com','comcast.net','att.net','verizon.net','cox.net',
    'charter.net','earthlink.net','sbcglobal.net','optonline.net',
    'frontier.com','windstream.net'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || blockedDomains.includes(domain)) {
    return res.status(400).json({ error: 'Please use a work email address.' });
  }

  // Notification recipient for AIR
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'jennifer@airesulting.com';

  // Read the PDF file
  const pdfPath = path.join(process.cwd(), 'AIR-AI-Acceptable-Use-Policy.pdf');
  let pdfBuffer;
  try {
    pdfBuffer = fs.readFileSync(pdfPath);
  } catch (err) {
    console.error('PDF read error:', err);
    return res.status(500).json({ error: 'Unable to load the policy document.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const tsFormatted = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  // ── 1. Email the lead the PDF ──
  const leadEmailPromise = resend.emails.send({
    from: 'AI Resulting <noreply@send.airesulting.com>',
    to: email,
    subject: 'Your AI Acceptable Use Policy — AI Resulting',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1914;">
        <div style="padding: 40px 0 24px; border-bottom: 2px solid #C88A50;">
          <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #1C1914; letter-spacing: -0.02em;">AI Resulting</h1>
        </div>
        <div style="padding: 32px 0;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${name.split(' ')[0]},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Your <strong>AI Acceptable Use Policy</strong> is attached. This is a ready-to-implement governance framework — data classification, tool authorization tiers, prohibited uses, incident response — built for organizations that move fast and can't afford to get this wrong.</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">If you'd like to talk about how governance fits into your broader AI readiness picture, we'd welcome the conversation.</p>
          <a href="https://airesulting.vercel.app/governance-security" style="display: inline-block; background: #C88A50; color: #F8F6F2; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-decoration: none; letter-spacing: 0.02em;">Explore Governance &amp; Security</a>
        </div>
        <div style="padding: 24px 0; border-top: 1px solid #D4C8B0; font-size: 13px; color: #9A8C74; line-height: 1.5;">
          <p style="margin: 0;">AI Resulting — From assessment to action.<br>
          <a href="https://airesulting.vercel.app" style="color: #C88A50; text-decoration: none;">airesulting.vercel.app</a></p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'AIR-AI-Acceptable-Use-Policy.pdf',
        content: pdfBuffer.toString('base64'),
      },
    ],
  });

  // ── 2. Notify AIR that a lead downloaded the policy ──
  const companyLine = company ? `<p style="font-size:15px;color:#1C1914;font-weight:600;margin:0 0 12px;">${company}</p>` : '';
  const titleLine = title ? `<p style="font-size:15px;color:#8A8279;margin:0 0 2px;">${title}</p>` : '';

  const notifyEmailHTML = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;color:#2F2F2F;">
      <div style="background:#1C1914;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="font-size:18px;font-weight:700;color:#C88A50;margin:0 0 4px;">📥 Governance PDF Downloaded</h1>
        <p style="font-size:13px;color:#B5AFA8;margin:0;">${tsFormatted}</p>
      </div>
      <div style="background:#FDFBF9;padding:24px 32px;border:1px solid #E8E2DC;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="font-size:22px;font-weight:700;margin:0 0 4px;color:#1C1914;">${name}</h2>
        ${titleLine}
        ${companyLine}
        <p style="font-size:14px;margin:0 0 16px;">
          <a href="mailto:${email}" style="color:#C88A50;text-decoration:none;">${email}</a>
        </p>
        <p style="font-size:13px;color:#8A8279;margin:16px 0 0;font-style:italic;">They received the AI Acceptable Use Policy PDF. Source: the-governance-gap page.</p>
      </div>
    </div>
  `;

  const notifyPromise = resend.emails.send({
    from: 'AI Resulting Leads <leads@send.airesulting.com>',
    to: NOTIFY_EMAIL,
    subject: `📥 Governance PDF: ${name}${company ? ' — ' + company : ''}`,
    html: notifyEmailHTML
  });

  // Run both sends in parallel; surface failures but prioritize lead email success
  try {
    const [leadResult, notifyResult] = await Promise.allSettled([leadEmailPromise, notifyPromise]);

    if (leadResult.status === 'rejected') {
      console.error('Lead email send failed:', leadResult.reason);
      return res.status(500).json({ error: 'Unable to send email. Please try again.' });
    }

    if (notifyResult.status === 'rejected') {
      console.error('AIR notification send failed:', notifyResult.reason);
      // Don't block the user — they got their PDF. Just log.
    }

    console.log('Governance PDF sent:', {
      name,
      email,
      company: company || '(not provided)',
      notified: notifyResult.status === 'fulfilled',
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Unable to send email. Please try again.' });
  }
};
