import { getAuth } from 'firebase-admin/auth';
import { adminDb, assertDevelopmentOperation } from './firebaseAdmin';

const email = 'admin26@psits.com';
const password = process.env.ADMIN_SEED_PASSWORD;

async function seedAdmin() {
  assertDevelopmentOperation('Admin account seeding');
  if (process.env.ALLOW_ADMIN_SEED !== 'true') {
    throw new Error('Admin account seeding requires ALLOW_ADMIN_SEED=true.');
  }
  if (!password) {
    throw new Error('Admin account seeding requires ADMIN_SEED_PASSWORD.');
  }

  const auth = getAuth();
  let user;
  try {
    user = await auth.getUserByEmail(email);
    user = await auth.updateUser(user.uid, {
      password,
      displayName: 'admin26',
      disabled: false,
    });
    console.log(`Updated Firebase Authentication user: ${email}`);
  } catch (error: unknown) {
    if (!(typeof error === 'object' && error && 'code' in error && error.code === 'auth/user-not-found')) {
      throw error;
    }
    user = await auth.createUser({
      email,
      password,
      displayName: 'admin26',
      emailVerified: false,
      disabled: false,
    });
    console.log(`Created Firebase Authentication user: ${email}`);
  }

  const now = new Date().toISOString();
  const profileRef = adminDb.collection('users').doc(user.uid);
  const existingProfile = await profileRef.get();
  await profileRef.set({
    uid: user.uid,
    name: 'admin26',
    email,
    role: 'admin',
    status: 'ACTIVE',
    createdAt: existingProfile.data()?.createdAt || now,
    updatedAt: now,
    lastLoginAt: existingProfile.data()?.lastLoginAt || 'NEVER',
  }, { merge: true });

  console.log(`Ensured active admin profile for: ${email}`);
}

seedAdmin().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
