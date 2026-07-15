import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseServiceAccountJson(raw: string): admin.ServiceAccount {
  let candidate = stripWrappingQuotes(raw).replace(/^\uFEFF/, '').trim();

  const attempts = [
    candidate,
    // Pretty-printed JSON in env sometimes keeps real newlines between keys
    candidate.replace(/\r\n/g, '\n'),
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as admin.ServiceAccount;
    } catch (error) {
      lastError = error;
    }
  }

  // Truncated values (e.g. unquoted multiline .env → just "{") are a common local failure mode
  if (candidate.length < 20) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON looks truncated. Put the full service account JSON on one line in .env.local (wrap in single quotes), or set FIREBASE_SERVICE_ACCOUNT_PATH to a JSON file.'
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON');
}

function readServiceAccountFile(filePath: string): admin.ServiceAccount {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const raw = fs.readFileSync(absolute, 'utf8');
  return JSON.parse(raw) as admin.ServiceAccount;
}

function resolveLocalSdkPath(): string | null {
  const fromEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  if (fromEnv && fs.existsSync(path.join(process.cwd(), fromEnv))) {
    return path.join(process.cwd(), fromEnv);
  }

  // Local fallback so marketing CMS pages work in dev without brittle multiline .env JSON
  const candidates = fs
    .readdirSync(process.cwd())
    .filter((name) => /firebase-adminsdk.*\.json$/i.test(name));
  if (candidates.length === 1) {
    return path.join(process.cwd(), candidates[0]);
  }
  return null;
}

function getCredential(): admin.credential.Credential {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json && json.trim().length > 1) {
    try {
      const parsed = parseServiceAccountJson(json);
      return admin.credential.cert(parsed);
    } catch (error) {
      console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', error);
      // Fall through to file-based credentials for local recovery
    }
  }

  const filePath = resolveLocalSdkPath();
  if (filePath) {
    try {
      const parsed = readServiceAccountFile(filePath);
      return admin.credential.cert(parsed);
    } catch (error) {
      console.error('[Firebase Admin] Failed to read service account file:', filePath, error);
    }
  }

  throw new Error(
    'Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON as a single-line JSON string (quoted) in .env.local / Vercel, or set FIREBASE_SERVICE_ACCOUNT_PATH to a service-account JSON file.'
  );
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
