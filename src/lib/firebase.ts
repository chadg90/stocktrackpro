import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

/**
 * Client Firebase SDK.
 * Only initialise when this module is imported in the browser.
 * Marketing pages must not import this file — dashboard / onboarding / invite do via providers or pages.
 *
 * App Check: tokens are sent when NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY is set.
 * Enforcement stays Off in Firebase Console until metrics look healthy (see docs/app-check-prep).
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // Must be the WEB app id (not iOS/Android) so App Check registers against the right app.
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isBrowser = typeof window !== 'undefined';
const hasConfig = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let app: FirebaseApp | null = null;
let appCheckStarted = false;

function startAppCheck(firebaseApp: FirebaseApp) {
  if (appCheckStarted) return;
  appCheckStarted = true;

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY?.trim();
  if (!siteKey) return;

  // Localhost / CI: register the printed debug token in Firebase Console → App Check → Manage debug tokens.
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN?.trim();
  if (debugToken) {
    // Official JS SDK debug hook (must be set before initializeAppCheck).
    (globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken === 'true' ? true : debugToken;
  }

  const providerKind = (process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_PROVIDER || 'v3').toLowerCase();
  const provider =
    providerKind === 'enterprise'
      ? new ReCaptchaEnterpriseProvider(siteKey)
      : new ReCaptchaV3Provider(siteKey);

  try {
    initializeAppCheck(firebaseApp, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    // Never block Auth/Firestore if App Check fails to init (e.g. double-init in Fast Refresh).
    console.warn('Firebase App Check init skipped:', err);
  }
}

export function ensureFirebase(): FirebaseApp | null {
  if (!isBrowser || !hasConfig) return null;
  if (app) return app;

  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  startAppCheck(app);
  return app;
}

// Eager init for any browser bundle that imports this module (dashboard / onboarding / invite).
if (isBrowser && hasConfig) {
  ensureFirebase();
}

export const firebaseApp: FirebaseApp | null = app;
export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
export const firebaseDb: Firestore | null = app ? getFirestore(app) : null;
export const firebaseFunctions: Functions | null = app ? getFunctions(app) : null;
