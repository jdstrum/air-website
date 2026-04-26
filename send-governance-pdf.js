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

  const { name, email } = req.body || {};

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

  // Read the PDF file
  const pdfPath = path.join(process.cwd(), 'AIR-AI-Acceptable-Use-Policy.pdf');
  let pdfBuffer;
  try {
    pdfBuffer = fs.readFileSync(pdfPath);
  } catch (err) {
    console.error('PDF read error:', err);
    return res.status(500).json({ error: 'Unable to load the policy document.' });
  }

  // Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
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
            <a href="https://airesulting.com/the-governance-gap" style="display: inline-block; background: #C88A50; color: #F8F6F2; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-decoration: none; letter-spacing: 0.02em;">Explore the Governance Gap</a>
          </div>
          <div style="padding: 24px 0; border-top: 1px solid #D4C8B0; font-size: 13px; color: #9A8C74; line-height: 1.5;">
            <p style="margin: 0;">AI Resulting — From assessment to action.<br>
            <a href="https://airesulting.com" style="color: #C88A50; text-decoration: none;">airesulting.com</a></p>
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

    // Log the lead
    console.log('Governance PDF sent:', {
      name,
      email,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Unable to send email. Please try again.' });
  }
};
