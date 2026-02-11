import * as admin from 'firebase-admin';

function getCredential(): admin.credential.Credential {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json) as admin.ServiceAccount;
      return admin.credential.cert(parsed);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON');
    }
  }
  return admin.credential.applicationDefault();
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
