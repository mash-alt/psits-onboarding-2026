import 'dotenv/config';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccount) {
    const credentials = JSON.parse(serviceAccount) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    return initializeApp({
      credential: cert({
        projectId: credentials.project_id,
        clientEmail: credentials.client_email,
        privateKey: credentials.private_key.replace(/\\n/g, '\n'),
      }),
    });
  }

  return initializeApp({ credential: applicationDefault() });
}

export const adminDb = getFirestore(getAdminApp());

export function assertDevelopmentOperation(operation: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error(`${operation} is blocked unless NODE_ENV=development.`);
  }
}
