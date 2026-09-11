import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { GroupDoc, AttendeeDoc } from './types';

const GROUPS_COLLECTION = 'groups';
const ATTENDEES_COLLECTION = 'attendees';

// Exact 12 official Mythical Creature Groups
export const OFFICIAL_12_GROUPS: Omit<GroupDoc, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'kapre',
    name: 'Kapre',
    color: '#FFD93D',
    active: true,
    symbol: '🪵',
    tagline: 'TITANS OF INFRASTRUCTURE & BACKBONE SYSTEMS',
    element: 'Ancient Flora & Smoldering Ash',
    itSpecialty: 'Server Architectures & Heavy Infrastructure',
    traits: ['Rooted Stability', 'Endurance', 'Domain Defense'],
  },
  {
    id: 'sigbin',
    name: 'Sigbin',
    color: '#FF6B6B',
    active: true,
    symbol: '🐾',
    tagline: 'SHADOW RUNNERS & CYBERSECURITY OPS',
    element: 'Eclipse Shadows & Silent Stride',
    itSpecialty: 'Penetration Testing & Stealth Protocols',
    traits: ['Hyper Velocity', 'Cryptic Agility', 'Inverted Logic'],
  },
  {
    id: 'aswang',
    name: 'Aswang',
    color: '#C4B5FD',
    active: true,
    symbol: '🦇',
    tagline: 'POLYMORPHIC APEX RUNTIME',
    element: 'Midnight Mist & Shape Flux',
    itSpecialty: 'Adaptive Algorithms & Microservices',
    traits: ['Shape Shifting', 'Dynamic Reflexes', 'Night Vision'],
  },
  {
    id: 'tikbalang',
    name: 'Tikbalang',
    color: '#FFFDF5',
    active: true,
    symbol: '🐎',
    tagline: 'PATHWAY LABYRINTH & NETWORK ROUTING',
    element: 'Inverted Horizons & Forest Crossroads',
    itSpecialty: 'Distributed Routing & Mesh Topologies',
    traits: ['Path Manipulation', 'Perceptual Mastery', 'Gateway Control'],
  },
  {
    id: 'chanak',
    name: 'Chanak',
    color: '#FFD93D',
    active: true,
    symbol: '⚡',
    tagline: 'ANOMALY INJECTORS & CHAOS TESTING',
    element: 'Primal Trickery & Sudden Blitz',
    itSpecialty: 'Chaos Engineering & Stress Testing',
    traits: ['Tactical Deception', 'High Impact Bursts', 'Fearless Tenacity'],
  },
  {
    id: 'shokoy',
    name: 'Shokoy',
    color: '#000000',
    active: true,
    symbol: '🌊',
    tagline: 'DEEP ABYSS DATA STREAMS',
    element: 'Brine Currents & Bioluminescent Depths',
    itSpecialty: 'Pipeline Streaming & Asynchronous Queues',
    traits: ['Deep Pressure Resilience', 'Fluid Mastery', 'Torrential Force'],
  },
  {
    id: 'manananggal',
    name: 'Manananggal',
    color: '#FF6B6B',
    active: true,
    symbol: '🦅',
    tagline: 'DECOUPLED FLIGHT & CLOUD DISTRIBUTED NODES',
    element: 'Lunar Thermals & Severed Wings',
    itSpecialty: 'Decoupled Clusters & Asynchronous Jobs',
    traits: ['Modular Decoupling', 'Aerial Superiority', 'Twin Execution'],
  },
  {
    id: 'duwende',
    name: 'Duwende',
    color: '#C4B5FD',
    active: true,
    symbol: '🪨',
    tagline: 'ARCANE RELIC VAULT & HARDWARE PURVEYORS',
    element: 'Mound Minerals & Subterranean Circuits',
    itSpecialty: 'Embedded Systems & Hardware Cache',
    traits: ['Micro Architectures', 'Subterranean Wisdom', 'Vault Security'],
  },
  {
    id: 'mangkukulam',
    name: 'Mangkukulam',
    color: '#FFD93D',
    active: true,
    symbol: '🔮',
    tagline: 'ESOTERIC CODE WEAVERS & SPELLBINDERS',
    element: 'Wax Talismans & Shadow Syntax',
    itSpecialty: 'Compiler Sorcery & Cryptographic Ciphers',
    traits: ['Esoteric Synthesis', 'Psychic Tethering', 'Reversible Curses'],
  },
  {
    id: 'sirena',
    name: 'Sirena',
    color: '#FFFDF5',
    active: true,
    symbol: '🧜‍♀️',
    tagline: 'ACOUSTIC SYNAPSE & USER RESONANCE',
    element: 'Coral Lagoons & Melodic Waveforms',
    itSpecialty: 'Frontend Interfaces & Sensory Engineering',
    traits: ['Harmonic Influence', 'Sensory Capture', 'Unflinching Charisma'],
  },
  {
    id: 'diwata',
    name: 'Diwata',
    color: '#C4B5FD',
    active: true,
    symbol: '✨',
    tagline: 'GUARDIAN OVERLORDS OF FOREST ECOSYSTEMS',
    element: 'Sacred Groves & Ethereal Radiance',
    itSpecialty: 'High-Availability Governance & Ethics',
    traits: ['High Order Governance', 'Elemental Purity', 'Equilibrium Guard'],
  },
  {
    id: 'otlum',
    name: 'Otlum',
    color: '#FF6B6B',
    active: true,
    symbol: '⏳',
    tagline: 'REVERSE TIME & CHRONO-VERSION CONTROL',
    element: 'Retrograde Temporal Flow & Ghost Pixels',
    itSpecialty: 'Time Travel Debugging & Rollback Protocols',
    traits: ['Temporal Rollback', 'Inverted Execution', 'Paradox Resistance'],
  },
];

