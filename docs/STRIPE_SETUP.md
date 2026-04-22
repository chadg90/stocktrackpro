# Stripe Integration Setup

Stock Track PRO uses a single **per-vehicle product** with two recurring prices (monthly and annual). This guide walks through configuring Stripe for both test and live mode.

## Pricing model

- **Monthly:** £8 per vehicle per month
- **Annual:** £84 per vehicle per year (≈ £7/month effective — ~12% saving)
- **Minimum:** 5 vehicles
- **Trial:** 7-day free trial for brand-new companies (no repeat trials on re-subscribe)
- Quantity = number of subscribed vehicles

## Step 1: Create the product and prices in Stripe

1. Stripe Dashboard → **Products** → **Add product**
2. Set **Name:** `Stock Track PRO — Per Vehicle`
3. Description (optional): `Vehicle inspections, MOT/Tax monitoring, defects, and asset tracking — billed per vehicle.`
4. Under **Pricing**, add **two** recurring prices on the same product:
   - **Price 1 — Monthly:** £8.00 GBP, recurring monthly. Copy the price ID (starts with `price_…`).
   - **Price 2 — Annual:** £84.00 GBP, recurring yearly. Copy the price ID.
5. Paste both into your `.env.local` (and your hosting provider's environment variables):

```bash
STRIPE_PRICE_PER_VEHICLE=price_xxxxxxxxxx        # monthly price
STRIPE_PRICE_PER_VEHICLE_YEARLY=price_xxxxxxxxxx # annual price
```

> Important: the codebase uses the **quantity** on the subscription line item to multiply by vehicle count. Don't create separate products per-tier — it's one product, two prices.

## Step 2: Webhook endpoint

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL:** `https://<your-domain>/api/webhooks/stripe`
3. Select these events (and only these):
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Save, reveal the **Signing secret** (`whsec_…`) and add it to your env:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

### Local webhook testing

Install the Stripe CLI and forward events to your local dev server:

```bash
# macOS
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the `whsec_…` shown in the terminal for local testing.

## Step 3: Customer portal configuration

1. Stripe Dashboard → **Settings** → **Billing** → **Customer portal**
2. Enable the portal
3. Recommended settings:
   - Allow customers to update payment methods: **On**
   - Allow customers to cancel subscriptions: **On** (at end of period)
   - Allow customers to update quantities: **Off** (we handle this through our dashboard UI so vehicle count stays in sync with Firestore)
   - Show invoice history: **On**
4. Optional: copy the configuration ID and set `STRIPE_PORTAL_CONFIGURATION_ID` in your env.

## Step 4: Environment variables (summary)

Required in `.env.local` and on Vercel/your host:

```bash
STRIPE_SECRET_KEY=sk_live_or_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PER_VEHICLE=price_...         # £8/vehicle/month
STRIPE_PRICE_PER_VEHICLE_YEARLY=price_...  # £84/vehicle/year
NEXT_PUBLIC_APP_URL=https://www.stocktrackpro.co.uk
```

Optional:

```bash
STRIPE_PORTAL_CONFIGURATION_ID=bpc_...
NEXT_PUBLIC_SUBSCRIPTION_SUCCESS_PATH=/return/subscription-success
NEXT_PUBLIC_SUBSCRIPTION_CANCEL_PATH=/return/subscription-cancel
```

## Step 5: Test the integration

### Test checkout

1. Log in as a manager/admin
2. Go to `/pricing` and pick monthly or annual
3. Click **Subscribe**
4. Use card `4242 4242 4242 4242`, any future expiry, any CVC, any postcode
5. Complete checkout → you are returned to `/return/subscription-success`
6. Verify in Firestore `companies/{companyId}`:
   - `subscription_status` = `trial` (new company) or `active`
   - `subscription_type` = `stripe`
   - `subscribed_vehicles` = your chosen count
   - `billing_cycle` = `monthly` or `yearly`
   - `stripe_subscription_id` = set
   - `stripe_customer_id` = set
   - `trial_end_date` = set (if on trial)

### Test webhook locally

```bash
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
```

Check logs for `Updated company … subscription` output and verify Firestore reflects the change.

## Legacy / grandfathered customers

Companies flagged as legacy are bypassed entirely by plan limits and should not go through the public checkout.

To flag a company as legacy, set `legacy: true` on the `companies/{companyId}` Firestore document. You can do this from the Firebase Console or via the helper script:

```bash
node scripts/set-legacy-company.js <companyId>
```

This unsets plan limits on users, vehicles and assets, and shows a "Legacy plan" badge on the dashboard subscription page.

## Going live

1. Switch to **Live mode** in the Stripe dashboard
2. Repeat Steps 1–3 in live mode (new product, new prices, new webhook endpoint)
3. Replace test env vars with live ones (`sk_live_…`, `pk_live_…`, live `whsec_…`, live `price_…`)
4. Redeploy

## Security

- ✅ Webhook signature verification (`stripe.webhooks.constructEvent`)
- ✅ Idempotency via the `stripe_webhook_events` collection (duplicate events are skipped)
- ✅ Rate limiting on `/api/checkout` and `/api/webhooks/stripe`
- ✅ Manager/admin role required to start checkout or open the billing portal
- ✅ Origin/Referer check on `/api/checkout`
- ✅ Re-subscribe protection: a second active Stripe subscription cannot be created while one exists

## Troubleshooting

**"Missing env: STRIPE_PRICE_PER_VEHICLE(_YEARLY)"**
The price ID for the chosen billing cycle isn't set. Double-check the env variable names and that they start with `price_`.

**Webhook returns 400 "Invalid signature"**
The `STRIPE_WEBHOOK_SECRET` does not match the endpoint. Copy the signing secret again from the Stripe dashboard (or CLI). For local dev you must use the secret printed by `stripe listen`, not the one from the dashboard.

**`billing_cycle` missing on company doc for old subscriptions**
The webhook will populate `billing_cycle` on the next `customer.subscription.updated` event. You can also trigger a manual refresh from the dashboard subscription page ("Sync Subscription").

**"Could not load the default credentials"**
`FIREBASE_SERVICE_ACCOUNT_JSON` is missing or malformed (must be minified to a single line). Use `cat service-account.json | jq -c .` to convert.

**Billing portal error: "No subscription linked"**
The company has no `stripe_customer_id`. This is set when checkout completes. If missing, verify the webhook ran and the `invoice.paid` event fired.
