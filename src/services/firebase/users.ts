import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser, getAuth, updateProfile } from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import { db, firebaseConfig } from '../../firebaseConfig';
import { UserDoc, UserRole, UserStatus } from './types';

const USERS_COLLECTION = 'users';

/**
 * Get all users from `users` collection
 */
export async function getUsers(): Promise<UserDoc[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((d) => d.data() as UserDoc);
  } catch (err) {
    console.error('Failed to get users from Firestore:', err);
    return [];
  }
}

/**
 * Subscribe to real-time users list
 */
export function subscribeToUsers(callback: (users: UserDoc[]) => void): () => void {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(usersRef, (snapshot) => {
    const list = snapshot.docs.map((d) => d.data() as UserDoc);
    callback(list);
  }, (err) => {
    console.error('Users subscription error:', err);
  });
}

/**
 * Get single user by UID
 */
export async function getUserById(uid: string): Promise<UserDoc | null> {
  try {
    const ref = doc(db, USERS_COLLECTION, uid);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? (snapshot.data() as UserDoc) : null;
  } catch (err) {
    console.error('Failed to fetch user doc:', err);
    return null;
  }
}

/**
 * Create or overwrite user profile in `users/{uid}`
 */
export async function createUser(userData: UserDoc): Promise<UserDoc> {
  const ref = doc(db, USERS_COLLECTION, userData.uid);
  await setDoc(ref, userData);
  return userData;
}

/**
 * Update user profile in `users/{uid}`
 */
export async function updateUser(uid: string, updates: Partial<UserDoc>): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const now = new Date().toISOString();
  await updateDoc(ref, {
    ...updates,
    updatedAt: now,
  });
}

/**
 * Create a new officer record in `users/{uid}`
 * Note: Never store passwords in Firestore.
 */
export async function createOfficer(data: {
  name: string;
  email: string;
  role: 'admin' | 'officer';
  status?: UserStatus;
  uid?: string;
}): Promise<UserDoc> {
  const uid = data.uid || `off-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const newOfficer: UserDoc = {
    uid,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    role: data.role,
    status: data.status || 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: 'NEVER',
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), newOfficer);
  return newOfficer;
}

/**
 * Creates an Email/Password account without replacing the signed-in admin's session,
 * then provisions its privileged Firestore profile from that admin session.
 */
export async function createOfficerWithPassword(data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'officer';
}): Promise<UserDoc> {
  const email = data.email.trim().toLowerCase();
  const name = data.name.trim();
  const provisioningApp = initializeApp(firebaseConfig, `officer-provision-${crypto.randomUUID()}`);
  const provisioningAuth = getAuth(provisioningApp);
  let authUserCreated = false;

  try {
    const credential = await createUserWithEmailAndPassword(provisioningAuth, email, data.password);
    authUserCreated = true;
    await updateProfile(credential.user, { displayName: name });

    const now = new Date().toISOString();
    const newOfficer: UserDoc = {
      uid: credential.user.uid,
      name,
      email,
      role: data.role,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: 'NEVER',
    };

    await setDoc(doc(db, USERS_COLLECTION, credential.user.uid), newOfficer);
    return newOfficer;
  } catch (error) {
    // Avoid leaving an account that cannot access the officer dashboard if profile provisioning fails.
    if (authUserCreated && provisioningAuth.currentUser) {
      await deleteUser(provisioningAuth.currentUser).catch(() => undefined);
    }
    throw error;
  } finally {
    await deleteApp(provisioningApp);
  }
}

/**
 * Update existing officer
 */
export async function updateOfficer(officer: UserDoc): Promise<UserDoc> {
  const now = new Date().toISOString();
  const updated: UserDoc = {
    ...officer,
    updatedAt: now,
  };
  await setDoc(doc(db, USERS_COLLECTION, officer.uid), updated, { merge: true });
  return updated;
}

/**
 * Delete officer by UID
 */
export async function deleteOfficer(uid: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, uid));
    return true;
  } catch (err) {
    console.error('Failed to delete officer:', err);
    return false;
  }
}

/**
 * Toggle officer status between ACTIVE and DISABLED
 */
export async function toggleOfficerStatus(uid: string): Promise<UserStatus | null> {
  const user = await getUserById(uid);
  if (!user) return null;

  const newStatus: UserStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  await updateUser(uid, { status: newStatus });
  return newStatus;
}

/**
 * Change officer role
 */
export async function changeOfficerRole(uid: string, newRole: 'admin' | 'officer'): Promise<void> {
  await updateUser(uid, { role: newRole });
}
