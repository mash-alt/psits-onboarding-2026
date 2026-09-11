import React, { useState, useEffect } from 'react';
import { AttendeeRegistration, RegistrationType, PaymentStatus } from '../../types';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { X, Save, AlertCircle } from 'lucide-react';

export interface EditAttendeeModalProps {
  attendee: AttendeeRegistration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: AttendeeRegistration) => Promise<void>;
}

export const EditAttendeeModal: React.FC<EditAttendeeModalProps> = ({
  attendee,
  isOpen,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [yearLevel, setYearLevel] = useState<'1st Year' | '2nd Year' | '3rd Year' | '4th Year'>('1st Year');
  const [registrationType, setRegistrationType] = useState<RegistrationType>('EARLY BIRD');
  const [expectedAmount, setExpectedAmount] = useState<number>(350);
  const [actualAmount, setActualAmount] = useState<number>(350);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [datePaid, setDatePaid] = useState('');
  const [groupAssignment, setGroupAssignment] = useState('');
  const [status, setStatus] = useState<'CONFIRMED' | 'CHECKED_IN' | 'PENDING'>('CONFIRMED');
  const [error, setError] = useState('');

  useEffect(() => {
    if (attendee) {
      setFullName(attendee.fullName);
      setStudentId(attendee.studentId);
      setCourse(attendee.course);
      setSection(attendee.section);
      setYearLevel(attendee.yearLevel);
      setRegistrationType(attendee.registrationType);
      setExpectedAmount(attendee.expectedAmount || (attendee.registrationType === 'EARLY BIRD' ? 350 : 450));
      setActualAmount(attendee.actualAmount !== undefined ? attendee.actualAmount : attendee.amount);
      setPaymentStatus(attendee.paymentStatus);
      setDatePaid(attendee.datePaid);
      setGroupAssignment(attendee.groupAssignment);
      setStatus(attendee.status);
      setError('');
    }
  }, [attendee]);

  if (!isOpen || !attendee) return null;

  const handleTypeChange = (newType: string) => {
    const t = newType as RegistrationType;
    setRegistrationType(t);
    const exp = t === 'EARLY BIRD' ? 350 : 450;
    setExpectedAmount(exp);
    if (paymentStatus === 'PAID') {
      setActualAmount(exp);
    }
  };

  const handlePaymentStatusChange = (newStatus: string) => {
    const ps = newStatus as PaymentStatus;
    setPaymentStatus(ps);
    if (ps === 'PAID') {
      setActualAmount(expectedAmount);
      if (!datePaid || datePaid === 'UNPAID' || datePaid.includes('PENDING')) {
        setDatePaid(new Date().toISOString().split('T')[0]);
      }
    } else if (ps === 'UNPAID') {
      setActualAmount(0);
      setDatePaid('UNPAID');
    } else {
      setActualAmount(0);
      setDatePaid('PENDING VERIFICATION');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('FULL NAME IS REQUIRED');
      return;
    }
    if (!/^\d{8}$/.test(studentId.trim())) {
      setError('STUDENT ID MUST BE EXACTLY 8 NUMERIC DIGITS');
      return;
    }
    const updated: AttendeeRegistration = {
      ...attendee,
      studentId: studentId.trim(),
      fullName: fullName.trim(),
      course,
      section: section.trim().toUpperCase(),
      yearLevel,
      registrationType,
      expectedAmount: Number(expectedAmount),
      actualAmount: Number(actualAmount),
      amount: Number(actualAmount),
      paymentStatus,
      datePaid,
      groupAssignment,
      status,
    };

    try {
      await onSave(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message.toUpperCase() : 'UNABLE TO SAVE ATTENDEE RECORD');
    }
  };

  return (
    <div
      id="edit-attendee-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="edit-attendee-modal-card"
        className="bg-[#FFFFFF] border-4 sm:border-8 border-black shadow-[12px_12px_0px_#000000] w-full max-w-2xl my-8 relative animate-fadeIn overflow-hidden"
      >
        {/* Header */}
        <div className="bg-black text-[#FFD93D] p-4 sm:p-5 flex items-center justify-between border-b-4 border-black font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD93D] text-black font-black text-xs px-2 py-0.5 border-2 border-black">
              ADMINISTRATIVE OVERRIDE
            </span>
            <span className="text-xs font-bold text-white uppercase">
              EDIT RECORD: {attendee.studentId}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close edit modal"
            className="p-1 sm:p-1.5 bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-[#ff5252] transition-all cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border-4 border-[#FF6B6B] text-black font-mono text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="STUDENT ID (8 DIGITS)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              helperText="MUST BE STRICTLY 8 NUMERIC DIGITS"
            />

            <Input
              label="FULL NAME"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Select
              label="COURSE / PROGRAM"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              options={[
                { value: 'BS Information Technology', label: 'BS Information Technology' },
                { value: 'BS Computer Science', label: 'BS Computer Science' },
                { value: 'BS Information Systems', label: 'BS Information Systems' },
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="SECTION"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                required
              />
              <Select
                label="YEAR LEVEL"
                value={yearLevel}
                onChange={(e) =>
                  setYearLevel(e.target.value as '1st Year' | '2nd Year' | '3rd Year' | '4th Year')
                }
                options={[
                  { value: '1st Year', label: '1ST YEAR' },
                  { value: '2nd Year', label: '2ND YEAR' },
                  { value: '3rd Year', label: '3RD YEAR' },
                  { value: '4th Year', label: '4TH YEAR' },
                ]}
              />
            </div>

            <Select
              label="REGISTRATION TYPE"
              value={registrationType}
              onChange={(e) => handleTypeChange(e.target.value)}
              options={[
                { value: 'EARLY BIRD', label: 'EARLY BIRD (₱350)' },
                { value: 'REGULAR', label: 'REGULAR (₱450)' },
              ]}
            />

            <Select
              label="PAYMENT STATUS"
              value={paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              options={[
                { value: 'PAID', label: 'PAID' },
                { value: 'UNPAID', label: 'UNPAID' },
                { value: 'PENDING', label: 'PENDING' },
              ]}
            />

            <Input
              label="ACTUAL AMOUNT PAID (PHP)"
              type="number"
              value={String(actualAmount)}
              onChange={(e) => setActualAmount(Number(e.target.value))}
              required
            />

            <Input
              label="DATE PAID"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
              placeholder="e.g. 2026-09-02 or UNPAID"
            />

            <div className="sm:col-span-2">
              <Select
                label="MYTHICAL CREATURE GROUP ASSIGNMENT"
                value={groupAssignment}
                onChange={(e) => setGroupAssignment(e.target.value)}
                options={[
                  { value: '', label: 'NO ASSIGNMENT / PENDING' },
                  ...OFFICIAL_MYTHICAL_GROUPS.map((g) => ({
                    value: g.name,
                    label: `${g.symbol} ${g.name.toUpperCase()} GROUP`,
                  })),
                ]}
              />
            </div>

            <div className="sm:col-span-2">
              <Select
                label="ATTENDANCE CHECK-IN STATUS"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'CONFIRMED' | 'CHECKED_IN' | 'PENDING')}
                options={[
                  { value: 'CONFIRMED', label: 'CONFIRMED' },
                  { value: 'CHECKED_IN', label: 'CHECKED IN' },
                  { value: 'PENDING', label: 'PENDING' },
                ]}
              />
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={onClose}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              leftIcon={<Save className="w-4 h-4 stroke-[2.5]" />}
            >
              SAVE CHANGES
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
