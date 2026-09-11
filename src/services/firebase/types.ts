// Firestore Schema Types matching exact requirements

export type UserRole = 'student' | 'officer' | 'admin';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export type RegistrationType = 'EARLY BIRD' | 'REGULAR';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING';
export type RegistrationStatus = 'UPCOMING' | 'OPEN' | 'CLOSED';

export interface Prize {
  id: string;
  name: string;
  value: string;
}

export interface AttendeeDoc {
  id: string;
  userId?: string | null;
  studentId: string; // Strictly 8 numeric digits stored as string
  name: string;
  section: string;
  year: string;
  course: string;
  registrationType: RegistrationType;
  expectedAmount: number;
  actualAmount: number;
  datePaid: string;
  paymentStatus: PaymentStatus;
  groupId: string; // One of the 12 official group IDs
  registeredAt: string;
  registeredBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface GroupDoc {
  id: string; // e.g. "kapre"
  name: string; // e.g. "Kapre"
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // UI lore metadata
  displayName?: string;
  symbol?: string;
  tagline?: string;
  element?: string;
  itSpecialty?: string;
  traits?: string[];
}

export interface EventSettingsDoc {
  eventName: string;
  tagline: string;
  eventDate: string;
  callTime?: string;
  venue?: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  earlyBirdPrice: number;
  regularPrice: number;
  registrationStatus: RegistrationStatus;
  updatedAt: string;
  updatedBy: string;
  currency?: string;
  department?: string;
  college?: string;
  prizes?: Prize[];
}

export interface SpinHistoryDoc {
  id: string;
  winnerAttendeeId: string;
  winnerName: string;
  winnerStudentId: string;
  groupId: string;
  spinNumber: number;
  timestamp: string;
  spunBy: string;
  wasRemovedFromPool: boolean;
  prizeId?: string;
  prizeName?: string;
  prizeValue?: string;
}
