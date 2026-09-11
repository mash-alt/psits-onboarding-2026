import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { SpinHistoryDoc } from './types';

const SPIN_HISTORY_COLLECTION = 'spinHistory';

/**
 * Record a new spin winner in Firestore `spinHistory/{spinId}`
 */
export async function createSpinRecord(record: {
  winnerAttendeeId: string;
  winnerName: string;
  winnerStudentId: string;
  groupId: string;
  spunBy?: string;
  wasRemovedFromPool?: boolean;
  prizeId?: string;
  prizeName?: string;
  prizeValue?: string;
}): Promise<SpinHistoryDoc> {
  const currentHistory = await getSpinHistory();
  const nextSpinNumber = currentHistory.length + 1;
  const now = new Date();

  const spinId = `spin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const spinDoc: SpinHistoryDoc = {
    id: spinId,
    winnerAttendeeId: record.winnerAttendeeId,
    winnerName: record.winnerName,
    winnerStudentId: record.winnerStudentId,
    groupId: record.groupId,
    spinNumber: nextSpinNumber,
    timestamp: now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    spunBy: record.spunBy || 'officer',
    wasRemovedFromPool: Boolean(record.wasRemovedFromPool),
    prizeId: record.prizeId,
    prizeName: record.prizeName,
    prizeValue: record.prizeValue,
  };

  await setDoc(doc(db, SPIN_HISTORY_COLLECTION, spinId), spinDoc);
  return spinDoc;
}

/**
 * Get all spin history records
 */
export async function getSpinHistory(): Promise<SpinHistoryDoc[]> {
  try {
    const ref = collection(db, SPIN_HISTORY_COLLECTION);
    const q = query(ref, orderBy('spinNumber', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as SpinHistoryDoc);
  } catch (err) {
    // If index isn't created or order query fails, fetch unordered and sort in memory
    try {
      const ref = collection(db, SPIN_HISTORY_COLLECTION);
      const snapshot = await getDocs(ref);
      const list = snapshot.docs.map((d) => d.data() as SpinHistoryDoc);
      return list.sort((a, b) => (b.spinNumber || 0) - (a.spinNumber || 0));
    } catch {
      return [];
    }
  }
}

/**
 * Subscribe to real-time spin history updates
 */
export function subscribeToSpinHistory(
  callback: (history: SpinHistoryDoc[]) => void
): () => void {
  const ref = collection(db, SPIN_HISTORY_COLLECTION);
  return onSnapshot(ref, (snapshot) => {
    const list = snapshot.docs.map((d) => d.data() as SpinHistoryDoc);
    list.sort((a, b) => (b.spinNumber || 0) - (a.spinNumber || 0));
    callback(list);
  }, (err) => {
    console.error('Spin history subscription error:', err);
  });
}

/**
 * Delete a single spin record by ID
 */
export async function removeSpinRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, SPIN_HISTORY_COLLECTION, id));
}

export async function setSpinWinnerRemoval(id: string, wasRemovedFromPool: boolean): Promise<void> {
  await updateDoc(doc(db, SPIN_HISTORY_COLLECTION, id), { wasRemovedFromPool });
}

/**
 * Clear all spin history records
 */
export async function clearSpinHistory(): Promise<void> {
  const history = await getSpinHistory();
  const batch = writeBatch(db);
  history.forEach((item) => {
    batch.delete(doc(db, SPIN_HISTORY_COLLECTION, item.id));
  });
  await batch.commit();
}