/**
 * Seed exactly the 12 official groups in Firestore `groups/{groupId}`
 */
export async function seedOfficialGroups(): Promise<GroupDoc[]> {
  const now = new Date().toISOString();
  const seededList: GroupDoc[] = [];

  for (const group of OFFICIAL_12_GROUPS) {
    const groupRef = doc(db, GROUPS_COLLECTION, group.id);
    const existing = await getDoc(groupRef);

    if (!existing.exists()) {
      const docData: GroupDoc = {
        ...group,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(groupRef, docData);
      seededList.push(docData);
    } else {
      seededList.push(existing.data() as GroupDoc);
    }
  }

  return seededList;
}

/**
 * Reset all 12 groups to default configurations
 */
export async function resetGroupsToDefault(): Promise<GroupDoc[]> {
  const now = new Date().toISOString();
  const resetList: GroupDoc[] = [];

  for (const group of OFFICIAL_12_GROUPS) {
    const groupRef = doc(db, GROUPS_COLLECTION, group.id);
    const docData: GroupDoc = {
      ...group,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(groupRef, docData);
    resetList.push(docData);
  }

  return resetList;
}

/**
 * Get all 12 groups from Firestore
 */
export async function getGroups(): Promise<GroupDoc[]> {
  try {
    const ref = collection(db, GROUPS_COLLECTION);
    const snapshot = await getDocs(ref);

    if (snapshot.empty) {
      const now = new Date().toISOString();
      return OFFICIAL_12_GROUPS.map((group) => ({ ...group, createdAt: now, updatedAt: now }));
    }

    const docs = snapshot.docs.map((d) => d.data() as GroupDoc);

    // Only the official configuration is exposed to the application. This keeps
    // accidental, stale, or placeholder group documents out of event operations.
    const knownGroups = new Map(docs.map((group) => [group.id, group]));
    const now = new Date().toISOString();
    return OFFICIAL_12_GROUPS.map((official) => knownGroups.get(official.id) || {
      ...official,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error('Failed to get groups from Firestore, returning local defaults:', err);
    const now = new Date().toISOString();
    return OFFICIAL_12_GROUPS.map((g) => ({ ...g, createdAt: now, updatedAt: now }));
  }
}

/**
 * Real-time listener for groups
 */
export function subscribeToGroups(callback: (groups: GroupDoc[]) => void): () => void {
  const ref = collection(db, GROUPS_COLLECTION);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => d.data() as GroupDoc);
      callback(list);
    }
  }, (err) => {
    console.error('Groups subscription error:', err);
  });
}

