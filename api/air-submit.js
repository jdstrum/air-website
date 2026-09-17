const { randomUUID } = require('crypto');
const { Resend } = require('resend');
const {
  FIELD_KEYS,
  TAGS,
  addTags,
  ghlConfig,
  updateContactFields,
  upsertContact
} = require('./_air-ghl');

const REQUEST_TYPES = new Set(['assessment', 'kit', 'contact']);
const ASSESSMENT_VERSION = '2026-09-08-v6';
const RESOURCE_ID = 'first-useful-ai-workflow';
const RESOURCE_EDITION = '2026-09-08-v1';

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

async function sendDelivery({ type, email, name, assessmentText }) {
  if (!['assessment', 'kit'].includes(type) || !process.env.RESEND_API_KEY) return 'queued';
  const resend = new Resend(process.env.RESEND_API_KEY);
  const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://www.airesulting.com').replace(/\/$/, '');
  const firstName = clean(name, 100).split(/\s+/)[0] || 'there';
  const isKit = type === 'kit';
  const subject = isKit ? 'Your first useful AI workflow kit' : 'Your AI Resulting readiness picture';
  const text = isKit
    ? `Hi ${firstName},\n\nYour AI Resulting working kit is ready:\n${siteUrl}/assets/your-first-useful-ai-workflow.pdf\n\nThis delivery does not subscribe you to marketing.\n\nAI Resulting`
    : `Hi ${firstName},\n\nHere is your initial readiness picture.\n\n${clean(assessmentText, 12000)}\n\nThis is a self-reported, directional interpretation, not an audit or certification.\n\nAI Resulting`;

  await resend.emails.send({
    from: process.env.AIR_FROM_EMAIL || 'AI Resulting <noreply@send.airesulting.com>',
    to: email,
    subject,
    text
  });
  return 'delivered';
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!ghlConfig()) return res.status(503).json({ error: 'Lead capture is not configured yet.' });

  const body = req.body || {};
  if (body.website) return res.status(200).json({ success: true });

  const type = clean(body.type, 30);
  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const company = clean(body.company, 160);
  if (!REQUEST_TYPES.has(type) || !name || !validEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid name, email, and request type.' });
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
        [FIELD_KEYS.deliveryStatus]: ['assessment', 'kit'].includes(type) ? 'accepted' : 'not applicable',
        [FIELD_KEYS.consentRecord]: consentText(type, body, submittedAt),
        [FIELD_KEYS.assessmentSummary]: assessmentSummary,
        [FIELD_KEYS.assessmentPriorities]: assessmentPriorities,
        [FIELD_KEYS.assessmentResponses]: assessmentResponses,
        [FIELD_KEYS.contactContext]: context,
        [FIELD_KEYS.attribution]: attr.text
      }
    });

    await addTags(contact.id, requestTags(type, body, attr.referralCode));

    let deliveryStatus = 'not applicable';
    if (['assessment', 'kit'].includes(type)) {
      try {
        deliveryStatus = await sendDelivery({ type, email, name, assessmentText: assessmentResponses || assessmentSummary });
        await updateContactFields(contact.id, { [FIELD_KEYS.deliveryStatus]: deliveryStatus });
        if (type === 'kit') await addTags(contact.id, [deliveryStatus === 'delivered' ? TAGS.delivered : TAGS.deliveryPending]);
      } catch (deliveryError) {
        deliveryStatus = 'failed';
        await updateContactFields(contact.id, { [FIELD_KEYS.deliveryStatus]: deliveryStatus }).catch(() => {});
        if (type === 'kit') await addTags(contact.id, [TAGS.deliveryFailed]).catch(() => {});
        console.error('AIR delivery failed', { requestId, type, message: deliveryError.message });
      }
    }

    return res.status(deliveryStatus === 'failed' ? 202 : 200).json({
      success: true,
      requestId,
      deliveryStatus,
      bookingUrl: process.env.AIR_BOOKING_URL || null
    });
  } catch (error) {
    console.error('AIR GHL capture failed', { requestId, type, status: error.status, message: error.message });
    return res.status(502).json({ error: 'We could not complete the handoff. Please try again.', requestId });
  }
};
