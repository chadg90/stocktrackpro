# Stripe Integration Setup Guide

This guide walks you through completing the Stripe integration for Stock Track PRO.

## Prerequisites

- ✅ Stripe account created and logged in
- ✅ Environment variables configured (`.env.local`)

## Step 1: Create Products and Prices in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Products**
2. Create **4 products** (one for each tier):

### Product 1: Starter
- **Name:** Stock Track PRO - Starter
- **Description:** Perfect for individual users
- **Pricing:** 
  - **Recurring:** Monthly
  - **Price:** £19.99 GBP
- **Metadata:** (optional) `tier: PRO_STARTER`

### Product 2: Team
- **Name:** Stock Track PRO - Team
- **Description:** Ideal for small teams
- **Pricing:**
  - **Recurring:** Monthly
  - **Price:** £49.99 GBP
- **Metadata:** (optional) `tier: PRO_TEAM`

### Product 3: Business
- **Name:** Stock Track PRO - Business
- **Description:** For growing businesses
- **Pricing:**
  - **Recurring:** Monthly
  - **Price:** £99.99 GBP
- **Metadata:** (optional) `tier: PRO_BUSINESS`

### Product 4: Enterprise
- **Name:** Stock Track PRO - Enterprise
- **Description:** For large organizations
- **Pricing:**
  - **Recurring:** Monthly
  - **Price:** £119.99 GBP
- **Metadata:** (optional) `tier: PRO_ENTERPRISE`

3. **Copy the Price IDs** (they start with `price_...`) for each product
4. Add them to your `.env.local`:
   ```bash
   STRIPE_PRICE_STARTER=price_xxxxx
   STRIPE_PRICE_TEAM=price_xxxxx
   STRIPE_PRICE_BUSINESS=price_xxxxx
   STRIPE_PRICE_ENTERPRISE=price_xxxxx
   ```

## Step 2: Set Up Webhook Endpoint

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`
   - Replace `yourdomain.com` with your actual domain (e.g., `stocktrackpro.co.uk`)
   - For local testing: Use Stripe CLI (see below)
4. **Events to send:** Select these events:
   - `checkout.session.completed` (fires immediately after checkout, including trials)
   - `invoice.paid` (fires when invoice is paid, including after trial ends)
   - `customer.subscription.updated` (fires when subscription changes)
   - `customer.subscription.deleted` (fires when subscription is canceled)
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### Local Testing with Stripe CLI

If testing locally, install Stripe CLI and forward webhooks:

```bash
# Install Stripe CLI (if not installed)
# macOS: brew install stripe/stripe-cli/stripe
# Or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret shown (whsec_...)
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

## Step 3: Configure Billing Portal

1. Go to Stripe Dashboard → **Settings** → **Billing** → **Customer portal**
2. **Enable** the Customer portal
3. Configure settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to update billing details
   - ✅ Show invoice history
4. **Save changes**

## Step 4: Verify Environment Variables

