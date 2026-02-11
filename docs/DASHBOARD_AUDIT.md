# Dashboard & Data Connectivity Audit

**Date:** 2025  
**Scope:** Dashboard (overview, fleet, assets, team, defects, history, locations, access-codes, companies, analytics), Firestore rules, data flow.

---

## Executive summary

- **Data connections:** All dashboard pages use the logged-in user’s `profile.company_id` for queries. Company data isolation is consistent.
- **Two Firestore rule issues were fixed:** (1) `vehicle_defects` now allow managers **and** admins (aligned with app). (2) Rules for `tool_history` were added (app uses `tool_history`, rules previously only had `history`).

---

## 1. Data connectivity

### 1.1 Overview (`/dashboard`)

| Data source        | Collection(s)           | Filter              | Status   |
|--------------------|-------------------------|---------------------|----------|
| Vehicles           | `vehicles`              | `company_id`       | Correct  |
| Assets             | `tools`                 | `company_id`       | Correct  |
| Team               | `profiles`              | `company_id`       | Correct  |
| Inspections        | `vehicle_inspections`   | `company_id`       | Correct  |
| Defects            | `vehicle_defects`       | `company_id`       | Correct  |
| History            | `tool_history`          | `company_id`       | Correct  |
| Counts             | Same collections        | Same filters       | Correct  |

- Profile is loaded from `profiles/{uid}`; `company_id` is validated (non-empty) before `fetchData(company_id)`.
- Date range filter is applied to inspections, defects, and history; base queries use `company_id` only.

### 1.2 Sub-pages

| Page          | Collections used                    | Scoped by `profile.company_id`? | Role restrictions      |
|---------------|-------------------------------------|-----------------------------------|-------------------------|
| Fleet         | `vehicles`                          | Yes                               | Manager/admin write     |
| Assets        | `tools`                             | Yes                               | Manager/admin write     |
| Team          | `profiles`, `companies`             | Yes (managers); admins see all companies | Admin for cross-company |
| Defects       | `vehicle_defects`, `vehicles`, `profiles` | Yes                        | Manager/admin only      |
| History       | `tool_history`, `tools`, `profiles` | Yes                               | Manager/admin view      |
| Locations     | `locations`                         | Yes                               | Manager/admin write     |
| Access codes  | `access_codes`                      | Yes                               | Manager/admin only      |
| Companies     | `companies` + count queries         | Admin only; counts by company     | Admin only              |
| Analytics     | Same as overview + date filters      | Yes                               | Manager/admin           |

All pages that need a company scope use the authenticated user’s profile and `company_id`; no cross-company data is shown except on the Companies page for admins.

### 1.3 Notifications

- `NotificationBell` uses `company_id` and `user_id` from profile; listener is scoped correctly.

---

## 2. Firestore rules (repo synced to deployed rules)

The repo’s `firestore.rules` has been updated to match your **current deployed rules**. No rule changes were required for dashboard compatibility:

- **vehicle_defects:** Read is company-scoped for any signed-in user; update/delete allow manager (same company) or admin. Matches dashboard (manager/admin can manage defects).
- **tool_history:** Present with company-scoped read/create and `isCompanyActive()`; update/delete admin-only. Matches dashboard (read-only for history).
- **Global admin override** (`match /{path=**} { allow read, write: if isAdmin(); }`) gives admins full access for the Companies page and cross-company use.
- Helpers `profileExists()`, `getProfile()`, `userCompanyId()`, `isCompanyActive()` align with company-scoped access and subscription checks.

---

## 3. Security & consistency

- **Company isolation:** All queries that should be company-scoped use `company_id` from the logged-in user’s profile.
- **Roles:** Layout restricts dashboard access to manager/admin; defects page and sidebar allow both for defects; Companies page and Access codes are restricted appropriately.
- **Profile checks:** Pages that need `company_id` check for it (and sometimes role) before fetching.

---

## 4. Optional checks (no code changes made)

- **Composite indexes:** Date-filtered queries (e.g. `company_id` + `inspected_at`, `company_id` + `reported_at`, `company_id` + `timestamp`) may require composite indexes in Firestore if not already created. Add any missing indexes if you see index errors in the console.
- **Subscription checks:** Rules use `hasAssetModule()` / `hasFleetModule()` (subscription_status active/trial). Ensure `companies` documents have these fields set correctly for Stripe/promo flows.

---

## 5. Improvement suggestions (ask before implementing)

See **Improvement suggestions** in the conversation: these were listed for your approval before any implementation.
