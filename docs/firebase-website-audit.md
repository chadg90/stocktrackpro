# Stock Track PRO website — Firebase usage audit

**Scope:** [`stocktrackpro/`](../) (Next.js marketing site + manager dashboard).  
**Client SDK entry:** [`src/lib/firebase.ts`](../src/lib/firebase.ts) — initializes **Auth**, **Firestore**, **Functions** in the browser when `NEXT_PUBLIC_*` env vars are set.

## Products in use

| Product | Where | Purpose |
|--------|--------|---------|
| **Firebase Auth** | Client | Email/password sign-in on `/dashboard`; `onAuthStateChanged` across dashboard pages, pricing, onboarding, invite flow; ID tokens for `/api/*` calls |
| **Cloud Firestore** | Client | Reads/writes for manager dashboard (profiles, companies, tools, vehicles, inspections, defects, history, team, invites, notifications, etc.) |
| **Cloud Storage** | Client | `getDownloadURL` / refs via [`AuthenticatedImage`](../src/app/dashboard/components/AuthenticatedImage.tsx), [`getImageUrl.ts`](../src/lib/getImageUrl.ts), [`useImage`](../src/hooks/useImage.ts) |
| **Firebase Admin** | Server only | [`src/lib/firebase-admin.ts`](../src/lib/firebase-admin.ts) — API routes (Stripe webhooks, checkout, billing portal, subscription sync, etc.) |

**Not used on the website (from `firebase.ts`):** Analytics, Remote Config, App Check (can be added later).

## Client modules by area

### Dashboard shell

- [`src/app/dashboard/layout.tsx`](../src/app/dashboard/layout.tsx) — Auth gate, `profiles` + `companies` read for subscription
- [`src/app/dashboard/components/Sidebar.tsx`](../src/app/dashboard/components/Sidebar.tsx) — `profiles` read for role-based nav
- [`src/app/dashboard/components/NotificationBell.tsx`](../src/app/dashboard/components/NotificationBell.tsx) — `notifications` collection

### Dashboard pages (Firestore)

| Route | Collections / patterns (typical) |
|-------|-----------------------------------|
| `/dashboard` (main) | `tools`, `vehicles`, `profiles`, `vehicle_inspections`, `vehicle_defects`, `tool_history`, `companies`, aggregate counts |
| `/dashboard/history` | `tool_history`, `vehicle_inspections` (paginated via [`historyFirestore.ts`](../src/lib/historyFirestore.ts)), `tools`, `vehicles`, `profiles` |
| `/dashboard/fleet` | `vehicles`, `vehicle_inspections`, writes to `vehicles` |
| `/dashboard/defects` | `vehicles`, `profiles`, `vehicle_inspections`, `vehicle_defects` |
| `/dashboard/analytics` | Same family as main dashboard + bounded `tool_history` |
| `/dashboard/assets` | `tools` |
| `/dashboard/locations` | `locations` |
| `/dashboard/team` | `profiles`, `invites` |
| `/dashboard/subscription` | `profiles`, `companies` |
| `/dashboard/companies` | Admin company management |
| `/dashboard/support` | Support / tickets (if Firestore-backed) |
| `/dashboard/admin/*` | Promo / tickets |
| `/dashboard/fleet-report/*` | [`FleetReportContext`](../src/app/dashboard/fleet-report/FleetReportContext.tsx) — `vehicles`, `profiles`, `vehicle_inspections`, `vehicle_defects` |

### Marketing / auth-adjacent

- [`src/app/pricing/page.tsx`](../src/app/pricing/page.tsx) — optional `profiles` read when logged in
- [`src/app/onboarding/page.tsx`](../src/app/onboarding/page.tsx) — Firestore for signup flow
- [`src/app/invite/[inviteId]/page.tsx`](../src/app/invite/[inviteId]/page.tsx) — invites

### Server (Admin SDK)

- [`src/app/api/webhooks/stripe/route.ts`](../src/app/api/webhooks/stripe/route.ts) — updates `companies`
- [`src/app/api/checkout/route.ts`](../src/app/api/checkout/route.ts), billing portal, subscription set-status, sync-subscription — company/subscription documents

### Shared helpers

- [`src/lib/subscriptionLimits.ts`](../src/lib/subscriptionLimits.ts) — Firestore reads for limit checks (used from dashboard pages)
- [`src/lib/notificationUtils.ts`](../src/lib/notificationUtils.ts) — may write notifications (verify call sites)

## Multiplicity / cost notes (for later optimisation)

- Several pages each register their own **`onAuthStateChanged`** + **`getDoc(profiles)`** — redundant with layout/sidebar; candidates for a small **auth context** or **React Query** profile query to dedupe reads.
- Main **dashboard** loads large slices of collections for charts; **history** uses pagination + React Query (preferred pattern for heavy lists).
- **Storage** image loads: prefer thumbnails + lazy load where already implemented ([`AuthenticatedImage`](../src/app/dashboard/components/AuthenticatedImage.tsx), [`LazyWhenVisible`](../src/app/dashboard/components/LazyWhenVisible.tsx)).

## Environment

- Client: `NEXT_PUBLIC_FIREBASE_*` in `.env.local`
- Server: Firebase Admin credentials as required by [`firebase-admin.ts`](../src/lib/firebase-admin.ts) (e.g. service account JSON / env vars for Vercel)

## Related (not this repo folder)

- **Mobile app** (`STP/`) and **Cloud Functions** (`STP/functions/`) use the same Firebase project; **Firestore rules** deployed from `STP/firebase.json` → `firestore-rules-corrected.txt` (keep in sync with any rules copy under `stocktrackpro/` if used for reference only).

---
*Generated for internal reference; update as routes change.*
