import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  query,
  where,
  orderBy,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { AttendeeDoc, RegistrationType, PaymentStatus } from './types';
import { getEventSettings } from './settings';
import { getGroups } from './groups';

const ATTENDEES_COLLECTION = 'attendees';

/**
 * Validate that studentId is strictly an 8-digit numeric string.
 */
export function validateStudentIdFormat(studentId: string): { isValid: boolean; error?: string } {
  const trimmed = (studentId || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Student ID is required.' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { isValid: false, error: 'Student ID must contain numbers only. Letters and symbols rejected.' };
  }
  if (trimmed.length !== 8) {
    return { isValid: false, error: `Student ID must be exactly 8 digits (currently ${trimmed.length} digits).` };
  }
  return { isValid: true };
}

/**
 * Check if a student ID already exists in Firestore.
 */
export async function isStudentIdRegistered(studentId: string): Promise<boolean> {
  const cleanId = studentId.trim();
  const ref = collection(db, ATTENDEES_COLLECTION);
  const q = query(ref, where('studentId', '==', cleanId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Create a new attendee registration in Firestore.
 * Strictly enforces 8-digit numeric student ID uniqueness and server-side pricing.
 */
export async function createAttendee(data: {
  studentId: string;
  name: string;
  section: string;
  year: string;
  course: string;
  registrationType: RegistrationType;
  actualAmount?: number;
  datePaid?: string;
  paymentStatus?: PaymentStatus;
  groupId?: string;
  userId?: string | null;
  registeredBy?: string;
}): Promise<AttendeeDoc> {
  const cleanStudentId = data.studentId.trim();

  // 1. Strict 8-digit validation
  const validation = validateStudentIdFormat(cleanStudentId);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 2. Uniqueness check
  const alreadyExists = await isStudentIdRegistered(cleanStudentId);
  if (alreadyExists) {
    throw new Error(`Student ID "${cleanStudentId}" is already registered in the system. Student IDs must be unique.`);
  }

  // 3. Retrieve event settings for non-arbitrary pricing
  const settings = await getEventSettings();
  const expectedAmount =
    data.registrationType === 'EARLY BIRD'
      ? settings.earlyBirdPrice
      : settings.regularPrice;

  const actualAmount = data.actualAmount !== undefined ? data.actualAmount : expectedAmount;
  const paymentStatus: PaymentStatus =
    data.paymentStatus || (actualAmount > 0 ? 'PAID' : 'UNPAID');

  // 4. Default groupId assignment if not specified
  let groupId = (data.groupId || '').trim().toLowerCase();
  if (!groupId || groupId === 'unassigned') {
    const groups = await getGroups();
    const activeGroups = groups.filter((g) => g.active !== false);
    const pool = activeGroups.length > 0 ? activeGroups : groups;
    groupId = pool[Math.floor(Math.random() * pool.length)].id;
  }

  const now = new Date().toISOString();
  // The Student ID is the document ID, allowing rules to enforce uniqueness atomically.
  const attendeeId = cleanStudentId;

  const attendeeDoc: AttendeeDoc = {
    id: attendeeId,
    userId: data.userId || null,
    studentId: cleanStudentId, // Stored as string to preserve leading zeros
    name: data.name.trim(),
    section: data.section.trim().toUpperCase(),
    year: data.year,
    course: data.course.trim(),
    registrationType: data.registrationType,
    expectedAmount, // Historical registration price is permanently recorded
    actualAmount,
    datePaid: data.datePaid || now.split('T')[0],
    paymentStatus,
    groupId,
    registeredAt: now,
    registeredBy: data.registeredBy || 'system',
    updatedAt: now,
    updatedBy: data.registeredBy || 'system',
  };

  await setDoc(doc(db, ATTENDEES_COLLECTION, attendeeId), attendeeDoc);
  return attendeeDoc;
}

/**
 * Get all attendees from Firestore
 */
export async function getAttendees(): Promise<AttendeeDoc[]> {
  try {
    const ref = collection(db, ATTENDEES_COLLECTION);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((d) => d.data() as AttendeeDoc);
  } catch (err) {
    console.error('Failed to get attendees from Firestore:', err);
    return [];
  }
}

/**
 * Subscribe to real-time attendees updates
 */
export function subscribeToAttendees(callback: (attendees: AttendeeDoc[]) => void): () => void {
  const ref = collection(db, ATTENDEES_COLLECTION);
  return onSnapshot(ref, (snapshot) => {
    const list = snapshot.docs.map((d) => d.data() as AttendeeDoc);
    callback(list);
  }, (err) => {
    console.error('Attendees subscription error:', err);
  });
}

/**
 * Get single attendee document by ID
 */
export async function getAttendee(attendeeId: string): Promise<AttendeeDoc | null> {
  try {
    const ref = doc(db, ATTENDEES_COLLECTION, attendeeId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? (snapshot.data() as AttendeeDoc) : null;
  } catch (err) {
    console.error('Failed to fetch attendee document:', err);
    return null;
  }
}

/**
 * Update attendee record. A changed Student ID requires an atomic document move,
 * because the Student ID is also the Firestore document ID.
 */
export async function updateAttendee(
  attendeeId: string,
  updates: Partial<AttendeeDoc>,
  updatedBy: string = 'officer'
): Promise<void> {
  const { studentId: requestedStudentId, id: _ignoredId, ...safeUpdates } = updates;
  const cleanStudentId = (requestedStudentId || attendeeId).trim();
  const now = new Date().toISOString();

  const validation = validateStudentIdFormat(cleanStudentId);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (cleanStudentId === attendeeId) {
    await updateDoc(doc(db, ATTENDEES_COLLECTION, attendeeId), {
      ...safeUpdates,
      updatedAt: now,
      updatedBy,
    });
    return;
  }

  const sourceRef = doc(db, ATTENDEES_COLLECTION, attendeeId);
  const targetRef = doc(db, ATTENDEES_COLLECTION, cleanStudentId);
  await runTransaction(db, async (transaction) => {
    const [sourceSnapshot, targetSnapshot] = await Promise.all([
      transaction.get(sourceRef),
      transaction.get(targetRef),
    ]);
    if (!sourceSnapshot.exists()) {
      throw new Error('The attendee record no longer exists. Refresh and try again.');
    }
    if (targetSnapshot.exists()) {
      throw new Error(`Student ID "${cleanStudentId}" is already registered in the system.`);
    }

    transaction.set(targetRef, {
      ...(sourceSnapshot.data() as AttendeeDoc),
      ...safeUpdates,
      id: cleanStudentId,
      studentId: cleanStudentId,
      updatedAt: now,
      updatedBy,
    });
    transaction.delete(sourceRef);
  });
}

/** Delete an attendee record. Firestore rules restrict this operation to admins. */
export async function deleteAttendee(attendeeId: string): Promise<void> {
  await deleteDoc(doc(db, ATTENDEES_COLLECTION, attendeeId));
}

/**
 * Bulk import attendees into Firestore using chunked batch writes.
 */
export async function importAttendeesBatch(
  importedList: Partial<AttendeeDoc>[],
  overwriteExisting: boolean = true,
  importedBy: string = 'admin'
): Promise<{ added: number; updated: number; total: number }> {
  const currentAttendees = await getAttendees();
  const currentMap = new Map<string, AttendeeDoc>();
  currentAttendees.forEach((a) => {
    currentMap.set(a.studentId.trim(), a);
  });

  const settings = await getEventSettings();
  const groups = await getGroups();
  const groupIds = groups.map((g) => g.id);

  let added = 0;
  let updated = 0;
  const now = new Date().toISOString();
  const docsToWrite: AttendeeDoc[] = [];

  for (const item of importedList) {
    if (!item.studentId) continue;
    const cleanId = String(item.studentId).trim();
    const validation = validateStudentIdFormat(cleanId);
    if (!validation.isValid) continue;

    const existing = currentMap.get(cleanId);
    const regType = item.registrationType || 'EARLY BIRD';
    const expected =
      regType === 'EARLY BIRD' ? settings.earlyBirdPrice : settings.regularPrice;
    const actual = item.actualAmount !== undefined ? item.actualAmount : expected;
    const paymentStatus: PaymentStatus =
      item.paymentStatus || (actual > 0 ? 'PAID' : 'UNPAID');

    let gId = (item.groupId || '').trim().toLowerCase();
    if (!groupIds.includes(gId)) {
      gId = groupIds[Math.floor(Math.random() * groupIds.length)] || 'kapre';
    }

    if (existing) {
      if (overwriteExisting) {
        const updatedDoc: AttendeeDoc = {
          ...existing,
          name: item.name || existing.name,
          section: (item.section || existing.section).toUpperCase(),
          year: item.year || existing.year,
          course: item.course || existing.course,
          registrationType: regType,
          actualAmount: actual,
          paymentStatus,
          groupId: gId,
          datePaid: item.datePaid || existing.datePaid || now.split('T')[0],
          updatedAt: now,
          updatedBy: importedBy,
        };
        docsToWrite.push(updatedDoc);
        updated++;
      }
    } else {
      const newDoc: AttendeeDoc = {
        id: cleanId,
        userId: item.userId || null,
        studentId: cleanId,
        name: item.name || 'Unnamed Student',
        section: (item.section || 'BSIT-1A').toUpperCase(),
        year: item.year || '1st Year',
        course: item.course || 'BS Information Technology',
        registrationType: regType,
        expectedAmount: expected,
        actualAmount: actual,
        datePaid: item.datePaid || now.split('T')[0],
        paymentStatus,
        groupId: gId,
        registeredAt: item.registeredAt || now,
        registeredBy: importedBy,
        updatedAt: now,
        updatedBy: importedBy,
      };
      docsToWrite.push(newDoc);
      currentMap.set(cleanId, newDoc);
      added++;
    }
  }

  // Write in batches of up to 450
  const CHUNK_SIZE = 450;
  for (let i = 0; i < docsToWrite.length; i += CHUNK_SIZE) {
    const chunk = docsToWrite.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((docData) => {
      const docRef = doc(db, ATTENDEES_COLLECTION, docData.studentId);
      batch.set(docRef, docData, { merge: true });
    });

    await batch.commit();
  }

  return {
    added,
    updated,
    total: currentAttendees.length + added,
  };
}
