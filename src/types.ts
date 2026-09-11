export type NavItem = 'HOME' | 'REGISTER' | 'ATTENDEES' | 'GROUPS' | 'SPIN THE WHEEL' | 'LOGIN' | 'ADMIN';

export type UIStyle = 'neo' | 'retro1997';

export type RegistrationType = 'EARLY BIRD' | 'REGULAR';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING';
export type RegistrationStatus = 'UPCOMING' | 'OPEN' | 'CLOSED';
export type UserRole = 'ADMIN' | 'OFFICER' | 'STUDENT';
export type OfficerStatus = 'ACTIVE' | 'DISABLED';

export interface Officer {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OFFICER';
  status: OfficerStatus;
  dateCreated: string;
  lastLogin: string;
}

export interface EventConfig {
  eventName: string;
  tagline: string;
  eventDate: string;
  callTime: string;
  venue: string;
  registrationOpeningDate: string;
  registrationClosingDate: string;
  earlyBirdFee: number;
  regularFee: number;
  registrationStatus: RegistrationStatus;
  currency: string;
  department: string;
  college: string;
}

export interface MythicalCreatureGroup {
  id: string;
  name: string;
  displayName?: string;
  tagline: string;
  element: string;
  itSpecialty: string;
  color: string;
  accentColor: string;
  bgTexture: 'dots' | 'grid' | 'stripes' | 'solid';
  description: string;
  mythLore: string;
  memberCount: number;
  maxCapacity: number;
  symbol: string;
  traits: string[];
  isActive?: boolean;
}

export type AdminSubSection = 'DASHBOARD' | 'OFFICERS' | 'SETTINGS' | 'GROUPS' | 'PRICING';

export interface Attendee {
  id: string;
  studentId: string;
  fullName: string;
  yearLevel: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  section: string;
  course?: string;
  registrationType?: RegistrationType;
  amount?: number;
  expectedAmount?: number;
  actualAmount?: number;
  paymentStatus?: PaymentStatus;
  datePaid?: string;
  groupAssignment: string | null; // Group name or null if unassigned
  registeredAt: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'PENDING';
}

export interface AttendeeRegistration {
  id: string;
  studentId: string;
  fullName: string;
  section: string;
  yearLevel: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  course: string;
  registrationType: RegistrationType;
  amount: number;
  expectedAmount: number;
  actualAmount: number;
  paymentStatus: PaymentStatus;
  datePaid: string;
  groupAssignment: string; // One of the 12 Mythical Creature Groups
  registeredAt: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'PENDING';
}

export interface AttendeeSearchState {
  query: string;
  field: 'ALL' | 'STUDENT_ID' | 'NAME' | 'COURSE' | 'SECTION';
}

export interface AttendeeFilterState {
  course: string;
  section: string;
  year: string;
  registrationType: string;
  group: string;
  paymentStatus: string;
  datePaid: string;
}

export type AttendeeSortOption =
  | 'STUDENT_ID_ASC'
  | 'STUDENT_ID_DESC'
  | 'NAME_AZ'
  | 'NAME_ZA'
  | 'NEWEST_REGISTRATION'
  | 'OLDEST_REGISTRATION'
  | 'COURSE'
  | 'DATE_PAID'
  | 'MYTHICAL_GROUP';

export interface AttendeePaginationState {
  currentPage: number;
  pageSize: number;
}

export interface UserAccount {
  id: string;
  username: string;
  name?: string;
  role?: 'ADMIN' | 'OFFICER';
  createdAt: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'violet' | 'dark' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeVariant = 'yellow' | 'red' | 'violet' | 'black' | 'white' | 'cream';
