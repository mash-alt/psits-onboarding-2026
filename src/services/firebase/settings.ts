import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { EventSettingsDoc } from './types';

const SETTINGS_COLLECTION = 'settings';
const EVENT_DOC_ID = 'event';

export const DEFAULT_EVENT_SETTINGS: EventSettingsDoc = {
  eventName: 'PSITS ACQUAINTANCE PARTY 2026',
  tagline: 'UNLEASH THE MYTH // FORGE THE ALLIANCE // CCS SUPREMACY',
  eventDate: '2026-10-24',
  callTime: '17:00',
  venue: 'Main Auditorium',
  registrationOpenDate: '2026-08-20',
  registrationCloseDate: '2026-10-20',
  earlyBirdPrice: 350,
  regularPrice: 450,
  registrationStatus: 'OPEN',
  currency: 'PHP',
  department: 'CCS Department',
  college: 'College of Computer Studies',
  prizes: [],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Get current event settings from Firestore `settings/event`
 */
export async function getEventSettings(): Promise<EventSettingsDoc> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, EVENT_DOC_ID);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      return snapshot.data() as EventSettingsDoc;
    }
    return DEFAULT_EVENT_SETTINGS;
  } catch (err) {
    console.error('Failed to get event settings from Firestore, returning fallback:', err);
    return DEFAULT_EVENT_SETTINGS;
  }
}

/**
 * Update event settings document `settings/event`
 */
export async function updateEventSettings(
  settings: Partial<EventSettingsDoc>,
  updatedBy: string = 'admin'
): Promise<EventSettingsDoc> {
  const ref = doc(db, SETTINGS_COLLECTION, EVENT_DOC_ID);
  const now = new Date().toISOString();

  const payload: Partial<EventSettingsDoc> = {
    ...settings,
    updatedAt: now,
    updatedBy,
  };

  await setDoc(ref, payload, { merge: true });

  const current = await getEventSettings();
  return current;
}

/**
 * Seed default event settings if missing
 */
export async function seedDefaultEventSettings(): Promise<EventSettingsDoc> {
  const ref = doc(db, SETTINGS_COLLECTION, EVENT_DOC_ID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, DEFAULT_EVENT_SETTINGS);
    return DEFAULT_EVENT_SETTINGS;
  }
  return snapshot.data() as EventSettingsDoc;
}

/**
 * Real-time listener for event settings
 */
export function subscribeToEventSettings(
  callback: (settings: EventSettingsDoc) => void
): () => void {
  const ref = doc(db, SETTINGS_COLLECTION, EVENT_DOC_ID);
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as EventSettingsDoc);
    } else {
      callback(DEFAULT_EVENT_SETTINGS);
    }
  }, (err) => {
    console.error('Event settings subscription error:', err);
  });
}
