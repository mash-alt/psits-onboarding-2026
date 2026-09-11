import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { UserDoc, UserRole } from './types';

/**
 * Translates Firebase Authentication error codes to clean, human-readable messages.
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled by an administrator.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please log in again.';
    default:
      return 'Authentication failed. Please verify your credentials and try again.';
  }
}

/**
 * Sign In with Firebase Authentication (Email/Password)
 */
export async function signInUser(email: string, password: string): Promise<UserDoc> {
  const cleanEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  const now = new Date().toISOString();
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as UserDoc;
    // Update lastLoginAt
    await updateDoc(userRef, { lastLoginAt: now, updatedAt: now });
    return { ...data, lastLoginAt: now, updatedAt: now };
  } else {
    // If user document does not exist yet, initialize it
    const newUserDoc: UserDoc = {
      uid: user.uid,
      name: user.displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'student',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    await setDoc(userRef, newUserDoc);
    return newUserDoc;
  }
}

/**
 * Sign Out from Firebase
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send Password Reset Email
 */
export async function resetPassword(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, cleanEmail);
}

/**
 * Fetch User Document from `users/{uid}`
 */
export async function getUserProfile(uid: string): Promise<UserDoc | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserDoc;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Subscribe to Auth State Changes
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null, profile: UserDoc | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      callback(user, profile);
    } else {
      callback(null, null);
    }
  });
}
