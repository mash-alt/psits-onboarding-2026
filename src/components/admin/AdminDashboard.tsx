import React, { useState, useEffect } from 'react';
import {
  AdminSubSection,
  EventConfig,
  Officer,
  UserRole,
  AttendeeRegistration,
  MythicalCreatureGroup,
} from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { OfficerManagement } from './OfficerManagement';
import { EventSettingsView } from './EventSettingsView';
import { GroupConfigView } from './GroupConfigView';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToUsers,
  subscribeToEventSettings,
  subscribeToGroups,
  subscribeToAttendees,
  getUsers,
  getEventSettings,
  getGroups,
  getAttendees,
  createOfficerWithPassword,
  updateOfficer as updateOfficerFirestore,
  deleteOfficer as deleteOfficerFirestore,
  toggleOfficerStatus as toggleOfficerStatusFirestore,
  changeOfficerRole as changeOfficerRoleFirestore,
  updateEventSettings,
  updateGroupConfig as updateGroupConfigFirestore,
  resetGroupsToDefault,
  UserDoc,
  EventSettingsDoc,
  GroupDoc,
  AttendeeDoc,
} from '../../services/firebase';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserPlus,
  Settings,
  DollarSign,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Unlock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building,
} from 'lucide-react';

export interface AdminDashboardProps {
  onNavigateToRegister: () => void;
  onNavigateToAttendees: () => void;
  onNavigateToGroups: () => void;
  onNavigateToSpinWheel: () => void;
  onNavigateToHome: () => void;
  initialSubSection?: AdminSubSection;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToRegister,
  onNavigateToAttendees,
  onNavigateToGroups,
  onNavigateToSpinWheel,
  onNavigateToHome,
  initialSubSection = 'DASHBOARD',
}) => {
  const { user, userProfile, role: authRole } = useAuth();
  const [activeSubSection, setActiveSubSection] = useState<AdminSubSection>(initialSubSection);
  const [currentRole, setCurrentRole] = useState<UserRole>(
    (authRole?.toUpperCase() as UserRole) || 'STUDENT'
  );

  // Firestore raw states
  const [rawUsers, setRawUsers] = useState<UserDoc[]>([]);
  const [rawSettings, setRawSettings] = useState<EventSettingsDoc | null>(null);
  const [rawGroups, setRawGroups] = useState<GroupDoc[]>([]);
  const [rawAttendees, setRawAttendees] = useState<AttendeeDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with authRole when it changes
  useEffect(() => {
    if (authRole) {
      setCurrentRole(authRole.toUpperCase() as UserRole);
    }
  }, [authRole]);

  // Real-time subscriptions to Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Initial fetch
    Promise.all([
      getUsers(),
      getEventSettings(),
      getGroups(),
      getAttendees(),
    ]).then(([u, s, g, a]) => {
      setRawUsers(u);
      setRawSettings(s);
      setRawGroups(g);
      setRawAttendees(a);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load initial admin data from Firestore:', err);
      setLoading(false);
    });

    const unsubUsers = subscribeToUsers((u) => setRawUsers(u));
    const unsubSettings = subscribeToEventSettings((s) => setRawSettings(s));
    const unsubGroups = subscribeToGroups((g) => setRawGroups(g));
    const unsubAttendees = subscribeToAttendees((a) => setRawAttendees(a));

    return () => {
      unsubUsers();
      unsubSettings();
      unsubGroups();
      unsubAttendees();
    };
  }, [user]);

  // Mapped entities
  const officers: Officer[] = rawUsers
    .filter((u) => u.role === 'admin' || u.role === 'officer')
    .map((u) => ({
      id: u.uid,
      name: u.name,
      email: u.email,
      role: (u.role.toUpperCase() as 'ADMIN' | 'OFFICER'),
      status: (u.status as 'ACTIVE' | 'DISABLED') || 'ACTIVE',
      dateCreated: u.createdAt,
      lastLogin: u.lastLoginAt || 'NEVER',
    }));

  const eventConfig: EventConfig = {
    eventName: rawSettings?.eventName || 'PSITS ACQUAINTANCE PARTY 2026',
    tagline: rawSettings?.tagline || 'COLLEGE OF COMPUTER STUDIES // 12 MYTHICAL CREATURES',
    eventDate: rawSettings?.eventDate || '2026-09-18',
    callTime: rawSettings?.callTime || '17:00',
    venue: rawSettings?.venue || 'Main Auditorium',
    registrationOpeningDate: rawSettings?.registrationOpenDate || '2026-08-20',
    registrationClosingDate: rawSettings?.registrationCloseDate || '2026-10-20',
    earlyBirdFee: rawSettings?.earlyBirdPrice || 350,
    regularFee: rawSettings?.regularPrice || 450,
    registrationStatus: rawSettings?.registrationStatus || 'OPEN',
    currency: 'PHP',
    department: 'CCS Department',
    college: 'College of Computer Studies',
  };

  const mythicalGroups: MythicalCreatureGroup[] = rawGroups.map((g) => {
    const memberCount = rawAttendees.filter((a) => {
      const gid = (a.groupId || '').toLowerCase();
      return gid === g.id.toLowerCase() || gid === g.name.toLowerCase();
    }).length;

    return {
      id: g.id,
      name: g.name,
      displayName: g.name,
      tagline: g.tagline || '',
      element: g.element || '',
      itSpecialty: g.itSpecialty || '',
      color: g.color || '#FFD93D',
      accentColor: '#000000',
      bgTexture: 'grid',
      description: g.tagline || '',
      mythLore: '',
      memberCount,
      maxCapacity: 60,
      symbol: g.symbol || '⚡',
      traits: g.traits || [],
      isActive: g.active !== false,
    };
  });

  const attendees: AttendeeRegistration[] = rawAttendees.map((a) => ({
    id: a.id,
    studentId: a.studentId,
    fullName: a.name,
    section: a.section,
    yearLevel: a.year as AttendeeRegistration['yearLevel'],
    course: a.course,
    registrationType: a.registrationType,
    amount: a.actualAmount,
    expectedAmount: a.expectedAmount,
    actualAmount: a.actualAmount,
    paymentStatus: a.paymentStatus,
    datePaid: a.datePaid,
    groupAssignment: a.groupId,
    registeredAt: a.registeredAt,
    status: (a.paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING') as any,
  }));

  // Metrics computation
  const totalAttendees = attendees.length;
  const paidCount = attendees.filter((a) => a.paymentStatus === 'PAID').length;
  const unpaidCount = attendees.filter((a) => a.paymentStatus === 'UNPAID').length;
  const earlyBirdCount = attendees.filter((a) => a.registrationType === 'EARLY BIRD').length;
  const regularCount = attendees.filter((a) => a.registrationType === 'REGULAR').length;
  const totalGroups = mythicalGroups.length; // Exactly 12
  const activeOfficersCount = officers.filter((o) => o.status === 'ACTIVE').length;
  const totalRevenue = attendees.reduce(
    (sum, a) => sum + (a.actualAmount || 0),
    0
  );

  // Officer management handlers in Firestore
  const handleAddOfficer = async (data: { name: string; email: string; password?: string; role: 'ADMIN' | 'OFFICER' }) => {
    if (!data.password) throw new Error('An initial password is required.');
    await createOfficerWithPassword({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role.toLowerCase() as 'admin' | 'officer',
    });
  };

  const handleUpdateOfficer = async (updated: Officer) => {
    try {
      await updateOfficerFirestore({
        uid: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role.toLowerCase() as 'admin' | 'officer',
        status: updated.status,
        createdAt: updated.dateCreated || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: updated.lastLogin || 'NEVER',
      });
    } catch (err) {
      console.error('Failed to update officer in Firestore:', err);
    }
  };

  const handleDeleteOfficer = async (id: string) => {
    try {
      await deleteOfficerFirestore(id);
    } catch (err) {
      console.error('Failed to delete officer from Firestore:', err);
    }
  };

  const handleToggleOfficerStatus = async (id: string) => {
    try {
      await toggleOfficerStatusFirestore(id);
    } catch (err) {
      console.error('Failed to toggle officer status in Firestore:', err);
    }
  };

  const handleChangeOfficerRole = async (id: string, newRole: 'ADMIN' | 'OFFICER') => {
    try {
      await changeOfficerRoleFirestore(id, newRole.toLowerCase() as 'admin' | 'officer');
    } catch (err) {
      console.error('Failed to change officer role in Firestore:', err);
    }
  };

  // Settings & Group handlers in Firestore
  const handleSaveConfig = async (newConfig: EventConfig) => {
    await updateEventSettings({
      eventName: newConfig.eventName,
      tagline: newConfig.tagline,
      eventDate: newConfig.eventDate,
      callTime: newConfig.callTime,
      venue: newConfig.venue,
      registrationOpenDate: newConfig.registrationOpeningDate,
      registrationCloseDate: newConfig.registrationClosingDate,
      earlyBirdPrice: newConfig.earlyBirdFee,
      regularPrice: newConfig.regularFee,
      registrationStatus: newConfig.registrationStatus,
      currency: newConfig.currency,
    }, user?.email || 'admin');
  };

  const handleUpdateGroup = async (
    groupId: string,
    updates: { displayName?: string; color?: string; isActive?: boolean }
  ) => {
    try {
      await updateGroupConfigFirestore(groupId, {
        name: updates.displayName,
        color: updates.color,
        active: updates.isActive,
      });
    } catch (err) {
      console.error('Failed to update group in Firestore:', err);
    }
  };

  const handleResetGroupDefaults = async () => {
    try {
      await resetGroupsToDefault();
    } catch (err) {
      console.error('Failed to reset groups in Firestore:', err);
    }
  };

  // Check if access is allowed
  const isStudent = currentRole === 'STUDENT';
  const isAdmin = currentRole === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Authenticated role context */}
      <div className="bg-[#FFFDF5] border-4 border-black p-4 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black text-[#FFD93D] flex items-center justify-center border-2 border-black">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-mono text-[10px] font-black uppercase text-gray-500">
              FIREBASE AUTHORIZATION CONTEXT
            </div>
            <div className="font-mono text-xs font-black text-black uppercase flex items-center gap-2">
              <span>CURRENT ACTIVE ROLE:</span>
              <span
                className={`px-2 py-0.5 border border-black text-xs ${
                  currentRole === 'ADMIN'
                    ? 'bg-[#FF6B6B] text-black'
                    : currentRole === 'OFFICER'
                    ? 'bg-[#FFD93D] text-black'
                    : 'bg-[#C4B5FD] text-black'
                }`}
              >
                {currentRole}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Access Denied Card if current role is STUDENT */}
      {isStudent ? (
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000000] text-center space-y-4 max-w-2xl mx-auto my-12 font-mono">
          <div className="w-16 h-16 bg-[#FF6B6B] border-4 border-black flex items-center justify-center mx-auto text-black shadow-[4px_4px_0px_#000000]">
            <Lock className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black uppercase text-black">
            UNAUTHORIZED ACCESS // STUDENT ROLE
          </h2>
          <p className="text-xs text-gray-700 font-bold max-w-md mx-auto leading-relaxed">
            The <strong>PSITS CONTROL CENTER</strong> is reserved for authorized committee officers and administrators. As a student, your access is limited to registration, attendee search, and creature group rosters.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="md" onClick={onNavigateToHome}>
              RETURN TO EVENT HOME
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. ADMIN TITLE & SUB-NAV TABS */}
          <div className="space-y-4">
            <PageHeader
              tag="DEPARTMENTAL EVENT GOVERNANCE // CCS DEPT"
              title="PSITS CONTROL"
              titleAccent="CENTER"
              description="Administrative dashboard, real-time ticket revenue audit, committee officer management, system configurations, and 12 Mythical Creature Group controllers."
              badgeText={`ACTIVE CONTEXT: ${currentRole}`}
            />

            {/* Sub-section Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b-4 border-black pb-2 font-mono text-xs font-black uppercase">
              <button
                onClick={() => setActiveSubSection('DASHBOARD')}
                className={`px-4 py-2 border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center gap-2 ${
                  activeSubSection === 'DASHBOARD'
                    ? 'bg-black text-[#FFD93D]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>CONTROL DASHBOARD</span>
              </button>

              <button
                onClick={() => setActiveSubSection('OFFICERS')}
                className={`px-4 py-2 border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center gap-2 ${
                  activeSubSection === 'OFFICERS'
                    ? 'bg-black text-[#FFD93D]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>OFFICER MANAGEMENT ({officers.length})</span>
                {!isAdmin && <span className="text-[10px] text-[#FF6B6B]">[VIEW ONLY]</span>}
              </button>

              <button
                onClick={() => setActiveSubSection('SETTINGS')}
                className={`px-4 py-2 border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center gap-2 ${
                  activeSubSection === 'SETTINGS'
                    ? 'bg-black text-[#FFD93D]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>EVENT SETTINGS & PRICING</span>
                {!isAdmin && <span className="text-[10px] text-[#FF6B6B]">[VIEW ONLY]</span>}
              </button>

              <button
                onClick={() => setActiveSubSection('GROUPS')}
                className={`px-4 py-2 border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer transition-all flex items-center gap-2 ${
                  activeSubSection === 'GROUPS'
                    ? 'bg-black text-[#FFD93D]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>12 MYTHICAL CREATURE GROUPS</span>
              </button>
            </div>
          </div>

          {/* 3. TAB 1: MAIN CONTROL DASHBOARD */}
          {activeSubSection === 'DASHBOARD' && (
            <div className="space-y-8 animate-fadeIn">
              {/* 8 STATISTICS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                {/* 1. TOTAL ATTENDEES */}
                <div className="bg-black text-[#FFD93D] border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider text-gray-400">
                    TOTAL ATTENDEES
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-1 text-[#FFD93D]">
                    {totalAttendees}
                  </div>
                  <div className="text-[9px] font-mono font-bold text-gray-400 uppercase mt-1">
                    STUDENT ENROLLEES
                  </div>
                </div>

                {/* 2. PAID */}
                <div className="bg-[#10B981] text-black border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider">
                    PAID
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                    {paidCount}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase mt-1">
                    FEES SETTLED
                  </div>
                </div>

                {/* 3. UNPAID */}
                <div className="bg-[#FF6B6B] text-black border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider">
                    UNPAID
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                    {unpaidCount}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase mt-1">
                    PENDING PAYMENT
                  </div>
                </div>

                {/* 4. EARLY BIRD */}
                <div className="bg-[#C4B5FD] text-black border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider">
                    EARLY BIRD
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                    {earlyBirdCount}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase mt-1">
                    ₱{eventConfig.earlyBirdFee} TIER
                  </div>
                </div>

                {/* 5. REGULAR */}
                <div className="bg-[#FFFDF5] text-black border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider">
                    REGULAR
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                    {regularCount}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase mt-1">
                    ₱{eventConfig.regularFee} TIER
                  </div>
                </div>

                {/* 6. TOTAL GROUPS */}
                <div className="bg-[#FFD93D] text-black border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider">
                    TOTAL GROUPS
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                    {totalGroups}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase mt-1">
                    12 MYTHICAL GROUPS
                  </div>
                </div>

                {/* 7. OFFICERS */}
                <div className="bg-white text-black border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider text-gray-600">
                    OFFICERS
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                    {activeOfficersCount}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase text-gray-500 mt-1">
                    OF {officers.length} REGISTERED
                  </div>
                </div>

                {/* 8. TOTAL REVENUE */}
                <div className="bg-black text-[#10B981] border-4 border-black p-3.5 shadow-[4px_4px_0px_#000000]">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider text-gray-300">
                    TOTAL REVENUE
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 truncate" title={`₱${totalRevenue.toLocaleString()} PHP`}>
                    ₱{totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase text-[#10B981] mt-1">
                    ACTUAL COLLECTED
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS PANEL */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000]">
                <div className="bg-black text-[#FFD93D] p-4 border-b-4 border-black font-mono text-xs font-black uppercase flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>ADMINISTRATIVE & OPERATIONAL QUICK ACTIONS</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-bold">
                    6 ACTION MODULES
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. REGISTER ATTENDEE */}
                  <div
                    onClick={onNavigateToRegister}
                    className="p-5 border-4 border-black bg-[#FFFDF5] hover:bg-[#FFD93D] shadow-[4px_4px_0px_#000000] cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black group-hover:scale-105 transition-transform">
                        <UserPlus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black tracking-tight">
                      REGISTER ATTENDEE
                    </h3>
                    <p className="text-xs font-mono text-gray-700 mt-1 font-bold">
                      Open attendee onboarding form with 8-digit student validation and mythical creature assignment.
                    </p>
                  </div>

                  {/* 2. VIEW ATTENDEES */}
                  <div
                    onClick={onNavigateToAttendees}
                    className="p-5 border-4 border-black bg-[#FFFDF5] hover:bg-[#C4B5FD] shadow-[4px_4px_0px_#000000] cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black tracking-tight">
                      VIEW ATTENDEES
                    </h3>
                    <p className="text-xs font-mono text-gray-700 mt-1 font-bold">
                      Searchable 550+ attendee database with multi-filtering, sorting, and detail overrides.
                    </p>
                  </div>

                  {/* 3. MANAGE GROUPS */}
                  <div
                    onClick={() => setActiveSubSection('GROUPS')}
                    className="p-5 border-4 border-black bg-[#FFFDF5] hover:bg-[#FFD93D] shadow-[4px_4px_0px_#000000] cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black group-hover:scale-105 transition-transform">
                        <Layers className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black tracking-tight">
                      MANAGE GROUPS
                    </h3>
                    <p className="text-xs font-mono text-gray-700 mt-1 font-bold">
                      Inspect and configure display names, colors, and active quotas for the 12 Mythical Creature Groups.
                    </p>
                  </div>

                  {/* 4. SPIN THE WHEEL */}
                  <div
                    onClick={onNavigateToSpinWheel}
                    className="p-5 border-4 border-black bg-[#FFFDF5] hover:bg-[#FF6B6B] shadow-[4px_4px_0px_#000000] cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black tracking-tight">
                      SPIN THE WHEEL
                    </h3>
                    <p className="text-xs font-mono text-gray-700 mt-1 font-bold">
                      Launch the 12-segment Mythical Creature Group assignment wheel and sorting ceremonies.
                    </p>
                  </div>

                  {/* 5. MANAGE OFFICERS */}
                  <div
                    onClick={() => setActiveSubSection('OFFICERS')}
                    className="p-5 border-4 border-black bg-[#FFFDF5] hover:bg-[#10B981] shadow-[4px_4px_0px_#000000] cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black group-hover:scale-105 transition-transform">
                        <Shield className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black tracking-tight">
                      MANAGE OFFICERS
                    </h3>
                    <p className="text-xs font-mono text-gray-700 mt-1 font-bold">
                      Authorize committee members, assign ADMIN/OFFICER permissions, and manage account statuses.
                    </p>
                  </div>

                  {/* 6. EVENT SETTINGS */}
                  <div
                    onClick={() => setActiveSubSection('SETTINGS')}
                    className="p-5 border-4 border-black bg-[#FFFDF5] hover:bg-[#C4B5FD] shadow-[4px_4px_0px_#000000] cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black group-hover:scale-105 transition-transform">
                        <Settings className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black tracking-tight">
                      EVENT SETTINGS
                    </h3>
                    <p className="text-xs font-mono text-gray-700 mt-1 font-bold">
                      Update event schedule dates, registration windows, and Early Bird / Regular pricing tiers.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 4. TAB 2: OFFICER MANAGEMENT */}
          {activeSubSection === 'OFFICERS' && (
            <OfficerManagement
              officers={officers}
              currentUserRole={currentRole}
              onAddOfficer={handleAddOfficer}
              onUpdateOfficer={handleUpdateOfficer}
              onDeleteOfficer={handleDeleteOfficer}
              onToggleStatus={handleToggleOfficerStatus}
              onChangeRole={handleChangeOfficerRole}
            />
          )}

          {/* 5. TAB 3: EVENT SETTINGS & PRICING */}
          {activeSubSection === 'SETTINGS' && (
            <EventSettingsView
              currentConfig={eventConfig}
              currentUserRole={currentRole}
              totalHistoricalAttendees={attendees.length}
              onSaveConfig={handleSaveConfig}
            />
          )}

          {/* 6. TAB 4: GROUP CONFIGURATION */}
          {activeSubSection === 'GROUPS' && (
            <GroupConfigView
              groups={mythicalGroups}
              currentUserRole={currentRole}
              onUpdateGroup={handleUpdateGroup}
              onResetDefaults={handleResetGroupDefaults}
            />
          )}
        </>
      )}
    </div>
  );
};