/**
 * Update Group configuration (display name, color, active state)
 */
export async function updateGroupConfig(
  groupId: string,
  updates: Partial<GroupDoc>
): Promise<void> {
  const ref = doc(db, GROUPS_COLLECTION, groupId);
  const now = new Date().toISOString();
  await setDoc(
    ref,
    {
      ...updates,
      updatedAt: now,
    },
    { merge: true }
  );
}

/**
 * Get roster of attendees assigned to a specific group
 */
export async function getGroupRoster(groupId: string): Promise<AttendeeDoc[]> {
  const ref = collection(db, ATTENDEES_COLLECTION);
  const q = query(ref, where('groupId', '==', groupId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as AttendeeDoc);
}

/**
 * Assign an individual attendee to a group
 */
export async function assignGroup(
  attendeeId: string,
  groupId: string,
  updatedBy: string = 'officer'
): Promise<void> {
  const ref = doc(db, ATTENDEES_COLLECTION, attendeeId);
  const now = new Date().toISOString();
  await updateDoc(ref, {
    groupId,
    updatedAt: now,
    updatedBy,
  });
}

/**
 * Randomize all eligible attendees across the 12 groups with balanced distribution.
 * Uses Fisher-Yates shuffle and chunked batch writes.
 */
export interface RandomizeGroupsResult {
  totalAssigned: number;
  groupCounts: Record<string, number>;
  timestamp: string;
}

export async function randomizeGroups(updatedBy: string = 'admin'): Promise<RandomizeGroupsResult> {
  // 1. Retrieve all registered attendees
  const attendeesRef = collection(db, ATTENDEES_COLLECTION);
  const attendeesSnap = await getDocs(attendeesRef);
  const attendeesList = attendeesSnap.docs.map((d) => d.data() as AttendeeDoc);

  // 2. Retrieve groups (filter active)
  const groupsList = await getGroups();
  const activeGroups = groupsList.filter((g) => g.active !== false);
  const targetGroups = activeGroups.length === 12 ? activeGroups : OFFICIAL_12_GROUPS;

  // 3. Fisher-Yates shuffle attendee array
  const shuffledAttendees = [...attendeesList];
  for (let i = shuffledAttendees.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledAttendees[i], shuffledAttendees[j]] = [shuffledAttendees[j], shuffledAttendees[i]];
  }

  // 4. Shuffle group order to avoid positional skew
  const shuffledGroups = [...targetGroups];
  for (let i = shuffledGroups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledGroups[i], shuffledGroups[j]] = [shuffledGroups[j], shuffledGroups[i]];
  }

  const groupCounts: Record<string, number> = {};
  targetGroups.forEach((g) => {
    groupCounts[g.id] = 0;
  });

  const now = new Date().toISOString();
  const updatesToApply: { id: string; groupId: string }[] = [];

  // 5. Balanced round-robin distribution
  shuffledAttendees.forEach((attendee, index) => {
    const assignedGroup = shuffledGroups[index % 12];
    updatesToApply.push({
      id: attendee.id,
      groupId: assignedGroup.id,
    });
    groupCounts[assignedGroup.id] = (groupCounts[assignedGroup.id] || 0) + 1;
  });

  // 6. Firestore Batched Writes (chunked up to 450 per batch)
  const CHUNK_SIZE = 450;
  for (let i = 0; i < updatesToApply.length; i += CHUNK_SIZE) {
    const chunk = updatesToApply.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((item) => {
      const attendeeDocRef = doc(db, ATTENDEES_COLLECTION, item.id);
      batch.update(attendeeDocRef, {
        groupId: item.groupId,
        updatedAt: now,
        updatedBy,
      });
    });

    await batch.commit();
  }

  return {
    totalAssigned: updatesToApply.length,
    groupCounts,
    timestamp: now,
  };
}
