# AI Resulting — GitHub staging source

Updated: 2026-08-27

This folder is the clean, production-named version of the current website work. The dated `PROPOSED` files one level up remain the visual review copies. Continue reviewing those previews; approved changes should be carried into this folder before deployment.

Nothing in this folder has been pushed to GitHub or Vercel.

## Primary website files

- `index.html` — homepage
- `strategic-direction.html`
- `data-readiness.html`
- `technology-infrastructure.html`
- `governance-security.html`
- `customer-experience.html`
- `workforce-adoption.html`
- `our-approach.html`
- `signal.html` — The Signal index
- `signal-ai-budget.html` — first Signal article
- `air.css` — shared dimension-page styles
- `privacy.html`

## Preserved production functions

The existing assessment and governance-download support has been retained so a future repository replacement does not silently discard working functionality:

- `assessment.html`
- `governance.html`
- `api/`
- `assets/`
- `AIR-AI-Acceptable-Use-Policy.pdf`
- `package.json`
- `vercel.json`

The serverless functions require the existing Vercel environment variables, including `RESEND_API_KEY` and `NOTIFY_EMAIL` where used.

## Open before launch

1. Replace the temporary Jai form behavior with the Ubix avatar link or embed once supplied.
2. Decide whether the three external items in The Signal's “Worth noticing” section should remain external or be replaced with AIR-owned commentary.
3. Complete final desktop and mobile QA on the Vercel preview.

## Deployment audit completed 2026-08-27

- Confirmed GitHub repository: `jdstrum/air-website`, default branch `main`.
- Confirmed Vercel project: `jstrum68-8749s-projects/airesulting`.
- Confirmed production domain: `airesulting.vercel.app`.
- Confirmed the Vercel project has the required `RESEND_API_KEY` and `NOTIFY_EMAIL` environment-variable names. Values were not read or changed.
- Added `api/capture-conversation.js` and connected both homepage forms to it. The Resultant form now sends a lead notification instead of displaying a false success state.
- Preserved the assessment, governance download, referral redirect, and their serverless functions under `api/`.
- Added permanent redirects for every legacy page currently present in the production repository.
- Corrected `robots.txt`, `sitemap.xml`, and governance-email links to use the attached production domain.
- Passed local link, asset, metadata, JavaScript syntax, JSON syntax, and mobile-width overflow checks across all 13 HTML pages.

The only functional handoff still required is the approved Ubix destination link or embed. Until that is supplied, the Jai form captures the visitor's context but does not send them into the prototype.

## Safe release path

1. Connect or identify the existing GitHub repository.
2. Create a replacement branch from the current default branch.
3. Merge this staging source with any live-only files and environment configuration.
4. Open a draft pull request and use its Vercel preview for final review.
5. Merge only after navigation, forms, redirects, assessment capture, and the Ubix handoff have been verified.

Do not replace the live default branch directly. The preview-and-merge path keeps the current Vercel site recoverable until the new version is approved.