Ensure your `.env.local` has all required Stripe variables:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_...  # or sk_test_... for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # or pk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_TEAM=price_...
STRIPE_PRICE_BUSINESS=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Website URL (for redirects)
NEXT_PUBLIC_APP_URL=https://stocktrackpro.co.uk
```

## Step 5: Test the Integration

### Test Checkout Flow

1. Log in to your dashboard as a manager/admin
2. Go to **Pricing** page (`/pricing`)
3. Click **Subscribe** on any tier
4. You should be redirected to Stripe Checkout
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. Complete checkout
7. You should be redirected to `/return/subscription-success`
8. Check Firestore `companies/{companyId}` document:
   - `subscription_status` should be `active`
   - `subscription_tier` should match the tier
   - `stripe_subscription_id` should be set
   - `stripe_customer_id` should be set

### Test Webhook

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Find your endpoint and click **Send test webhook**
3. Select event: `customer.subscription.updated`
4. Check your server logs (Vercel logs or local console) for webhook processing
5. Verify the company document in Firestore was updated

### Test Billing Portal

1. In dashboard, click **Manage subscription** (in sidebar)
2. Should open Stripe Customer Portal
3. Verify you can:
   - Update payment method
   - View invoices
   - Cancel subscription (if needed)

## Troubleshooting

### Checkout fails with "Invalid tier"
- Verify price IDs in `.env.local` match Stripe Dashboard
- Ensure tier names match exactly: `PRO_STARTER`, `PRO_TEAM`, `PRO_BUSINESS`, `PRO_ENTERPRISE`

### Webhook not receiving events
- Verify webhook URL is correct and accessible
- Check webhook signing secret matches
- For local testing, ensure Stripe CLI is forwarding
- Check Vercel/server logs for errors

### Subscription not updating in Firestore
- Check webhook endpoint is receiving events
- Verify `company_id` is in subscription metadata
- Check Firestore security rules allow webhook updates
- Review server logs for webhook processing errors

### "Could not load the default credentials" error

This means `FIREBASE_SERVICE_ACCOUNT_JSON` is not set correctly in Vercel.

**Fix:**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find or add `FIREBASE_SERVICE_ACCOUNT_JSON`
3. **Important:** The JSON must be on a **single line** (no line breaks)
   - Copy the entire JSON from Firebase Console
   - Remove all line breaks/newlines
   - Paste it as one continuous string
   - Example: `{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}`
4. Make sure it's set for **Production** environment (and Preview if needed)
5. **Redeploy** your site after adding/updating the variable

**To convert multi-line JSON to single line:**
- Use an online JSON minifier, or
- Copy the JSON and remove all newlines manually, or
- Use this command: `cat service-account.json | jq -c .` (if you have jq installed)

### Billing portal says "No subscription linked"
- Ensure company has `stripe_customer_id` set
- This is set automatically when checkout completes
- If missing, check webhook processed `invoice.paid` event

## App vs website subscriptions

The dashboard shows a subscription as **active** whenever the company document has `subscription_status` set to `'active'` or `'trial'` in Firestore. That can be set in two ways:

1. **Website**: User completes Stripe Checkout → webhooks update the company → `subscription_status` and `stripe_customer_id` are set. "Manage Billing Portal" then works.
2. **App**: When the user completes a subscription inside the app (e.g. in-app purchase or Stripe in-app), the app should call the **Set subscription status** API so the dashboard shows them as active.

### Set subscription status API (for app use)

- **Endpoint:** `POST /api/subscription/set-status`
- **Auth:** `Authorization: Bearer <firebase-id-token>` (manager or admin only)
- **Body:** `{ "subscription_status": "active" | "trial" | "inactive", "subscription_tier": "PRO_STARTER" | "PRO_TEAM" | "PRO_BUSINESS" | "PRO_ENTERPRISE" (optional) }`
- **Effect:** Updates the company document with `subscription_status` and optional `subscription_tier`, and sets `subscription_type: 'app'`. No Stripe customer is required; the dashboard will show the subscription as active and allow access.

After the app calls this API, the user will see the subscription as active on the dashboard. "Manage Billing Portal" will remain disabled (and show a friendly message) until they also have a Stripe subscription linked via the website.

## Going Live

1. **Switch to Live Mode** in Stripe Dashboard
2. **Update API keys** in `.env.local`:
   - Replace `sk_test_...` with `sk_live_...`
   - Replace `pk_test_...` with `pk_live_...`
3. **Create live products/prices** (repeat Step 1 in live mode)
4. **Update price IDs** in `.env.local` with live price IDs
5. **Create live webhook endpoint** (repeat Step 2 in live mode)
6. **Update webhook secret** in `.env.local`
7. **Deploy** to production with updated environment variables

## Security Notes

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Use environment variables in Vercel/your hosting platform
- ✅ Webhook signature verification is already implemented
- ✅ Rate limiting is enabled on checkout and webhook endpoints
- ✅ Only managers/admins can start checkout (verified in API)

## Support

If you encounter issues:
1. Check Stripe Dashboard → **Developers** → **Logs** for API errors
2. Check your server logs (Vercel Functions logs)
3. Verify all environment variables are set correctly
4. Test with Stripe test mode first before going live
