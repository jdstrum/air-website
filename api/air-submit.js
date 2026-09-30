const { randomUUID } = require('crypto');
const { Resend } = require('resend');
const {
  FIELD_KEYS,
  TAGS,
  addTags,
  ghlConfig,
  upsertContact
} = require('./_air-ghl');

const REQUEST_TYPES = new Set(['assessment', 'kit', 'contact']);
const ASSESSMENT_VERSION = '2026-09-30-where-ai-fits-v2';
const RESOURCE_ID = 'first-useful-ai-workflow';
const RESOURCE_EDITION = '2026-09-29-v2';

const clean = (value, max = 1500) => String(value || '').trim().slice(0, max);
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function cookieValue(header, name) {
  const match = String(header || '').split(';').map(part => part.trim())
    .find(part => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

function attribution(req, body) {
  const source = clean(body.source || 'website', 120);
  const page = clean(body.page, 500);
  const referrer = clean(body.referrer, 500);
  const campaign = clean(body.campaign, 300);
  return {
    source,
    text: [`source=${source}`, page && `page=${page}`, referrer && `referrer=${referrer}`, campaign && `campaign=${campaign}`]
      .filter(Boolean).join('\n'),
    referralCode: clean(body.referralCode || cookieValue(req.headers.cookie, '_air_ref'), 100)
  };
}

function consentText(type, body, submittedAt) {
  const choices = [];
  if (body.deliveryConsent) choices.push('resource/assessment delivery');
  if (body.contactConsent || body.conversationConsent) choices.push('advisor contact');
  return [
    `request=${type}`,
    `choices=${choices.join(', ') || 'none'}`,
    `wordingVersion=2026-09-17-v1`,
    `submittedAt=${submittedAt}`
  ].join('\n');
}

function requestTags(type, body, referralCode) {
  const tags = [TAGS.website, TAGS[type]];
  if (body.contactConsent || body.conversationConsent || type === 'contact') tags.push(TAGS.contactRequested);
  if (referralCode) tags.push(TAGS.referral);
  if (body.test === true) tags.push(TAGS.test);
  return tags;
}

const FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com', 'outlook.com', 'hotmail.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'pm.me',
  'gmx.com', 'gmx.net', 'mail.com', 'zoho.com', 'yandex.com', 'hey.com', 'fastmail.com', 'tutanota.com',
  'comcast.net', 'verizon.net', 'att.net', 'sbcglobal.net', 'cox.net', 'bellsouth.net', 'charter.net', 'earthlink.net'
]);
const isFreeEmail = email => {
  const domain = email.split('@')[1] || '';
  return FREE_DOMAINS.has(domain) || /^(yahoo|hotmail|outlook|live)\.[a-z.]+$/.test(domain);
};

const siteUrl = () => (process.env.PUBLIC_SITE_URL || 'https://airesulting.com').replace(/\/$/, '');
const fromAddress = () => process.env.AIR_FROM_EMAIL || 'AI Resulting <hello@airesulting.com>';

async function sendDelivery({ type, email, name, assessmentText }) {
  if (!['assessment', 'kit'].includes(type) || !process.env.RESEND_API_KEY) return 'queued';
  const resend = new Resend(process.env.RESEND_API_KEY);
  const site = siteUrl();
  const firstName = clean(name, 100).split(/\s+/)[0] || 'there';
  const isKit = type === 'kit';
  const subject = isKit ? 'Your first useful AI workflow kit' : 'Where AI fits at your company';
  const text = isKit
    ? `Hi ${firstName},\n\nHere is your working kit.\n\nFillable PDF:\n${site}/assets/your-first-useful-ai-workflow.pdf\n\nOnline worksheet:\n${site}/ai-workflow-worksheet\n\nBring it to the table with the people who do the work.\n\nThis delivery does not subscribe you to marketing.\n\nAI Resulting`
    : `Hi ${firstName},\n\nHere are your results.\n\n${clean(assessmentText, 12000)}\n\nThese come from your own answers. They are a starting point, not an audit.\n\nAI Resulting`;
  const { error } = await resend.emails.send({ from: fromAddress(), to: email, subject, text });
  if (error) throw new Error(error.message || 'Resend rejected the email');
  return 'delivered';
}

