# AI Resulting — cinematic launch candidate

Updated: 2026-09-10

This branch contains the approved cinematic site currently reviewed at the private AI Resulting launch-review URL. It is organized as individual static HTML pages with shared CSS, JavaScript, and assets for Vercel.

The existing Vercel production deployment should remain in place until the HighLevel contact, assessment, resource-delivery, and booking flows have been connected and verified. Until then, the forms intentionally identify themselves as previews and do not transmit visitor information.

## Primary website files

- `index.html` — homepage
- `strategic-direction.html`
- `data-readiness.html`
- `technology-infrastructure.html`
- `governance-security.html`
- `experience-layer.html`
- `workforce-adoption.html`
- `our-approach.html`
- `the-signal.html` — The Signal index
- `ai-workflow-starter-kit.html`
- `show-me-the-finished-work.html`
- `style.css` and the supporting shared stylesheets

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

1. Connect and verify HighLevel contact, assessment, kit-delivery, assignment, and booking flows.
2. Approve and publish accurate privacy information, then link it from every footer and form.
3. Verify referral attribution, legacy routes, mobile/keyboard use, email delivery, and calendar behavior on the Vercel preview.
4. Promote only the verified preview deployment to production.

## Candidate validation completed 2026-09-10

- Confirmed GitHub repository: `jdstrum/air-website`, default branch `main`.
- Confirmed the Vercel production domain remains `airesulting.vercel.app`.
- Copied the approved cinematic release files byte-for-byte from the validated source build.
- Preserved the existing Vercel functions, dependencies, legacy assets, and referral rewrite.
- Updated legacy redirects to the new page names.
- Passed the assessment, six-dimension interaction, page-structure, link, metadata, sitemap, robots, JavaScript, and configuration checks.

## Safe release path

1. Push the replacement branch and let Vercel create its preview deployment.
2. Connect HighLevel and add the final privacy disclosure on this branch.
3. Verify navigation, forms, redirects, assessment capture, delivery, booking, and referral attribution on the Vercel preview.
4. Merge only after the preview is approved for production.

Do not replace the live default branch directly. The preview-and-merge path keeps the current Vercel site recoverable until the new version is approved.
