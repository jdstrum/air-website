const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

const FIELD_KEYS = {
  requestType: 'air_last_request_type',
  requestId: 'air_last_request_id',
  originalSource: 'air_original_source',
  referralCode: 'air_referral_code',
  assessmentVersion: 'air_assessment_version',
  resourceId: 'air_resource_id',
  resourceEdition: 'air_resource_edition',
  deliveryStatus: 'air_delivery_status',
  consentRecord: 'air_consent_record',
  assessmentSummary: 'air_assessment_summary',
  assessmentPriorities: 'air_assessment_priorities',
  assessmentResponses: 'air_assessment_responses',
  contactContext: 'air_contact_context',
  attribution: 'air_attribution'
};

const TAGS = {
  website: 'air-source-website',
  assessment: 'air-request-assessment',
  kit: 'air-request-kit',
  contact: 'air-request-contact',
  contactRequested: 'air-contact-requested',
  meetingBooked: 'air-meeting-booked',
  deliveryPending: 'air-kit-delivery-pending',
  delivered: 'air-kit-delivered',
  deliveryFailed: 'air-kit-delivery-failed',
  referral: 'air-referral-attributed',
  test: 'air-test-record'
};

function ghlConfig() {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) return null;
  return { token, locationId };
}

async function ghlRequest(path, options = {}) {
  const config = ghlConfig();
  if (!config) throw new Error('GHL_NOT_CONFIGURED');

  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      Version: 'v3',
      ...(options.headers || {})
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`GHL request failed (${response.status})`);
    error.status = response.status;
    error.details = body;
    throw error;
  }
  return body;
}

async function upsertContact({ name, email, company, customFields }) {
  const config = ghlConfig();
  const result = await ghlRequest('/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      companyName: company || undefined,
      locationId: config.locationId,
      source: 'AI Resulting website',
      customFields: Object.entries(customFields)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, fieldValue]) => ({ key, fieldValue: String(fieldValue) }))
    })
  });
  return result.contact;
}

async function addTags(contactId, tags) {
  const cleanTags = [...new Set(tags.filter(Boolean))];
  if (!cleanTags.length) return;
  await ghlRequest(`/contacts/${encodeURIComponent(contactId)}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags: cleanTags })
  });
}

async function updateContactFields(contactId, customFields) {
  await ghlRequest(`/contacts/${encodeURIComponent(contactId)}`, {
    method: 'PUT',
    body: JSON.stringify({
      customFields: Object.entries(customFields)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, fieldValue]) => ({ key, fieldValue: String(fieldValue) }))
    })
  });
}

module.exports = {
  FIELD_KEYS,
  TAGS,
  addTags,
  ghlConfig,
  updateContactFields,
  upsertContact
};
