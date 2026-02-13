# Stripe Subscription Testing Guide

This guide helps you test the complete Stripe subscription flow and verify it integrates correctly with Firebase.

## Prerequisites

1. ✅ Stripe account (test mode)
2. ✅ Firebase project configured
3. ✅ Environment variables set up
4. ✅ Test products/prices created in Stripe
5. ✅ Webhook endpoint configured

## Step 1: Set Up Test Mode

### 1.1 Use Stripe Test Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Ensure you're in **Test mode** (toggle in top right)
3. Create test products/prices if not already created:
   - **Starter**: £19.99/month → Price ID: `price_test_xxxxx`
   - **Team**: £34.99/month → Price ID: `price_test_xxxxx`
   - **Business**: £49.99/month → Price ID: `price_test_xxxxx`
   - **Enterprise**: £119.99/month → Price ID: `price_test_xxxxx`

### 1.2 Configure Test Environment Variables

In `.env.local` (for local testing) or Vercel environment variables:

```bash
# Use TEST keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Test Price IDs
STRIPE_PRICE_STARTER=price_test_...
STRIPE_PRICE_TEAM=price_test_...
STRIPE_PRICE_BUSINESS=price_test_...
STRIPE_PRICE_ENTERPRISE=price_test_...
```

### 1.3 Set Up Local Webhook Testing (Optional)

For local testing, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret shown (whsec_...)
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

## Step 2: Test Checkout Flow

### 2.1 Test Basic Subscription

1. **Start your local server** (or use deployed site):
   ```bash
   npm run dev
   ```

2. **Log in** to dashboard as a manager/admin user

3. **Navigate** to `/dashboard/subscription` or `/pricing`

4. **Click "Subscribe"** on any tier (e.g., Starter)

5. **Verify checkout session created**:
   - Check browser console for logs
   - Should redirect to Stripe Checkout page
   - URL should be `https://checkout.stripe.com/...`

6. **Complete checkout** with test card:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

7. **Verify redirect**:
   - Should redirect to `/return/subscription-success`
   - Check URL parameters if any

### 2.2 Test Trial Period (New Company)

1. **Create a new company** (or use one without `stripe_subscription_id`)

2. **Subscribe** to any tier

3. **Verify trial applied**:
   - Check Stripe Dashboard → Subscriptions
   - Subscription should show "Trial ends: [7 days from now]"
   - First invoice should be $0.00

4. **Check Firebase**:
   ```javascript
   // In Firebase Console or via code
   companies/{companyId}
   {
     subscription_status: 'trial',  // or 'active' if webhook processed
     subscription_tier: 'PRO_STARTER',
     trial_end_date: [timestamp]
   }
   ```

### 2.3 Test Promo Code

1. **Create a test promo code** in Firestore:
   ```javascript
   promoCodes/TESTCODE123
   {
     expiresAt: null,  // or future date
     maxUses: null,   // or number
     used: false,
     usedCount: 0
   }
   ```

2. **On subscription page**, enter promo code: `TESTCODE123`

3. **Click "Validate"**:
   - Should show green checkmark
   - Should display success message

4. **Subscribe** to any tier

5. **Verify promo code applied**:
   - Check Stripe Checkout session metadata
   - Should contain `promo_code: TESTCODE123`

## Step 3: Test Webhook Integration

### 3.1 Verify Webhook Endpoint

1. **Check webhook is configured**:
   - Stripe Dashboard → Developers → Webhooks
   - Should see endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Status should be "Enabled"

2. **Test webhook manually**:
   - Click on webhook endpoint
   - Click "Send test webhook"
   - Select event: `customer.subscription.updated`
   - Click "Send test webhook"

3. **Check server logs**:
   - Vercel: Dashboard → Your Project → Functions → Logs
   - Local: Terminal running `npm run dev`
   - Should see: `Updated company {companyId} subscription...`

### 3.2 Test Webhook Events

