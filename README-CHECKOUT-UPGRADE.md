# Stripe Bundle Checkout — Implementation Guide

## What Changed

### 1. `lib/stripe.ts` (simplified)
- Removed hardcoded `PLANS` object and `PlanKey` type
- Pricing now comes from `agent_bundles` table (already seeded with Stripe IDs)
- Only exports `stripe` instance

### 2. `app/api/stripe/checkout/route.ts` (rewritten)
- Accepts `{ bundle, billingPeriod, userId, email }` instead of `{ plan }`
- Looks up `agent_bundles` by slug to get real Stripe price IDs
- Passes `bundle_id`, `bundle_slug`, `billing_period` in session metadata
- Success redirects to `/onboarding` (not `/billing`)
- Supports promo codes (`allow_promotion_codes: true`)

### 3. `app/api/stripe/webhook/route.ts` (rewritten)
- **checkout.session.completed** now auto-provisions:
  - Creates a company for the new customer
  - Adds user as company owner
  - Upserts subscription with company_id
  - Grants agent access for all agents in the purchased bundle
- **customer.subscription.deleted** now revokes agent access
- All events log to console for debugging

### 4. `app/pricing/page.tsx` (patch)
- `handleSubscribe` sends `bundle` (slug) + `billingPeriod` instead of `plan` (tier)

### 5. Migration 019
- Creates `company_agent_access` table (tracks which agents each company can use)
- Adds `company_id` column to `subscriptions`
- Adds unique constraint on `company_members(company_id, user_id)`
- RLS policies for tenant isolation

## Deployment Steps

```bash
# 1. Run migration in Supabase SQL Editor
#    Copy contents of migration-019-checkout-provisioning.sql

# 2. Replace files in your repo
cp lib/stripe.ts              ~/Desktop/ai-ecosystem/ai-agent-platform/lib/stripe.ts
cp app/api/stripe/checkout/route.ts  ~/Desktop/ai-ecosystem/ai-agent-platform/app/api/stripe/checkout/route.ts
cp app/api/stripe/webhook/route.ts   ~/Desktop/ai-ecosystem/ai-agent-platform/app/api/stripe/webhook/route.ts

# 3. Update pricing page handleSubscribe (see PRICING_PAGE_PATCH.ts)

# 4. Remove old env vars from Vercel (no longer needed):
#    STRIPE_PRICE_STARTER
#    STRIPE_PRICE_PROFESSIONAL
#    STRIPE_PRICE_ENTERPRISE

# 5. Verify these env vars ARE set in Vercel:
#    STRIPE_SECRET_KEY          (live key, sk_live_...)
#    STRIPE_WEBHOOK_SECRET      (whsec_...)
#    NEXT_PUBLIC_SUPABASE_URL
#    SUPABASE_SERVICE_ROLE_KEY

# 6. Register webhook in Stripe Dashboard → Developers → Webhooks
#    URL: https://www.woulfai.com/api/stripe/webhook
#    Events:
#      checkout.session.completed
#      customer.subscription.updated
#      customer.subscription.deleted
#      invoice.payment_failed

# 7. Deploy
git add -A && git commit -m "feat: bundle-aware Stripe checkout with auto-provisioning" && git push

# 8. Test with Stripe test mode first (swap keys temporarily)
```

## Purchase Flow (End to End)

```
User clicks "Subscribe" on pricing page
  → handleSubscribe sends { bundle: "starter-pack", billingPeriod: "monthly" }
  → /api/stripe/checkout looks up agent_bundles where slug = "starter-pack"
  → Gets stripe_price_id_monthly = "price_1Qxxx..."
  → Creates Stripe Checkout Session with that price
  → User completes payment on Stripe hosted page
  → Stripe fires checkout.session.completed webhook
  → /api/stripe/webhook:
      1. Creates company for user
      2. Adds user as owner
      3. Creates active subscription
      4. Looks up agent_bundle_links for starter-pack
      5. Grants access to all 5 starter agents
  → User redirected to /onboarding?session_id=cs_xxx
  → Onboarding page: connect software, invite team, start using agents
```

## Files Affected

| File | Action |
|------|--------|
| `lib/stripe.ts` | Replace entirely |
| `app/api/stripe/checkout/route.ts` | Replace entirely |
| `app/api/stripe/webhook/route.ts` | Replace entirely |
| `app/pricing/page.tsx` | Patch handleSubscribe |
| Supabase | Run migration 019 |
| Vercel env vars | Clean up old, verify current |
| Stripe Dashboard | Register webhook URL |
