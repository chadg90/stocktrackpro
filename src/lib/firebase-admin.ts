import * as admin from 'firebase-admin';

function getCredential(): admin.credential.Credential {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      // Handle both single-line JSON strings and multi-line JSON
      const cleanedJson = json.trim().replace(/\n/g, '');
      const parsed = JSON.parse(cleanedJson) as admin.ServiceAccount;
      return admin.credential.cert(parsed);
    } catch (error) {
      console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', error);
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON. Make sure it\'s set as a single-line JSON string in Vercel environment variables.');
    }
  }
  
  // If not set, try application default (won't work on Vercel)
  console.error('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_JSON is not set');
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. Please add it to your Vercel environment variables. Go to Vercel Dashboard > Your Project > Settings > Environment Variables and add FIREBASE_SERVICE_ACCOUNT_JSON with the full service account JSON as a single-line string.');
}

let app: admin.app.App | null = null;

export function getAdminApp(): admin.app.App {
  if (!app) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
    }
    app = admin.initializeApp({ credential: getCredential(), projectId });
  }
  return app;
}

export function getAdminDb(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}