#### Test `invoice.paid` Event

1. **Complete a checkout** (from Step 2.1)

2. **Check Stripe Dashboard**:
   - Payments → Should see test payment
   - Subscriptions → Should see active subscription

3. **Check Firebase** (within 1-2 seconds):
   ```javascript
   companies/{companyId}
   {
     subscription_status: 'active',
     subscription_tier: 'PRO_STARTER',
     stripe_subscription_id: 'sub_test_...',
     stripe_customer_id: 'cus_test_...',
     subscription_expiry_date: '2024-XX-XX'
   }
   ```

4. **Verify webhook processed**:
   - Check `stripe_webhook_events/{eventId}` in Firestore
   - Should exist with `processed_at` timestamp

#### Test `customer.subscription.updated` Event

1. **In Stripe Dashboard**:
   - Go to Subscriptions
   - Find your test subscription
   - Click "..." → "Update subscription"
   - Change plan or update metadata

2. **Check Firebase**:
   - Company document should update automatically
   - `subscription_tier` should reflect new plan

#### Test `customer.subscription.deleted` Event

1. **Cancel subscription**:
   - Stripe Dashboard → Subscriptions
   - Click subscription → "Cancel subscription"

2. **Check Firebase**:
   ```javascript
   companies/{companyId}
   {
     subscription_status: 'inactive',
     // Other fields may remain
   }
   ```

## Step 4: Verify Firebase Integration

### 4.1 Check Company Document Updates

After completing checkout, verify in Firebase Console:

```javascript
// Path: companies/{companyId}
{
  subscription_status: 'active' | 'trial' | 'inactive',
  subscription_tier: 'PRO_STARTER' | 'PRO_TEAM' | 'PRO_BUSINESS' | 'PRO_ENTERPRISE',
  subscription_type: 'stripe',
  stripe_subscription_id: 'sub_test_...',
  stripe_customer_id: 'cus_test_...',
  subscription_expiry_date: '2024-XX-XX',  // YYYY-MM-DD format
  updated_at: '2024-XX-XXT...'
}
```

### 4.2 Check Webhook Event Logging

Verify webhook events are logged:

```javascript
// Path: stripe_webhook_events/{eventId}
{
  processed_at: '2024-XX-XXT...'
}
```

### 4.3 Test Subscription Lockout

1. **Set company to inactive**:
   ```javascript
   companies/{companyId}
   {
     subscription_status: 'inactive'
   }
   ```

2. **Try accessing dashboard**:
   - Should see lockout screen
   - Should show "Subscription Required" message
   - Should have "Subscribe Now" button

3. **Restore subscription**:
   ```javascript
   companies/{companyId}
   {
     subscription_status: 'active'
   }
   ```
   - Should regain access immediately

## Step 5: Test Edge Cases

### 5.1 Test Invalid Promo Code

1. Enter invalid code: `INVALID123`
2. Click "Validate"
3. Should show error: "Invalid promo code"

### 5.2 Test Expired Promo Code

1. Create expired promo code:
   ```javascript
   promoCodes/EXPIRED123
   {
     expiresAt: Timestamp(past date),
     used: false
   }
   ```

2. Try to validate
3. Should show error: "This promo code has expired"

### 5.3 Test Used Promo Code

1. Create single-use promo code:
   ```javascript
   promoCodes/SINGLEUSE123
   {
     used: true,
     usedBy: 'someUserId'
   }
   ```

2. Try to validate
3. Should show error: "This promo code has already been used"

### 5.4 Test Subscription Upgrade/Downgrade

1. **Subscribe to Starter** tier
2. **Go to subscription page**
3. **Click "Upgrade"** on Team tier
4. **Complete checkout**
5. **Verify**:
   - Stripe subscription updated
   - Firebase `subscription_tier` updated
   - Webhook processed `customer.subscription.updated`

## Step 6: Test Billing Portal

