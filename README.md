# PivotIQ — AI Career Risk Auditor

A Next.js app that gives users a personalized AI job displacement risk score and 90-day pivot plan, powered by OpenRouter with Nemotron Nano.

---

## Quick Start (Run Locally)

```bash
# 1. Install dependencies
npm install

# 2. Add your OpenRouter API key
cp .env.example .env.local
# Open .env.local and paste your key from https://openrouter.ai/

# 3. Start the dev server
npm run dev

# 4. Open http://localhost:3000
```

---

## Deploy to Vercel (Free, ~5 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
vercel

# Add your API key to Vercel environment variables:
# Go to vercel.com → your project → Settings → Environment Variables
# Add: OPENROUTER_API_KEY = your_key_here
```

That's it. Your app is live at https://yourapp.vercel.app

---

## Add Stripe Payments

When you're ready to charge real money ($29/report):

```bash
npm install stripe @stripe/stripe-js
```

1. Create a Stripe account at stripe.com
2. Get your API keys from stripe.com/dashboard/apikeys
3. Add to .env.local:
   - STRIPE_SECRET_KEY=sk_live_...
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
4. Create app/api/checkout/route.js (see Stripe Checkout quickstart)
5. Update the "Get My Report" button in app/audit/page.js to redirect to Stripe Checkout
6. Add a webhook handler that triggers report generation after successful payment

Guide: https://stripe.com/docs/checkout/quickstart

---

## Add Email Delivery (Resend — Free up to 3K/month)

```bash
npm install resend
```

1. Sign up at resend.com
2. Add RESEND_API_KEY to .env.local
3. Uncomment the Resend block in app/api/generate-report/route.js

---

## Add Airtable Logging

1. Create a free Airtable base with columns: Email, JobTitle, Industry, Report, CreatedAt
2. Get your API key from airtable.com/account
3. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID to .env.local
4. Uncomment the Airtable block in app/api/generate-report/route.js

---

## File Structure

```
app/
  page.js                      ← Landing page
  audit/page.js                ← Multi-step quiz flow
  report/page.js               ← Report display (3 tabs)
  api/generate-report/route.js ← OpenRouter API call
  globals.css                  ← Theme variables
```

---

## Live Jobs Catalog

PivotIQ can also ingest live job descriptions into Supabase from public ATS feeds and approved APIs.

```bash
npm run db:apply-schema
npm run db:seed-job-sources
npm run db:sync-job-openings
npm run db:enrich-job-openings
```

Supported providers in this first pass:
- Greenhouse
- Lever
- SmartRecruiters
- Remote OK
- Adzuna (optional, requires API keys)

See [docs/job-openings-catalog.md](./docs/job-openings-catalog.md) for details.

The catalog now also supports:
- `GET /api/job-openings/search`
- `POST /api/job-openings/gap-analysis`
- live-market grounding inside full report pivots so PivotIQ can compare model skill gaps against real current job requirements

---

## Cost Per Report

| Model                             | Cost/report | Use for     |
|-----------------------------------|-------------|-------------|
| nvidia/nemotron-3-nano-30b-a3b:free | $0.00     | All reports |

At $29/report with free-model generation cost → **very high margin**

---

## Validation Checklist (Before Launch)

- [ ] Run 10 test audits on different job titles — check quality
- [ ] Confirm report displays correctly on mobile
- [ ] Test the full flow: quiz → scan animation → report
- [ ] Connect Stripe and do a real $1 test charge
- [ ] Set up Resend and confirm email delivery
- [ ] Buy domain on Namecheap (~$12/year) and connect to Vercel
- [ ] Post on r/careerguidance, r/jobs, LinkedIn
