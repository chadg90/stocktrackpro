# Vercel Environment Variables Checklist

Compare these values with what you have in Vercel. Make sure each variable has the **exact value** shown below:

## Firebase Variables

- `NEXT_PUBLIC_FIREBASE_API_KEY` = `AIzaSyDnzbtU34rvFT0EzpcpY5_U9PrgpjXrn6s`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `stocktrackpronew-b853b.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `stocktrackpronew-b853b`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `stocktrackpronew-b853b.firebasestorage.app`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `459050969384`
- `NEXT_PUBLIC_FIREBASE_APP_ID` = `1:459050969384:ios:7812c2b19ba0b7c200081d`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` = `G-1234567890`
- `FIREBASE_SERVICE_ACCOUNT_JSON` = (run `node scripts/get-vercel-env.js` to get the single-line JSON)

## Stripe Variables

- `STRIPE_SECRET_KEY` = `sk_live_...` (from your `.env.local`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (from your `.env.local`)
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from your `.env.local`)
- `STRIPE_PRICE_PER_VEHICLE` = `price_...` (monthly per vehicle)
- `STRIPE_PRICE_PER_VEHICLE_YEARLY` = `price_...` (yearly per vehicle)
- **`STRIPE_PRICE_PLANT_PER_MACHINE`** = Plant monthly (£12/machine) — **required for Plant checkout**
- **`STRIPE_PRICE_PLANT_PER_MACHINE_YEARLY`** = Plant annual (£120/machine) — **required for Plant checkout**
- `STRIPE_PORTAL_CONFIGURATION_ID` = optional
- `NEXT_PUBLIC_APP_URL` = `https://www.stocktrackpro.co.uk` (your production URL)

### Plant price IDs (from `.env.local.example` — use **live** IDs in Production if `STRIPE_SECRET_KEY` is `sk_live_`)

| Variable | Example value (match your Stripe mode) |
|----------|----------------------------------------|
| `STRIPE_PRICE_PLANT_PER_MACHINE` | `price_1TXlTbHbmFLRZL4BP0KUdoUc` |
| `STRIPE_PRICE_PLANT_PER_MACHINE_YEARLY` | `price_1TXlTcHbmFLRZL4BmoM1aLut` |

Product in Stripe: **Plant & Machinery Module** (`prod_UWoyF3TdWqK9SR`). If Production uses live keys, copy the **live** price IDs from Stripe Dashboard → Products → Plant & Machinery Module → Prices (not test IDs unless Preview uses test mode).

## Next Steps

1. **Verify values**: Click on each variable in Vercel and make sure the value matches exactly (no extra spaces, correct format)
2. **Check FIREBASE_SERVICE_ACCOUNT_JSON**: This must be a single-line JSON string. Run `node scripts/get-vercel-env.js` locally to get the correct format
3. **Redeploy**: After verifying/updating values, trigger a new deployment in Vercel
4. **Check environment scope**: Make sure all variables are set for "Production" environment (or "All Environments")
