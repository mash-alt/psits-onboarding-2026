import {
  AttendeeRegistration,
  EventConfig,
  UserAccount,
  MythicalCreatureGroup,
  Officer,
  UserRole,
} from '../types';
import { OFFICIAL_MYTHICAL_GROUPS } from './mythicalGroups';
import { generateLargeAttendeeDataset } from './mockLargeAttendees';

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  eventName: 'PSITS ACQUAINTANCE PARTY 2026',
  tagline: 'UNLEASH THE MYTH // FORGE THE ALLIANCE // CCS SUPREMACY',
  eventDate: '2026-10-24',
  registrationOpeningDate: '2026-08-20',
  registrationClosingDate: '2026-10-20',
  earlyBirdFee: 350,
  regularFee: 450,
  registrationStatus: 'OPEN',
  currency: 'PHP',
  department: 'CCS Department',
  college: 'College of Computer Studies',
};

const ATTENDEES_STORAGE_KEY = 'psits_attendee_registrations_v4';
const USERS_STORAGE_KEY = 'psits_user_accounts_v2';
const CURRENT_USER_KEY = 'psits_current_user_v2';
const EVENT_CONFIG_KEY = 'psits_event_config_v2';
const OFFICERS_STORAGE_KEY = 'psits_officers_v1';
const GROUPS_CONFIG_KEY = 'psits_groups_config_v2';
const ACTIVE_ROLE_KEY = 'psits_active_role_v1';

// Initial officers list
export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off-001',
    name: 'Marc Joshua Dizon',
    email: 'admin@psits.ccs.edu',
    role: 'ADMIN',
    status: 'ACTIVE',
    dateCreated: '2026-08-15T08:00:00Z',
    lastLogin: '2026-09-08T20:15:00Z',
  },
  {
    id: 'off-002',
    name: 'Alyssa Mae Santos',
    email: 'a.santos@psits.ccs.edu',
    role: 'ADMIN',
    status: 'ACTIVE',
    dateCreated: '2026-08-16T09:30:00Z',
    lastLogin: '2026-09-08T18:45:00Z',
  },
  {
    id: 'off-003',
    name: 'Christian Dave Perez',
    email: 'c.perez@psits.ccs.edu',
    role: 'OFFICER',
    status: 'ACTIVE',
    dateCreated: '2026-08-18T10:00:00Z',
    lastLogin: '2026-09-07T14:20:00Z',
  },
  {
    id: 'off-004',
    name: 'Patricia Gail Ramos',
    email: 'p.ramos@psits.ccs.edu',
    role: 'OFFICER',
    status: 'ACTIVE',
    dateCreated: '2026-08-20T11:15:00Z',
    lastLogin: '2026-09-08T11:00:00Z',
  },
  {
    id: 'off-005',
    name: 'Angelo Miguel Cruz',
    email: 'a.cruz@psits.ccs.edu',
    role: 'OFFICER',
    status: 'DISABLED',
    dateCreated: '2026-08-22T13:00:00Z',
    lastLogin: '2026-08-30T09:10:00Z',
  },
];

// 550+ comprehensive mock attendee dataset
export const INITIAL_REGISTERED_ATTENDEES: AttendeeRegistration[] = generateLargeAttendeeDataset(550);

// --- EVENT CONFIGURATION ---
export function getEventConfig(): EventConfig {
  try {
    const data = localStorage.getItem(EVENT_CONFIG_KEY);
    if (!data) {
      localStorage.setItem(EVENT_CONFIG_KEY, JSON.stringify(DEFAULT_EVENT_CONFIG));
      return DEFAULT_EVENT_CONFIG;
    }
    return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_EVENT_CONFIG;
  }
}

export function saveEventConfig(newConfig: EventConfig): EventConfig {
  try {
    localStorage.setItem(EVENT_CONFIG_KEY, JSON.stringify(newConfig));
  } catch (err) {
    console.error('Failed to save event config to localStorage:', err);
  }
  return newConfig;
}

