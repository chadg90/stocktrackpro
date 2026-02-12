# Testing Stripe in Test Mode

## Step 1: Create Test Mode Products/Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Toggle to "Test mode"** (switch in top right)
3. Go to **Products** → Create the same 4 products:
   - Starter (£19.99/month)
   - Team (£49.99/month)
   - Business (£99.99/month)
   - Enterprise (£119.99/month)
4. **Copy the Test Price IDs** (they'll be different from live ones)

## Step 2: Update .env.local for Test Mode

Replace your Stripe keys with **test mode** keys:

```bash
# Stripe (TEST MODE)
STRIPE_SECRET_KEY=sk_test_xxxxx  # Get from Dashboard → Developers → API keys (Test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Test mode publishable key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Test mode webhook secret (see Step 3)

# Stripe Price IDs (TEST MODE - these will be different from live)
STRIPE_PRICE_STARTER=price_test_xxxxx
STRIPE_PRICE_TEAM=price_test_xxxxx
STRIPE_PRICE_BUSINESS=price_test_xxxxx
STRIPE_PRICE_ENTERPRISE=price_test_xxxxx

# Use localhost for local testing, or your test domain
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For local testing
# OR
NEXT_PUBLIC_APP_URL=https://your-test-domain.com  # For deployed test
```

## Step 3: Set Up Test Mode Webhook

### Option A: Local Testing (Recommended)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** shown (starts with `whsec_...`)
5. **Add to `.env.local`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # The one from Stripe CLI
   ```

6. **Start your dev server:**
   ```bash
   npm run dev
   ```

### Option B: Deployed Test Environment

1. Deploy to a test/staging URL (e.g., Vercel preview)
2. In Stripe Dashboard (Test mode) → **Developers** → **Webhooks**
3. **Add endpoint:** `https://your-test-url.com/api/webhooks/stripe`
4. Select events: `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the webhook secret to `.env.local`

## Step 4: Test Cards

Use these test card numbers in Stripe Checkout:

### Success Cards:
- **Card:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### Other Test Cards:
- **Decline:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`
- **3D Secure:** `4000 0027 6000 3184`

[Full list of test cards](https://stripe.com/docs/testing)

## Step 5: Test the Flow

1. **Start your local server:**
   ```bash
   npm run dev
   ```

2. **Open:** `http://localhost:3000`

3. **Log in** as a manager/admin

4. **Go to:** `/pricing`

5. **Click "Subscribe"** on any tier

6. **Use test card:** `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`

7. **Complete checkout**

8. **Verify:**
   - ✅ Redirects to `/return/subscription-success`
   - ✅ Check Stripe Dashboard → **Customers** → Should see test customer
   - ✅ Check Stripe Dashboard → **Subscriptions** → Should see active subscription
   - ✅ Check Firestore `companies/{companyId}`:
     - `subscription_status: 'active'`
     - `subscription_tier: 'PRO_STARTER'` (or selected tier)
     - `stripe_subscription_id` set
     - `stripe_customer_id` set

9. **Test webhook:**
   - Check terminal running `stripe listen` (if local) or Stripe Dashboard → Webhooks → View logs
   - Should see `invoice.paid` event processed

10. **Test billing portal:**
    - In dashboard sidebar, click **"Manage subscription"**
    - Should open Stripe Customer Portal
    - Verify you can see subscription details

## Step 6: Test Subscription Updates

1. In Stripe Dashboard (Test mode) → **Subscriptions**
2. Find your test subscription
3. Click **"..."** → **Update subscription**
4. Change tier or cancel
5. Verify Firestore updates via webhook

## Troubleshooting

### Checkout fails
- ✅ Verify test mode keys are set (not live keys)
- ✅ Check price IDs match test mode products
- ✅ Ensure `NEXT_PUBLIC_APP_URL` is correct

### Webhook not working (local)
- ✅ Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- ✅ Check webhook secret matches CLI output
- ✅ Verify dev server is running on port 3000

### Webhook not working (deployed)
- ✅ Verify webhook URL is accessible
- ✅ Check webhook secret matches Stripe Dashboard
- ✅ View webhook logs in Stripe Dashboard → Webhooks → Your endpoint → Logs

### Subscription not updating in Firestore
- ✅ Check webhook is receiving events (Dashboard → Webhooks → Logs)
- ✅ Verify `company_id` is in subscription metadata
- ✅ Check server logs (Vercel Functions logs) for errors

## Switching Back to Live Mode

When ready for production:

1. **Create live products/prices** (repeat Step 1 in **Live mode**)
2. **Switch to live keys** in `.env.local`:
   - `sk_live_...` instead of `sk_test_...`
   - `pk_live_...` instead of `pk_test_...`
3. **Update price IDs** with live price IDs
4. **Set up live webhook** endpoint
5. **Update `NEXT_PUBLIC_APP_URL`** to production domain
6. **Deploy** with live environment variables

## Quick Test Checklist

- [ ] Stripe Dashboard in Test mode
- [ ] Test products/prices created
- [ ] Test keys in `.env.local`
- [ ] Test price IDs in `.env.local`
- [ ] Webhook set up (CLI or Dashboard)
- [ ] Test card works: `4242 4242 4242 4242`
- [ ] Checkout redirects correctly
- [ ] Firestore company updated
- [ ] Billing portal opens
- [ ] Webhook events processed