### 6.1 Access Billing Portal

1. **Log in** as manager/admin
2. **Click "Manage Billing"** in sidebar or subscription page
3. **Should redirect** to Stripe Customer Portal

### 6.2 Test Portal Features

1. **Update payment method**:
   - Add new test card: `5555 5555 5555 4444`
   - Verify saved

2. **View invoices**:
   - Should see invoice history
   - Should show test invoices

3. **Cancel subscription** (optional):
   - Cancel subscription
   - Verify Firebase updates to `inactive`
   - Verify lockout screen appears

## Step 7: Monitor and Debug

### 7.1 Check Server Logs

**Vercel Logs**:
1. Go to Vercel Dashboard → Your Project
2. Click "Functions" → "Logs"
3. Filter by function: `/api/checkout` or `/api/webhooks/stripe`
4. Look for errors or warnings

**Local Logs**:
- Check terminal running `npm run dev`
- Look for console.log outputs

### 7.2 Check Stripe Dashboard

1. **Payments**: Verify test payments appear
2. **Subscriptions**: Verify subscriptions created/updated
3. **Webhooks**: Check webhook delivery status
4. **Logs**: Review API request logs

### 7.3 Check Firebase Console

1. **Firestore**: Verify company documents update
2. **Firestore**: Check webhook events collection
3. **Authentication**: Verify user authentication works

## Common Issues and Solutions

### Issue: Checkout fails with "Invalid tier"

**Solution**:
- Verify price IDs in `.env.local` match Stripe Dashboard
- Ensure tier names match exactly: `PRO_STARTER`, `PRO_TEAM`, etc.
- Check `src/lib/stripe-server.ts` for tier mapping

### Issue: Webhook not receiving events

**Solution**:
- Verify webhook URL is correct and accessible
- Check webhook signing secret matches
- For local testing, ensure Stripe CLI is forwarding
- Check Vercel/server logs for errors
- Verify webhook endpoint is enabled in Stripe Dashboard

### Issue: Subscription not updating in Firebase

**Solution**:
- Check webhook endpoint is receiving events
- Verify `company_id` is in subscription metadata
- Check Firestore security rules allow updates
- Review server logs for webhook processing errors
- Verify Firebase Admin SDK credentials are correct

### Issue: Trial not applied

**Solution**:
- Verify company has no `stripe_subscription_id` before checkout
- Check `subscription_status` is `null` or `'trial'`
- Verify checkout API logic for `isNewCompany`
- Check Stripe subscription shows trial period

### Issue: Promo code validation fails

**Solution**:
- Verify promo code exists in Firestore `promoCodes` collection
- Check Firestore security rules allow reading promo codes
- Verify promo code document structure matches expected format
- Check expiration date logic

## Testing Checklist

- [ ] Test checkout flow with test card
- [ ] Verify redirect to success page
- [ ] Check Firebase company document updates
- [ ] Verify webhook processes `invoice.paid` event
- [ ] Test trial period for new companies
- [ ] Test promo code validation
- [ ] Test promo code application in checkout
- [ ] Test subscription upgrade/downgrade
- [ ] Test billing portal access
- [ ] Test subscription cancellation
- [ ] Verify subscription lockout works
- [ ] Test invalid/expired promo codes
- [ ] Check webhook event logging
- [ ] Monitor server logs for errors
- [ ] Verify all Stripe test mode features work

## Next Steps

Once testing is complete:

1. **Review all test results**
2. **Fix any issues found**
3. **Test again** to verify fixes
4. **Switch to live mode** when ready:
   - Update API keys to live keys
   - Create live products/prices
   - Set up live webhook endpoint
   - Update environment variables
   - Deploy to production

## Support

If you encounter issues:
1. Check Stripe Dashboard → Developers → Logs
2. Check Vercel Functions logs
3. Check Firebase Console for document updates
4. Review server logs for detailed error messages
5. Verify all environment variables are set correctly