// --- ATTENDEE REPOSITORY ---
export function getStoredAttendees(): AttendeeRegistration[] {
  try {
    const data = localStorage.getItem(ATTENDEES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_ATTENDEES));
      return INITIAL_REGISTERED_ATTENDEES;
    }
    const parsed: AttendeeRegistration[] = JSON.parse(data);
    return parsed.map((att) => ({
      ...att,
      expectedAmount: att.expectedAmount || (att.registrationType === 'EARLY BIRD' ? 350 : 450),
      actualAmount: att.actualAmount !== undefined ? att.actualAmount : (att.amount || 0),
      paymentStatus: att.paymentStatus || (att.amount && att.amount > 0 ? 'PAID' : 'UNPAID'),
    }));
  } catch {
    return INITIAL_REGISTERED_ATTENDEES;
  }
}

export function isStudentIdRegistered(studentId: string): boolean {
  const attendees = getStoredAttendees();
  return attendees.some((att) => att.studentId === studentId);
}

export function saveAttendeeRegistration(
  registration: Omit<AttendeeRegistration, 'id' | 'registeredAt' | 'status' | 'expectedAmount' | 'actualAmount' | 'paymentStatus'> & {
    expectedAmount?: number;
    actualAmount?: number;
    paymentStatus?: 'PAID' | 'UNPAID' | 'PENDING';
    status?: 'CONFIRMED' | 'CHECKED_IN' | 'PENDING';
  }
): AttendeeRegistration {
  const current = getStoredAttendees();
  const eventConfig = getEventConfig();

  // Pull current active fee from config for new registrations
  const currentExpected =
    registration.registrationType === 'EARLY BIRD'
      ? eventConfig.earlyBirdFee
      : eventConfig.regularFee;

  const expectedAmount = registration.expectedAmount || currentExpected;
  const actualAmount =
    registration.actualAmount !== undefined ? registration.actualAmount : registration.amount;
  const paymentStatus =
    registration.paymentStatus || (actualAmount > 0 ? 'PAID' : 'UNPAID');

  const newRegistration: AttendeeRegistration = {
    ...registration,
    id: `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    expectedAmount,
    actualAmount,
    paymentStatus,
    registeredAt: new Date().toISOString(),
    status: registration.status || 'CONFIRMED',
  };

  const updated = [newRegistration, ...current];
  try {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
  return newRegistration;
}

export function updateAttendee(updatedRecord: AttendeeRegistration): AttendeeRegistration {
  const current = getStoredAttendees();
  const index = current.findIndex((a) => a.id === updatedRecord.id);
  if (index !== -1) {
    current[index] = { ...updatedRecord };
    try {
      localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(current));
    } catch (err) {
      console.error('Failed to update attendee in localStorage:', err);
    }
  }
  return updatedRecord;
}

export function updateAttendeeGroup(
  attendeeId: string,
  newGroupName: string
): AttendeeRegistration | null {
  const current = getStoredAttendees();
  const target = current.find((a) => a.id === attendeeId);
  if (!target) return null;

  target.groupAssignment = newGroupName;
  try {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to update group in localStorage:', err);
  }
  return target;
}

export function importAttendeesBatch(
  importedList: AttendeeRegistration[],
  overwriteExisting: boolean = true
): { added: number; updated: number; total: number } {
  const current = getStoredAttendees();
  const currentMap = new Map<string, AttendeeRegistration>();
  
  // Index by student ID
  current.forEach((att) => {
    currentMap.set(att.studentId.trim().toLowerCase(), att);
  });

  let added = 0;
  let updated = 0;

  importedList.forEach((imported) => {
    const key = imported.studentId.trim().toLowerCase();
    const existing = currentMap.get(key);

    if (existing) {
      if (overwriteExisting) {
        currentMap.set(key, {
          ...existing,
          ...imported,
          id: existing.id, // preserve existing unique internal ID
          registeredAt: existing.registeredAt || imported.registeredAt,
        });
        updated++;
      }
    } else {
      const newId = imported.id || `reg-imp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      currentMap.set(key, {
        ...imported,
        id: newId,
        registeredAt: imported.registeredAt || new Date().toISOString(),
      });
      added++;
    }
  });

  const updatedList = Array.from(currentMap.values());
  try {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to store batch imported attendees in localStorage:', err);
  }

  return { added, updated, total: updatedList.length };
}

