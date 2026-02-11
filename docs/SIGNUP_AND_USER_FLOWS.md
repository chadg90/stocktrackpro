# Sign-up and new user flows (website & app)

This doc describes how new users get an account and how the website fits in. **No database or collection changes** are required for these flows.

---

## 1. How new users get an account

There are **two** ways a new user can get an account:

### A. Mobile app (primary flow)

1. User **downloads Stock Track PRO** from the App Store / Google Play.
2. In the app, they **create an account** (email/password) and either:
   - **Join a company:** enter an **access code** from their manager (generated in the web dashboard under **Access Codes**), or
   - **Create a new company:** start a new company (e.g. trial); they become the first manager.
3. Profile is created in Firestore with `company_id`, `role`, etc. (handled in the app).

**Website’s role:** Managers and admins use the **dashboard** to generate access codes (Dashboard → Access Codes). The how-to page explains “Join a company using an access code OR create a new company”.

### B. Web dashboard – “Create Temp Account” (admin only)

1. An **admin** signs in at **Log in** → `/dashboard`.
2. Goes to **Team** → **Create Temp Account**.
3. Enters email, password, company, role (and optionally name). Submits.
4. Firebase Auth user + Firestore profile are created; the new user can **sign in on the web** (Dashboard) or in the **app** with that email/password.

No access code is involved; the admin creates the account directly.

---

## 2. Website flows for a new visitor

| Visitor goal              | Where they go              | What happens |
|---------------------------|----------------------------|--------------|
| Learn about the product   | Home, Features, FAQ, How-to | Read-only; no account needed. |
| See pricing               | **Pricing**                | See tiers; “Subscribe” requires manager/admin sign-in; “Log in to subscribe” goes to dashboard sign-in. “New to Stock Track PRO?” links to How-to and Contact. |
| Get an account            | **How-to** or **Contact**  | How-to: “Download app → create account or sign in → access code or create company”. Contact: form to ask for help. |
| Sign in (existing user)   | **Log in** (navbar) → `/dashboard` | Dashboard sign-in form (managers/admins only). “New user?” links to app/contact. |
| Subscribe (web)           | **Pricing** (when signed in as manager/admin) | Subscribe starts Stripe Checkout (when Stripe is configured). Success/cancel return to `/return/subscription-success` and `/return/subscription-cancel`. |

---

## 3. Are the flows correct?

- **Yes, for the intended model:**  
  - New **team members** get an **access code** from their manager (dashboard) and sign up in the **app**.  
  - New **companies** can start in the **app** (create company) or get help via **Contact**.  
  - **Admins** can create temp accounts from the dashboard when needed.

- **Stripe not set up yet:**  
  - Checkout and “Manage subscription” will work once Stripe env vars and products are configured.  
  - Until then, “Subscribe” can show an error or you can hide it; the rest of the flow (who can sign in, who can subscribe) is already correct.

- **Small UX improvements already in place:**  
  - Dashboard login: “New user? Download the app or contact us.”  
  - Pricing: “New to Stock Track PRO? See how to get started / contact us.”  
  - So visitors who land on Log in or Pricing without an account are directed to the app or contact.

---

## 4. Optional future improvements (not required)

- **Dedicated “Get started” or “Sign up” page** that explains: “Get the app” and “Managers: use the dashboard to create access codes or temp accounts.”  
- **Stripe live:** set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and price IDs so Subscribe and billing portal work end-to-end.

No changes to Firestore collections or security rules are needed for the current sign-up and subscription flows.
