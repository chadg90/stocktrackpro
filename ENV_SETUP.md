# How to set up your .env file (simple steps)

You need a file called `.env.local` in the website folder with all the keys below. Here’s how.

---

## Step 1: Create the file

Use the **website** folder (the one named **stocktrackpro**, with the Next.js site). Not the STP app folder.

1. Open the **stocktrackpro** folder (same folder as `package.json` for the website).
2. Find the file **`.env.local.example`**.  
   - Files starting with a dot (`.`) are often **hidden**. In Finder: press **Cmd + Shift + .** to show hidden files. In Cursor/VS Code it should still appear in the file list.
3. **Copy** that file and **rename** the copy to **`.env.local`**.
   - On Mac: duplicate the file, then rename the duplicate to `.env.local`.
   - Or in Terminal, go to the website folder and run:  
     `cp .env.local.example .env.local`
4. Open `.env.local` in a text editor. You’ll paste values in next.  
   **Don’t put this file on GitHub** (it’s private).

**If you still don’t see `.env.local.example`:** Create a new file named `.env.local` in the website folder and paste this in (then fill in the values in the later steps):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_TEAM=
STRIPE_PRICE_BUSINESS=
STRIPE_PRICE_ENTERPRISE=
NEXT_PUBLIC_APP_URL=
```

---

## Step 2: Firebase (same as your app)

You already use Firebase in the app, so you have these somewhere.

1. Go to [Firebase Console](https://console.firebase.google.com) and open your project.
2. Click the **gear** next to “Project overview” → **Project settings**.
3. Scroll to **“Your apps”** and open your web app (or use the same project’s config).
4. Copy each of these into `.env.local` where it says (same names as in the example file):
   - API Key  
   - Auth domain  
   - Project ID  
   - Storage bucket  
   - Messaging sender ID  
   - App ID  
   - Measurement ID (optional)

Use the **same** values you use in the mobile app so the website talks to the same Firebase project.

---

## Step 3: Firebase “service account” (for the webhook)

This lets the website update your database when someone pays.

1. In Firebase: **Project settings** → **Service accounts**.
2. Click **“Generate new private key”** → confirm. A JSON file will download.
3. Open that file in a text editor. Select **all** the text and copy it.
4. In `.env.local`, find the line **FIREBASE_SERVICE_ACCOUNT_JSON=**
5. Paste the **entire** JSON you copied right after the `=` (no spaces).  
   If your editor or system has trouble with the quotes, you can paste it between single quotes:  
   `FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ... }'`

---

## Step 4: Stripe keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) and log in.
2. Click **Developers** (top right) → **API keys**.
3. Copy the **Secret key** (starts with `sk_`) and put it in `.env.local` as **STRIPE_SECRET_KEY**.
4. Copy the **Publishable key** (starts with `pk_`) and put it in `.env.local` as **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**.

---

## Step 5: Stripe products and prices

You need 4 products in Stripe (one per plan) and one monthly price each.

1. In Stripe, go to **Product catalog** → **Add product**.
2. Create 4 products:
   - **Starter** – add a monthly recurring price: **£19.99**.
   - **Team** – add a monthly recurring price: **£34.99**.
   - **Business** – add a monthly recurring price: **£49.99**.
   - **Enterprise** – add a monthly recurring price: **£119.99**.
3. For each product, open it and find the **Price ID** (starts with `price_`). Copy it.
4. In `.env.local` put:
   - **STRIPE_PRICE_STARTER** = the Price ID for Starter (£19.99).
   - **STRIPE_PRICE_TEAM** = the Price ID for Team (£34.99).
   - **STRIPE_PRICE_BUSINESS** = the Price ID for Business (£49.99).
   - **STRIPE_PRICE_ENTERPRISE** = the Price ID for Enterprise (£119.99).

---

## Step 6: Stripe webhook (so Stripe can tell your site “payment received”)

1. In Stripe: **Developers** → **Webhooks** → **Add endpoint**.
2. **Endpoint URL:** type your live website URL + `/api/webhooks/stripe`  
   Example: `https://www.stocktrackpro.co.uk/api/webhooks/stripe`
3. Click **Select events** and choose:
   - **invoice.paid**
   - **customer.subscription.updated**
   - **customer.subscription.deleted**
4. Click **Add endpoint**.
5. On the new webhook page, click **Reveal** next to **Signing secret**. Copy that (starts with `whsec_`).
6. In `.env.local` set **STRIPE_WEBHOOK_SECRET** = that value.

---

## Step 7: Your website address

In `.env.local` set:

**NEXT_PUBLIC_APP_URL** = your real website address, e.g.  
`https://www.stocktrackpro.co.uk`

(No slash at the end.) This is where Stripe sends people after they pay.

---

## Step 8: When you deploy (e.g. Vercel)

The live site doesn’t use `.env.local` from your computer. You type the same stuff into your host:

1. In Vercel: open your project → **Settings** → **Environment Variables**.
2. Add **every** variable from `.env.local` (same name, same value).
3. For **FIREBASE_SERVICE_ACCOUNT_JSON**, paste the whole JSON again.
4. Save and **redeploy** the site so it picks up the new variables.

---

## Checklist

- [ ] Copied `.env.local.example` to `.env.local`
- [ ] Filled in all Firebase keys (same as app)
- [ ] Pasted Firebase service account JSON
- [ ] Added Stripe secret and publishable keys
- [ ] Created 4 Stripe products with £19.99, £34.99, £49.99, £119.99 and put the 4 Price IDs in `.env.local`
- [ ] Added Stripe webhook and put the signing secret in **STRIPE_WEBHOOK_SECRET**
- [ ] Set **NEXT_PUBLIC_APP_URL** to your site URL
- [ ] (When going live) Added all of the above to Vercel (or your host) and redeployed