export function resetAttendeeStore(): AttendeeRegistration[] {
  const fresh = generateLargeAttendeeDataset(550);
  try {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(fresh));
  } catch (err) {
    console.error('Failed to reset localStorage:', err);
  }
  return fresh;
}

// Total revenue calculation
export function calculateTotalRevenue(attendees: AttendeeRegistration[]): number {
  return attendees.reduce((acc, curr) => {
    if (curr.paymentStatus === 'PAID') {
      const amt = curr.actualAmount !== undefined ? curr.actualAmount : curr.amount;
      return acc + (amt || 0);
    }
    return acc;
  }, 0);
}

// --- GROUP CONFIGURATION REPOSITORY ---
export function getStoredMythicalGroups(): MythicalCreatureGroup[] {
  try {
    const data = localStorage.getItem(GROUPS_CONFIG_KEY);
    if (!data) {
      const initialized = OFFICIAL_MYTHICAL_GROUPS.map((g) => ({
        ...g,
        displayName: g.displayName || g.name,
        isActive: g.isActive !== undefined ? g.isActive : true,
      }));
      localStorage.setItem(GROUPS_CONFIG_KEY, JSON.stringify(initialized));
      return initialized;
    }
    const parsed: MythicalCreatureGroup[] = JSON.parse(data);
    // Ensure all 12 official groups are preserved
    return OFFICIAL_MYTHICAL_GROUPS.map((official) => {
      const match = parsed.find((p) => p.id === official.id || p.name.toLowerCase() === official.name.toLowerCase());
      return {
        ...official,
        displayName: match?.displayName || official.displayName || official.name,
        color: match?.color || official.color,
        isActive: match?.isActive !== undefined ? match.isActive : true,
      };
    });
  } catch {
    return OFFICIAL_MYTHICAL_GROUPS.map((g) => ({ ...g, displayName: g.name, isActive: true }));
  }
}

export function updateGroupConfig(
  groupId: string,
  updates: { displayName?: string; color?: string; isActive?: boolean }
): MythicalCreatureGroup | null {
  const groups = getStoredMythicalGroups();
  const target = groups.find((g) => g.id === groupId || g.name.toLowerCase() === groupId.toLowerCase());
  if (!target) return null;

  if (updates.displayName !== undefined) target.displayName = updates.displayName.trim();
  if (updates.color !== undefined) target.color = updates.color;
  if (updates.isActive !== undefined) target.isActive = updates.isActive;

  try {
    localStorage.setItem(GROUPS_CONFIG_KEY, JSON.stringify(groups));
  } catch (err) {
    console.error('Failed to save group config:', err);
  }
  return target;
}

export function resetGroupConfig(): MythicalCreatureGroup[] {
  const base = OFFICIAL_MYTHICAL_GROUPS.map((g) => ({
    ...g,
    displayName: g.name,
    isActive: true,
  }));
  try {
    localStorage.setItem(GROUPS_CONFIG_KEY, JSON.stringify(base));
  } catch (err) {
    console.error('Failed to reset group config:', err);
  }
  return base;
}

