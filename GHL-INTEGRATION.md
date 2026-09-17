# AI Resulting → HighLevel integration

This branch prepares the website intake endpoint without publishing or activating it.

## HighLevel objects in place

- Contact custom-field folder: `AI Resulting`
- 13 AIR contact fields with keys documented in `api/_air-ghl.js`
- Tag category: `AI Resulting`
- 11 AIR tags with names documented in `api/_air-ghl.js`
- Pipeline: `AIR — Advisory Opportunities`
- Calendar: `AI Resulting — Introductory Call with Jennifer` (30 minutes, Arizona timezone, inactive until availability is supplied)

## Required Vercel environment variables

- `GHL_PRIVATE_INTEGRATION_TOKEN` — private sub-account token; keep server-side only
- `GHL_LOCATION_ID` — `oHd8UFuAA5ynmOJjgjhy`
- `AIR_BOOKING_URL` — public booking URL after the calendar is activated
- `RESEND_API_KEY` — required for assessment and kit delivery
- `AIR_FROM_EMAIL` — optional; defaults to `AI Resulting <noreply@send.airesulting.com>`
- `PUBLIC_SITE_URL` — optional; defaults to `https://www.airesulting.com`

The private integration needs contact write access sufficient to upsert contacts, update custom fields, and add tags. The token must never be included in browser JavaScript or committed to Git.

## Inactive items before launch

1. Create the private integration token and add it to Vercel Preview only.
2. Set Jennifer's calendar availability, choose Zoom or Teams, and activate the calendar.
3. Add the resulting booking URL to `AIR_BOOKING_URL`.
4. Verify assessment, kit, contact, consent, referral, retry, and test-record behavior on a protected Vercel preview.
5. Activate workflow notifications only after a successful test submission.

## Workflow blueprints

Keep these workflows in draft until the protected preview passes end to end.

### AIR — Website request intake

- Trigger when any of `air-request-assessment`, `air-request-kit`, or `air-request-contact` is added.
- Assign the contact to Jennifer.
- Create or update an open opportunity in `AIR — Advisory Opportunities` at `New inquiry`.
- Move requests carrying `air-contact-requested` to `Contact requested`.
- Send one internal notification containing the contact, request type, company, context, and referral code.
- Exclude `air-test-record` from reporting and outreach branches.

### AIR — Introductory call booked

- Trigger when an appointment is booked on `AI Resulting — Introductory Call with Jennifer`.
- Add `air-meeting-booked`.
- Move the opportunity to `Meeting booked`.
- Send the normal appointment confirmation only after Zoom or Teams is selected and verified.

### AIR — Resource delivery exception

- Trigger on `air-kit-delivery-failed`.
- Notify Jennifer with the contact and AIR request ID.
- Do not start marketing or an advisor-contact sequence unless the corresponding consent was recorded.
