import React, { useState, useEffect } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { RegistrationType } from '../../types';
import {
  getEventSettings,
  createAttendee,
  isStudentIdRegistered,
  subscribeToEventSettings,
  DEFAULT_EVENT_SETTINGS,
  EventSettingsDoc,
  AttendeeDoc,
} from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  Hash,
  BookOpen,
  Layers,
  Printer,
  Users,
  Terminal,
} from 'lucide-react';

interface RegisterViewProps {
  onNavigateToAttendees: (groupFilter?: string) => void;
  onNavigateToHome: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigateToAttendees,
  onNavigateToHome,
}) => {
  const { user } = useAuth();
  const [eventSettings, setEventSettings] = useState<EventSettingsDoc>(DEFAULT_EVENT_SETTINGS);

  // Form Fields
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('BS Information Technology');
  const [yearLevel, setYearLevel] = useState<'1st Year' | '2nd Year' | '3rd Year' | '4th Year'>('1st Year');
  const [section, setSection] = useState('BSIT-1A');
  const [registrationType, setRegistrationType] = useState<RegistrationType>('EARLY BIRD');
  const [datePaid, setDatePaid] = useState(new Date().toISOString().split('T')[0]);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Result state after registration
  const [completedRegistration, setCompletedRegistration] = useState<AttendeeDoc | null>(null);

  // Load real event settings from Firestore
  useEffect(() => {
    getEventSettings().then(setEventSettings).catch(() => {});
    const unsub = subscribeToEventSettings(setEventSettings);
    return () => unsub();
  }, []);

  // Calculate amount dynamically from Firestore event settings (non-arbitrary)
  const calculatedAmount =
    registrationType === 'EARLY BIRD' ? eventSettings.earlyBirdPrice : eventSettings.regularPrice;

  // Student ID Strict Validation (numbers only, exactly 8 digits)
  const validateStudentIdBasic = (id: string): string | null => {
    if (!id.trim()) {
      return 'STUDENT ID IS REQUIRED';
    }
    if (!/^\d+$/.test(id)) {
      return 'STUDENT ID MUST CONTAIN NUMBERS ONLY. LETTERS AND SYMBOLS REJECTED.';
    }
    if (id.length !== 8) {
      return `STUDENT ID MUST BE EXACTLY 8 DIGITS (CURRENTLY ${id.length} DIGITS).`;
    }
    return null;
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setStudentId(rawVal);
    setServerError(null);

    if (errors.studentId) {
      const err = validateStudentIdBasic(rawVal);
      setErrors((prev) => {
        const next = { ...prev };
        if (!err) delete next.studentId;
        else next.studentId = err;
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const idError = validateStudentIdBasic(studentId);
    if (idError) newErrors.studentId = idError;

    if (!fullName.trim()) {
      newErrors.fullName = 'FULL NAME IS REQUIRED';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'FULL NAME MUST BE AT LEAST 3 CHARACTERS';
    }

    if (!course.trim()) {
      newErrors.course = 'COURSE SELECTION IS REQUIRED';
    }

    if (!yearLevel) {
      newErrors.yearLevel = 'YEAR LEVEL IS REQUIRED';
    }

    if (!section.trim()) {
      newErrors.section = 'SECTION CODE IS REQUIRED';
    }

    if (!registrationType) {
      newErrors.registrationType = 'REGISTRATION TYPE IS REQUIRED';
    }

    if (!datePaid.trim()) {
      newErrors.datePaid = 'DATE PAID IS REQUIRED';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      const el = document.getElementById('registration-error-summary');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check duplicate ID in Firestore
      const isRegistered = await isStudentIdRegistered(studentId.trim());
      if (isRegistered) {
        setServerError(`STUDENT ID "${studentId.trim()}" IS ALREADY REGISTERED IN THE DATABASE.`);
        setIsSubmitting(false);
        const el = document.getElementById('registration-error-summary');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Create attendee in Firestore with server-derived expectedAmount
      const saved = await createAttendee({
        studentId: studentId.trim(),
        name: fullName.trim(),
        section: section.trim().toUpperCase(),
        year: yearLevel,
        course,
        registrationType,
        actualAmount: calculatedAmount,
        datePaid,
        paymentStatus: calculatedAmount > 0 ? 'PAID' : 'UNPAID',
        userId: user?.uid || null,
        registeredBy: user?.email || 'portal',
      });

      setCompletedRegistration(saved);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || 'Failed to record registration.';
      setServerError(message.toUpperCase());
      setIsSubmitting(false);
      const el = document.getElementById('registration-error-summary');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetForm = () => {
    setCompletedRegistration(null);
    setStudentId('');
    setFullName('');
    setSection('BSIT-1A');
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // CONFIRMATION VIEW: REGISTRATION COMPLETE
  // ==========================================
  if (completedRegistration) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
        {/* Registration Complete Banner */}
        <div className="bg-[#FFD93D] border-8 border-black p-6 sm:p-8 shadow-[12px_12px_0px_#000000] text-center space-y-4 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000000 2px, transparent 2px)',
              backgroundSize: '16px 16px',
            }}
          />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-black text-[#FFD93D] font-mono text-xs font-black uppercase px-3 py-1 border-2 border-black">
              <CheckCircle2 className="w-4 h-4 text-[#FFD93D]" />
              <span>RECORD CONFIRMED // ATTENDEE ENROLLED</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-none">
              REGISTRATION COMPLETE
            </h1>

            <p className="text-sm sm:text-base font-bold uppercase text-black max-w-2xl mx-auto">
              Attendee has been successfully registered for the PSITS Acquaintance Party 2026. Student record has been committed to the official database.
            </p>
          </div>
        </div>

        {/* OFFICIAL ATTENDEE DATA TICKET BREAKDOWN */}
        <div className="bg-white border-8 border-black shadow-[12px_12px_0px_#000000]">
          <div className="p-4 sm:p-6 bg-black text-[#FFFDF5] flex flex-wrap items-center justify-between gap-3 border-b-4 border-black">
            <div>
              <span className="font-mono text-xs font-bold text-[#FFD93D] uppercase block">
                OFFICIAL RECORD PASS
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                STUDENT RECORD SUMMARY
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="yellow" size="md">
                VERIFIED PASS
              </Badge>
              <Badge variant="red" size="md">
                {completedRegistration.registrationType}
              </Badge>
            </div>
          </div>

          {/* Key-Value Matrix */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFDF5]">
            <div className="space-y-4">
              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  1. STUDENT ID (8 DIGITS)
                </span>
                <span className="text-2xl font-black font-mono uppercase text-black tracking-wider">
                  {completedRegistration.studentId}
                </span>
              </div>

              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  2. ATTENDEE FULL NAME
                </span>
                <span className="text-xl font-black uppercase text-black">
                  {completedRegistration.name}
                </span>
              </div>

              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  3. COURSE & DEGREE PROGRAM
                </span>
                <span className="text-base font-black uppercase text-black">
                  {completedRegistration.course}
                </span>
              </div>

              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  4. SECTION DESIGNATION
                </span>
                <span className="text-lg font-black uppercase text-black">
                  {completedRegistration.section}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  5. ACADEMIC YEAR LEVEL
                </span>
                <span className="text-lg font-black uppercase text-black">
                  {completedRegistration.year}
                </span>
              </div>

              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  6. REGISTRATION TYPE
                </span>
                <span className="text-lg font-black uppercase text-black">
                  {completedRegistration.registrationType}
                </span>
              </div>

              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  7. AMOUNT PAID (PERMANENT HISTORICAL PRICE)
                </span>
                <span className="text-2xl font-black font-mono text-[#FF6B6B]">
                  ₱{(completedRegistration.actualAmount !== undefined ? completedRegistration.actualAmount : completedRegistration.expectedAmount).toLocaleString()} PHP
                </span>
              </div>

              <div className="border-b-2 border-black/20 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase text-gray-500 block">
                  8. DATE PAID
                </span>
                <span className="text-base font-black uppercase font-mono text-black">
                  {completedRegistration.datePaid}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & Security Strip */}
          <div className="p-4 bg-[#FFFDF5] border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-black" />
              <span className="font-bold text-gray-700">HASH: #{completedRegistration.id}</span>
            </div>
            <span className="font-black text-black">
              DEPARTMENT: COLLEGE OF COMPUTER STUDIES (CCS)
            </span>
          </div>
        </div>

        {/* Next Step Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button
            variant="primary"
            size="xl"
            onClick={() => onNavigateToAttendees()}
            rightIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
          >
            VIEW ATTENDEE DATABASE
          </Button>

          <Button
            variant="secondary"
            size="xl"
            onClick={handleResetForm}
            leftIcon={<Users className="w-5 h-5 stroke-[3]" />}
          >
            REGISTER ANOTHER ATTENDEE
          </Button>

          <Button
            variant="outline"
            size="xl"
            onClick={onNavigateToHome}
          >
            RETURN HOME
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // REGISTRATION FORM VIEW
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PageHeader
        tag="DEPARTMENT REGISTRATION // PROTOCOL 03"
        title="ATTENDEE"
        titleAccent="REGISTRATION"
        description="Official attendee registration portal for all College of Computer Studies students. Enter verified 8-digit Student ID and payment credentials to record attendee enrollment."
        badgeText="OFFICER ENTRY // ACTIVE"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
        {/* Left Column (5 Cols) - Rules & Fee Computation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price & Event Config Card */}
          <div className="bg-[#FFD93D] border-8 border-black p-6 sm:p-8 shadow-[10px_10px_0px_#000000] relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black bg-black text-[#FFD93D] px-2 py-0.5 uppercase tracking-widest border border-black">
                FEE COMPUTATION
              </span>
              <Badge variant="red" size="sm">
                NON-ARBITRARY PRICING
              </Badge>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight leading-none mb-2">
              EVENT PRICING
            </h3>

            <p className="text-xs font-bold uppercase text-black leading-relaxed mb-6">
              The amount is automatically calculated from official departmental event parameters.
              Students cannot enter arbitrary payment prices.
            </p>

            <div className="space-y-3">
              <div
                className={`p-4 border-4 border-black transition-all cursor-pointer ${
                  registrationType === 'EARLY BIRD'
                    ? 'bg-white shadow-[6px_6px_0px_#000000] -translate-x-1 -translate-y-1'
                    : 'bg-white/60 hover:bg-white'
                }`}
                onClick={() => setRegistrationType('EARLY BIRD')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-black uppercase text-black block">
                      TIER 1: EARLY BIRD
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                      PRIORITY ENROLLMENT // DISCOUNTED PASS
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono text-[#FF6B6B]">
                    ₱{eventSettings.earlyBirdPrice}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 border-4 border-black transition-all cursor-pointer ${
                  registrationType === 'REGULAR'
                    ? 'bg-white shadow-[6px_6px_0px_#000000] -translate-x-1 -translate-y-1'
                    : 'bg-white/60 hover:bg-white'
                }`}
                onClick={() => setRegistrationType('REGULAR')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-black uppercase text-black block">
                      TIER 2: REGULAR
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                      STANDARD ENROLLMENT PASS
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono text-black">
                    ₱{eventSettings.regularPrice}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-4 border-black flex items-center justify-between font-mono text-xs font-black uppercase text-black">
              <span>CURRENT CHARGE:</span>
              <span className="text-xl bg-black text-[#FFD93D] px-3 py-1 border border-black">
                ₱{calculatedAmount} PHP
              </span>
            </div>
          </div>

          {/* Registration Verification Protocol Card */}
          <div className="bg-[#FFFDF5] border-6 border-black p-6 shadow-[8px_8px_0px_#000000] space-y-3">
            <div className="flex items-center gap-2 text-black text-xs font-mono font-black uppercase">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              <span>REGISTRATION VERIFICATION PROTOCOL</span>
            </div>

            <h4 className="text-lg font-black uppercase text-black tracking-tight">
              OPERATIONAL ACCURACY MANDATE
            </h4>

            <p className="text-xs font-bold uppercase text-gray-700 leading-relaxed">
              Verify all student credentials prior to saving. Student ID must be exactly 8 digits and unique. Payment status and dates are audited for financial accountability.
            </p>

            <div className="border-t-2 border-black/20 pt-3 space-y-1 text-xs font-mono font-bold text-gray-600 uppercase">
              <p>• Department: College of Computer Studies</p>
              <p>• Courses: BSIT, BSCS, BSIS, ACT</p>
              <p>• ID Format: Exactly 8 numeric digits</p>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols) - Attendee Registration Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border-8 border-black shadow-[12px_12px_0px_#000000] relative">
            {/* Top Hazard Bar */}
            <div className="h-4 bg-[#000000] flex">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #FFD93D, #FFD93D 12px, #000000 12px, #000000 24px)',
                }}
              />
            </div>

            {/* Header Strip */}
            <div className="p-6 border-b-4 border-black bg-[#FFFDF5] flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-black uppercase text-gray-500 block">
                  DEPARTMENT ENROLLMENT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  ATTENDEE REGISTRATION
                </h2>
              </div>
              <Badge variant="black" size="md">
                8-DIGIT ID VERIFICATION
              </Badge>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Error Summary Alert */}
              {(Object.keys(errors).length > 0 || serverError) && (
                <div
                  id="registration-error-summary"
                  className="bg-[#FF6B6B] border-4 border-black p-4 shadow-[5px_5px_0px_#000000] text-black font-black uppercase text-xs sm:text-sm space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 stroke-[3]" />
                    <span>REGISTRATION REJECTED // PLEASE FIX THE FOLLOWING:</span>
                  </div>
                  {serverError && <p className="font-mono text-xs font-black">{serverError}</p>}
                  {Object.keys(errors).length > 0 && (
                    <ul className="list-disc list-inside font-mono text-xs space-y-1 pl-2">
                      {Object.entries(errors).map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* 1. Student ID Input */}
              <div>
                <Input
                  label="1. STUDENT ID (EXACTLY 8 DIGITS - NUMBERS ONLY)"
                  placeholder="e.g. 01234567"
                  value={studentId}
                  onChange={handleStudentIdChange}
                  error={errors.studentId}
                  helperText="Must be exactly 8 digits. Leading zeros are preserved as a string."
                  leftIcon={<Hash className="w-4 h-4 text-black stroke-[2.5]" />}
                  required
                />
                <div className="mt-1 flex items-center justify-between text-[11px] font-mono font-bold">
                  <span
                    className={
                      studentId.length === 8
                        ? 'text-green-700 font-black'
                        : studentId.length > 8
                        ? 'text-[#FF6B6B] font-black'
                        : 'text-gray-500'
                    }
                  >
                    CHARACTER COUNT: {studentId.length} / 8 DIGITS
                  </span>
                  {/^\d+$/.test(studentId) && studentId.length === 8 && (
                    <span className="text-green-700 font-black">✓ NUMERIC CRITERIA MET</span>
                  )}
                </div>
              </div>

              {/* 2. Full Name Input */}
              <Input
                label="2. ATTENDEE FULL NAME"
                placeholder="e.g. Juan Carlos De La Cruz"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.fullName;
                      return next;
                    });
                  }
                }}
                error={errors.fullName}
                helperText="Enter full formal name as recorded on official school registration"
                leftIcon={<User className="w-4 h-4 text-black stroke-[2.5]" />}
                required
              />

              {/* 3. Course Select */}
              <Select
                label="3. COURSE & DEGREE PROGRAM"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                error={errors.course}
                helperText="Select official College of Computer Studies program"
                leftIcon={<BookOpen className="w-4 h-4 text-black stroke-[2.5]" />}
                options={[
                  { value: 'BS Information Technology', label: 'BS Information Technology (BSIT)' },
                  { value: 'BS Computer Science', label: 'BS Computer Science (BSCS)' },
                  { value: 'BS Information Systems', label: 'BS Information Systems (BSIS)' },
                  { value: 'Associate in Computer Tech', label: 'Associate in Computer Tech (ACT)' },
                ]}
                required
              />

              {/* 4 & 5. Year Level and Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="4. ACADEMIC YEAR LEVEL"
                  value={yearLevel}
                  onChange={(e) =>
                    setYearLevel(
                      e.target.value as '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
                    )
                  }
                  error={errors.yearLevel}
                  helperText="Current matriculation year"
                  leftIcon={<Layers className="w-4 h-4 text-black stroke-[2.5]" />}
                  options={[
                    { value: '1st Year', label: '1st Year' },
                    { value: '2nd Year', label: '2nd Year' },
                    { value: '3rd Year', label: '3rd Year' },
                    { value: '4th Year', label: '4th Year' },
                  ]}
                  required
                />

                <Input
                  label="5. SECTION DESIGNATION"
                  placeholder="e.g. BSIT-1A or BSCS-3B"
                  value={section}
                  onChange={(e) => {
                    setSection(e.target.value);
                    if (errors.section) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.section;
                        return next;
                      });
                    }
                  }}
                  error={errors.section}
                  helperText="Class section code"
                  required
                />
              </div>

              {/* 6. Registration Type & 7. Amount Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="6. REGISTRATION TIER"
                  value={registrationType}
                  onChange={(e) => setRegistrationType(e.target.value as RegistrationType)}
                  helperText="Calculates ticket fee automatically"
                  leftIcon={<CreditCard className="w-4 h-4 text-black stroke-[2.5]" />}
                  options={[
                    { value: 'EARLY BIRD', label: `Early Bird (₱${eventSettings.earlyBirdPrice} PHP)` },
                    { value: 'REGULAR', label: `Regular (₱${eventSettings.regularPrice} PHP)` },
                  ]}
                  required
                />

                <div>
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-black mb-1.5">
                    7. AMOUNT TO CHARGE (PHP)
                  </label>
                  <div className="p-2.5 bg-black text-[#FFD93D] border-3 border-black font-mono font-black text-xl text-center shadow-[3px_3px_0px_#000000]">
                    ₱{calculatedAmount} PHP
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 font-mono mt-1 block">
                    Fixed system pricing based on selected tier
                  </span>
                </div>
              </div>

              {/* 8. Date Paid */}
              <div>
                <Input
                  label="8. PAYMENT VERIFICATION DATE"
                  type="date"
                  value={datePaid}
                  onChange={(e) => {
                    setDatePaid(e.target.value);
                    if (errors.datePaid) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.datePaid;
                        return next;
                      });
                    }
                  }}
                  error={errors.datePaid}
                  helperText="Date payment was made or verified"
                  leftIcon={<Calendar className="w-4 h-4 text-black stroke-[2.5]" />}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  fullWidth
                  disabled={isSubmitting}
                  rightIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
                >
                  {isSubmitting
                    ? 'RECORDING ATTENDEE REGISTRATION...'
                    : 'REGISTER ATTENDEE →'}
                </Button>
              </div>
            </form>

            {/* Footer notice */}
            <div className="border-t-4 border-black bg-[#FFFDF5] p-4 text-xs font-bold text-gray-600 font-mono uppercase flex items-center justify-between">
              <span>CCS DEPARTMENT // PSITS 2026</span>
              <button
                type="button"
                onClick={onNavigateToHome}
                className="text-black font-black hover:underline cursor-pointer"
              >
                RETURN HOME →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
