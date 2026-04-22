#!/usr/bin/env node

/**
 * Flag a company as "legacy" so it is excluded from all plan limits and from
 * public per-vehicle pricing. Useful for grandfathering early customers.
 *
 * Usage:
 *   node scripts/set-legacy-company.js <companyId> [--unset]
 *
 * Prerequisites:
 *   - FIREBASE_SERVICE_ACCOUNT_JSON must be set in .env.local (single-line JSON)
 *     OR the script must be run in an environment with application default
 *     credentials for the Firebase project.
 *
 * What it does:
 *   - Sets (or with --unset, removes) the `legacy: true` flag on
 *     companies/{companyId}.
 *   - Records `legacy_set_at` / `legacy_unset_at` timestamps for audit.
 *   - Does NOT touch any Stripe subscription. If the company has a Stripe
 *     subscription and you want to stop billing, cancel it manually in the
 *     Stripe dashboard after flagging them as legacy.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
    }
  });
}

function initAdmin() {
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (svc) {
    const parsed = JSON.parse(svc);
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
    return;
  }
  admin.initializeApp();
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const companyId = args.find((a) => !a.startsWith('--'));
  const unset = args.includes('--unset');

  if (!companyId) {
    console.error('Usage: node scripts/set-legacy-company.js <companyId> [--unset]');
    process.exit(1);
  }

  try {
    initAdmin();
  } catch (err) {
    console.error('Failed to initialise Firebase Admin.');
    console.error(err.message || err);
    process.exit(1);
  }

  const db = admin.firestore();
  const ref = db.collection('companies').doc(companyId);
  const snap = await ref.get();

  if (!snap.exists) {
    console.error(`Company ${companyId} not found in Firestore.`);
    process.exit(1);
  }

  const payload = unset
    ? {
        legacy: admin.firestore.FieldValue.delete(),
        legacy_unset_at: new Date().toISOString(),
      }
    : {
        legacy: true,
        legacy_set_at: new Date().toISOString(),
      };

  await ref.set(payload, { merge: true });

  const verb = unset ? 'removed legacy flag from' : 'flagged as legacy';
  console.log(`\n✓ ${verb}: companies/${companyId}`);
  console.log('\nCurrent document:');
  const after = await ref.get();
  const data = after.data() || {};
  console.log({
    legacy: data.legacy ?? false,
    subscription_status: data.subscription_status ?? null,
    subscription_type: data.subscription_type ?? null,
    subscribed_vehicles: data.subscribed_vehicles ?? null,
    billing_cycle: data.billing_cycle ?? null,
  });

  if (!unset) {
    console.log('\nReminder: if this company has an active Stripe subscription');
    console.log('and you want to stop billing them, cancel it manually in the');
    console.log('Stripe dashboard. The legacy flag only bypasses in-app limits.');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('\nError:', err.message || err);
  process.exit(1);
});