// Group assignment logic using active groups
export function mockAssignMythicalGroup(): MythicalCreatureGroup {
  const allGroups = getStoredMythicalGroups();
  // Filter by active groups if possible, fallback to all if none active
  const activeGroups = allGroups.filter((g) => g.isActive !== false);
  const eligibleGroups = activeGroups.length > 0 ? activeGroups : allGroups;

  const attendees = getStoredAttendees();
  const counts: Record<string, number> = {};
  eligibleGroups.forEach((g) => {
    counts[g.name] = 0;
  });

  attendees.forEach((a) => {
    if (a.groupAssignment && counts[a.groupAssignment] !== undefined) {
      counts[a.groupAssignment] += 1;
    }
  });

  const sorted = [...eligibleGroups].sort(
    (a, b) => (counts[a.name] || 0) - (counts[b.name] || 0)
  );
  const candidatePool = sorted.slice(0, 3);
  return candidatePool[Math.floor(Math.random() * candidatePool.length)];
}

// --- RANDOM GROUP ASSIGNMENT (ALL ATTENDEES BALANCED ACROSS 12 GROUPS) ---
export interface RandomizeGroupsResult {
  totalAssigned: number;
  groupCounts: Record<string, number>;
  timestamp: string;
}

export function randomizeAllAttendeesAcrossGroups(): RandomizeGroupsResult {
  const attendees = getStoredAttendees();
  const groups = getStoredMythicalGroups();
  const targetGroups = groups.length === 12 ? groups : OFFICIAL_MYTHICAL_GROUPS;

  // Shuffle attendees (Fisher-Yates algorithm)
  const shuffledAttendees = [...attendees];
  for (let i = shuffledAttendees.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledAttendees[i], shuffledAttendees[j]] = [shuffledAttendees[j], shuffledAttendees[i]];
  }

  // Shuffle groups order to prevent deterministic position bias
  const shuffledGroups = [...targetGroups];
  for (let i = shuffledGroups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledGroups[i], shuffledGroups[j]] = [shuffledGroups[j], shuffledGroups[i]];
  }

  const groupCounts: Record<string, number> = {};
  targetGroups.forEach((g) => {
    groupCounts[g.name] = 0;
  });

  // Balanced round-robin distribution: ensures absolute variance between any two groups is <= 1
  shuffledAttendees.forEach((attendee, index) => {
    const assignedGroup = shuffledGroups[index % 12];
    attendee.groupAssignment = assignedGroup.name;
    groupCounts[assignedGroup.name] = (groupCounts[assignedGroup.name] || 0) + 1;
  });

  // Persist updated attendees to localStorage
  try {
    localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(shuffledAttendees));
  } catch (err) {
    console.error('Failed to persist randomized groups to localStorage:', err);
  }

  return {
    totalAssigned: shuffledAttendees.length,
    groupCounts,
    timestamp: new Date().toISOString(),
  };
}

// --- SPIN THE WHEEL HISTORY REPOSITORY ---
const SPIN_HISTORY_STORAGE_KEY = 'psits_spin_history_v2';

export interface SpinWinnerRecord {
  id: string;
  spinNumber: number;
  winnerName: string;
  studentId: string;
  course: string;
  section: string;
  yearLevel: string;
  groupAssignment: string;
  timestamp: string;
}