// Sends Jen a copy of every lead when HighLevel is unavailable, so nothing is lost.
async function notifyLead({ reason, type, name, email, company, context, summary, responses, attr, requestId, deliveryStatus }) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.NOTIFY_EMAIL || 'hello@airesulting.com';
  const text = [
    `New website ${type} request (${reason}).`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    company && `Company: ${company}`,
    `Delivery: ${deliveryStatus}`,
    `Request ID: ${requestId}`,
    '',
    context && `Context:\n${context}\n`,
    summary && `Summary:\n${summary}\n`,
    responses && `Responses:\n${responses}\n`,
    attr.text
  ].filter(Boolean).join('\n');
  await resend.emails.send({ from: fromAddress(), to, replyTo: email, subject: `Website lead: ${name} (${type})`, text })
    .catch(err => console.error('AIR lead notification failed', { requestId, message: err.message }));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const body = req.body || {};
  if (body.website) return res.status(200).json({ success: true });

  const type = clean(body.type, 30);
  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const company = clean(body.company, 160);
  if (!REQUEST_TYPES.has(type) || !name || !validEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid name, email, and request type.' });
  }
  if (isFreeEmail(email)) {
    return res.status(400).json({ error: 'Please use your work email.' });
  }
  if (type === 'contact' && !body.contactConsent) {
    return res.status(400).json({ error: 'Consent to contact is required.' });
  }
  if (['assessment', 'kit'].includes(type) && !body.deliveryConsent) {
    return res.status(400).json({ error: 'Consent to deliver the requested material is required.' });
  }

  const requestId = randomUUID();
  const submittedAt = new Date().toISOString();
  const attr = attribution(req, body);
  const context = clean(body.context, 1500);
  const assessmentSummary = clean(body.assessmentSummary, 4000);
  const assessmentPriorities = clean(body.assessmentPriorities, 1500);
  const assessmentResponses = clean(body.assessmentResponses, 12000);
  const wantsDelivery = ['assessment', 'kit'].includes(type);

  // 1. Deliver what they asked for. This never depends on HighLevel.
  let deliveryStatus = 'not applicable';
  if (wantsDelivery) {
    try {
      deliveryStatus = await sendDelivery({ type, email, name, assessmentText: assessmentResponses || assessmentSummary });
    } catch (deliveryError) {
      deliveryStatus = 'failed';
      console.error('AIR delivery failed', { requestId, type, message: deliveryError.message });
    }
  }

  // 2. Record the lead in HighLevel. If that isn't possible, email the lead instead.
  let captured = false;
  let reason = 'HighLevel not configured';
  if (ghlConfig()) {
    try {
      const contact = await upsertContact({
        name,
        email,
        company,
        customFields: {
          [FIELD_KEYS.requestType]: type,
          [FIELD_KEYS.requestId]: requestId,
          [FIELD_KEYS.originalSource]: attr.source,
          [FIELD_KEYS.referralCode]: attr.referralCode,
          [FIELD_KEYS.assessmentVersion]: type === 'assessment' ? ASSESSMENT_VERSION : '',
          [FIELD_KEYS.resourceId]: type === 'kit' ? RESOURCE_ID : '',
          [FIELD_KEYS.resourceEdition]: type === 'kit' ? RESOURCE_EDITION : '',
          [FIELD_KEYS.deliveryStatus]: deliveryStatus,
          [FIELD_KEYS.consentRecord]: consentText(type, body, submittedAt),
          [FIELD_KEYS.assessmentSummary]: assessmentSummary,
          [FIELD_KEYS.assessmentPriorities]: assessmentPriorities,
          [FIELD_KEYS.assessmentResponses]: assessmentResponses,
          [FIELD_KEYS.contactContext]: context,
          [FIELD_KEYS.attribution]: attr.text
        }
      });
      const tags = requestTags(type, body, attr.referralCode);
      if (type === 'kit') {
        tags.push(deliveryStatus === 'delivered' ? TAGS.delivered : deliveryStatus === 'failed' ? TAGS.deliveryFailed : TAGS.deliveryPending);
      }
      await addTags(contact.id, tags);
      captured = true;
    } catch (error) {
      reason = 'HighLevel handoff failed';
      console.error('AIR GHL capture failed', { requestId, type, status: error.status, message: error.message });
    }
  }
  if (!captured) {
    await notifyLead({ reason, type, name, email, company, context, summary: assessmentPriorities || assessmentSummary,
      responses: assessmentResponses, attr, requestId, deliveryStatus });
  }

  if (!captured && !process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'We could not complete the handoff. Please try again.', requestId });
  }
  return res.status(deliveryStatus === 'failed' ? 202 : 200).json({
    success: true,
    requestId,
    deliveryStatus,
    bookingUrl: process.env.AIR_BOOKING_URL || null
  });
};
