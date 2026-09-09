import React, { useState } from 'react';
import { AttendeeRegistration } from '../../types';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import { MythicalGroupBadge } from '../ui/MythicalGroupBadge';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  X,
  Edit3,
  Shuffle,
  Calendar,
  CreditCard,
  GraduationCap,
  Hash,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export interface AttendeeDetailModalProps {
  attendee: AttendeeRegistration | null;
  isOpen: boolean;
  onClose: () => void;
  onEditAttendee: (attendee: AttendeeRegistration) => void;
  onChangeGroup: (attendee: AttendeeRegistration, newGroup: string) => void;
}

export const AttendeeDetailModal: React.FC<AttendeeDetailModalProps> = ({
  attendee,
  isOpen,
  onClose,
  onEditAttendee,
  onChangeGroup,
}) => {
  const [isChangingGroup, setIsChangingGroup] = useState(false);
  const [selectedNewGroup, setSelectedNewGroup] = useState('');

  if (!isOpen || !attendee) return null;

  const currentGroup = OFFICIAL_MYTHICAL_GROUPS.find(
    (g) => g.name.toLowerCase() === attendee.groupAssignment?.toLowerCase()
  );

  const handleGroupSave = () => {
    if (selectedNewGroup && selectedNewGroup !== attendee.groupAssignment) {
      onChangeGroup(attendee, selectedNewGroup);
    }
    setIsChangingGroup(false);
  };

  return (
    <div
      id="attendee-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="attendee-detail-modal-card"
        className="bg-[#FFFFFF] border-4 sm:border-8 border-black shadow-[12px_12px_0px_#000000] w-full max-w-2xl my-8 relative animate-fadeIn overflow-hidden"
      >
        {/* Brutalist Modal Header */}
        <div className="bg-black text-[#FFD93D] p-4 sm:p-5 flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="bg-[#FFD93D] text-black font-mono font-black text-xs px-2 py-0.5 border-2 border-black">
              ATTENDEE PROFILE
            </span>
            <span className="font-mono text-xs text-[#FFFDF5] font-bold">
              ID: {attendee.studentId}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 sm:p-1.5 bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-[#ff5252] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Identity Banner */}
          <div className="bg-[#FFFDF5] border-4 border-black p-4 sm:p-5 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-sm font-black bg-black text-[#FFD93D] px-2 py-0.5 tracking-widest">
                  {attendee.studentId}
                </span>
                <span className="font-mono text-xs font-bold text-gray-600 uppercase">
                  OFFICIAL 8-DIGIT STUDENT ID
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-black tracking-tight leading-tight">
                {attendee.fullName}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-700 font-mono mt-1">
                {attendee.course} &bull; {attendee.section} ({attendee.yearLevel})
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[11px] font-mono font-black uppercase text-gray-500 block mb-1">
                PAYMENT STATUS
              </span>
              {attendee.paymentStatus === 'PAID' ? (
                <span className="inline-flex items-center gap-1.5 bg-[#10B981] text-black font-mono font-black text-xs px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  PAID
                </span>
              ) : attendee.paymentStatus === 'UNPAID' ? (
                <span className="inline-flex items-center gap-1.5 bg-[#FF6B6B] text-black font-mono font-black text-xs px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <AlertTriangle className="w-4 h-4 stroke-[3]" />
                  UNPAID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-[#FFD93D] text-black font-mono font-black text-xs px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <Clock className="w-4 h-4 stroke-[3]" />
                  PENDING
                </span>
              )}
            </div>
          </div>

          {/* Mythical Creature Group Card */}
          <div
            className="border-4 border-black p-4 sm:p-5 shadow-[4px_4px_0px_#000000]"
            style={{
              backgroundColor: currentGroup?.color || '#FFD93D',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3 mb-3">
              <div>
                <span className="font-mono text-[10px] font-black bg-black text-[#FFFDF5] px-2 py-0.5 uppercase tracking-wider inline-block">
                  MYTHICAL CREATURE GROUP ASSIGNMENT
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{currentGroup?.symbol || '⚡'}</span>
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                    {attendee.groupAssignment ? `${attendee.groupAssignment} Group` : 'UNASSIGNED'}
                  </span>
                </div>
              </div>

              {!isChangingGroup && (
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    setSelectedNewGroup(attendee.groupAssignment || 'Kapre');
                    setIsChangingGroup(true);
                  }}
                  leftIcon={<Shuffle className="w-3.5 h-3.5" />}
                >
                  CHANGE GROUP
                </Button>
              )}
            </div>

            {isChangingGroup ? (
              <div className="bg-white border-2 border-black p-3 space-y-3">
                <label className="block text-xs font-mono font-black uppercase text-black">
                  SELECT NEW MYTHICAL CREATURE GROUP:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {OFFICIAL_MYTHICAL_GROUPS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedNewGroup(g.name)}
                      className={`p-2 text-left font-mono font-black text-xs border-2 border-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedNewGroup.toLowerCase() === g.name.toLowerCase()
                          ? 'bg-black text-[#FFD93D] shadow-[2px_2px_0px_#000000]'
                          : 'bg-white hover:bg-gray-100 text-black'
                      }`}
                    >
                      <span>{g.symbol}</span>
                      <span className="truncate">{g.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingGroup(false)}
                  >
                    CANCEL
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleGroupSave}
                  >
                    CONFIRM REALLOCATION
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-bold text-black font-sans leading-relaxed">
                {currentGroup?.tagline || 'OFFICIAL ACQUAINTANCE PARTY FACTION // 12 MYTHICAL GROUPS'}
              </p>
            )}
          </div>

          {/* Complete 12 Fields Matrix */}
          <div className="border-4 border-black bg-[#FFFFFF] shadow-[4px_4px_0px_#000000]">
            <div className="bg-black text-[#FFFDF5] font-mono font-black text-xs px-3 py-2 border-b-2 border-black uppercase tracking-wider">
              REGISTRATION & FINANCIAL RECORD
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x-2 divide-black">
              {/* Left Column: Academic Data */}
              <div className="p-4 space-y-3.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">STUDENT ID</span>
                  <span className="font-black text-black text-sm bg-[#FFD93D] px-1.5 py-0.5 border border-black">
                    {attendee.studentId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">NAME</span>
                  <span className="font-black text-black">{attendee.fullName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">COURSE</span>
                  <span className="font-black text-black text-right">{attendee.course}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">SECTION</span>
                  <span className="font-black text-black bg-black text-white px-2 py-0.5">
                    {attendee.section}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">YEAR LEVEL</span>
                  <span className="font-black text-black">{attendee.yearLevel}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 font-bold uppercase">REGISTRATION DATE</span>
                  <span className="font-bold text-black">
                    {attendee.registeredAt
                      ? new Date(attendee.registeredAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '2026-09-01'}
                  </span>
                </div>
              </div>

              {/* Right Column: Financial & Group Data */}
              <div className="p-4 space-y-3.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">REGISTRATION TYPE</span>
                  <Badge variant={attendee.registrationType === 'EARLY BIRD' ? 'yellow' : 'violet'} size="sm">
                    {attendee.registrationType}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">EXPECTED AMOUNT</span>
                  <span className="font-black text-black">
                    ₱{attendee.expectedAmount || (attendee.registrationType === 'EARLY BIRD' ? 350 : 450)} PHP
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">ACTUAL AMOUNT</span>
                  <span className="font-black text-[#FF6B6B] text-sm">
                    ₱{attendee.actualAmount !== undefined ? attendee.actualAmount : attendee.amount} PHP
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">DATE PAID</span>
                  <span className="font-black text-black">
                    {attendee.datePaid || 'UNPAID'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-black/10">
                  <span className="text-gray-600 font-bold uppercase">PAYMENT STATUS</span>
                  <span className="font-black text-black">
                    {attendee.paymentStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 font-bold uppercase">MYTHICAL CREATURE GROUP</span>
                  <MythicalGroupBadge groupName={attendee.groupAssignment} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="bg-[#FFFDF5] p-4 sm:p-5 border-t-4 border-black flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
          >
            CLOSE
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSelectedNewGroup(attendee.groupAssignment || 'Kapre');
                setIsChangingGroup(true);
              }}
              leftIcon={<Shuffle className="w-4 h-4" />}
            >
              CHANGE GROUP
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => onEditAttendee(attendee)}
              leftIcon={<Edit3 className="w-4 h-4 stroke-[2.5]" />}
            >
              EDIT ATTENDEE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