export function getSpinHistory(): SpinWinnerRecord[] {
  try {
    const data = localStorage.getItem(SPIN_HISTORY_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function recordSpinWinner(
  winner: Omit<SpinWinnerRecord, 'id' | 'spinNumber' | 'timestamp'>
): SpinWinnerRecord {
  const currentHistory = getSpinHistory();
  const nextNumber = currentHistory.length + 1;
  const newRecord: SpinWinnerRecord = {
    ...winner,
    id: `spin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    spinNumber: nextNumber,
    timestamp: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };

  const updated = [newRecord, ...currentHistory];
  try {
    localStorage.setItem(SPIN_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to record spin winner:', err);
  }
  return newRecord;
}

export function clearSpinHistory(): void {
  try {
    localStorage.removeItem(SPIN_HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear spin history:', err);
  }
}

export function removeSpinWinnerRecord(id: string): void {
  const currentHistory = getSpinHistory();
  const filtered = currentHistory.filter((item) => item.id !== id);
  try {
    localStorage.setItem(SPIN_HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove spin record:', err);
  }
}

// --- OFFICER REPOSITORY ---
export function getStoredOfficers(): Officer[] {
  try {
    const data = localStorage.getItem(OFFICERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(INITIAL_OFFICERS));
      return INITIAL_OFFICERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_OFFICERS;
  }
}

export function addOfficer(data: {
  name: string;
  email: string;
  role: 'ADMIN' | 'OFFICER';
}): Officer {
  const officers = getStoredOfficers();
  const newOfficer: Officer = {
    id: `off-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    role: data.role,
    status: 'ACTIVE',
    dateCreated: new Date().toISOString(),
    lastLogin: 'NEVER',
  };
  const updated = [newOfficer, ...officers];
  try {
    localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save officer:', err);
  }
  return newOfficer;
}

export function updateOfficer(updated: Officer): Officer {
  const officers = getStoredOfficers();
  const idx = officers.findIndex((o) => o.id === updated.id);
  if (idx !== -1) {
    officers[idx] = { ...updated };
    try {
      localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(officers));
    } catch (err) {
      console.error('Failed to update officer:', err);
    }
  }
  return updated;
}

export function deleteOfficer(id: string): boolean {
  const officers = getStoredOfficers();
  const filtered = officers.filter((o) => o.id !== id);
  try {
    localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete officer:', err);
    return false;
  }
}

export function toggleOfficerStatus(id: string): Officer | null {
  const officers = getStoredOfficers();
  const target = officers.find((o) => o.id === id);
  if (!target) return null;
  target.status = target.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  try {
    localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(officers));
  } catch (err) {
    console.error('Failed to toggle officer status:', err);
  }
  return target;
}

export function changeOfficerRole(id: string, newRole: 'ADMIN' | 'OFFICER'): Officer | null {
  const officers = getStoredOfficers();
  const target = officers.find((o) => o.id === id);
  if (!target) return null;
  target.role = newRole;
  try {
    localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(officers));
  } catch (err) {
    console.error('Failed to change officer role:', err);
  }
  return target;
}

// --- ACTIVE USER ROLE (FOR SIMULATION & TESTING) ---
export function getActiveRole(): UserRole {
  try {
    const role = localStorage.getItem(ACTIVE_ROLE_KEY);
    if (role === 'ADMIN' || role === 'OFFICER' || role === 'STUDENT') {
      return role;
    }
    return 'ADMIN';
  } catch {
    return 'ADMIN';
  }
}

export function setActiveRole(role: UserRole): void {
  try {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  } catch (err) {
    console.error('Failed to set active role:', err);
  }
}

// --- OFFICER USER ACCOUNTS ---
export function getRegisteredUsers(): UserAccount[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function authenticateOfficer(username: string, _password: string): UserAccount {
  const cleanUsername = username.trim();
  const officers = getStoredOfficers();
  const matchedOfficer = officers.find(
    (o) => o.email.toLowerCase().startsWith(cleanUsername.toLowerCase()) || o.name.toLowerCase().includes(cleanUsername.toLowerCase())
  );

  const role: 'ADMIN' | 'OFFICER' = matchedOfficer ? matchedOfficer.role : cleanUsername.toLowerCase().includes('admin') ? 'ADMIN' : 'OFFICER';
  setActiveRole(role);

  const userAccount: UserAccount = {
    id: matchedOfficer ? matchedOfficer.id : `usr-${Date.now().toString(36)}`,
    username: cleanUsername,
    name: matchedOfficer ? matchedOfficer.name : cleanUsername.toUpperCase(),
    role,
    createdAt: new Date().toISOString(),
  };

  setCurrentUser(userAccount);
  return userAccount;
}

export function getCurrentUser(): UserAccount | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
}
