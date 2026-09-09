import React, { useState, useEffect } from 'react';
import { EventConfig, RegistrationStatus, UserRole } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { PriceConfirmModal } from './PriceConfirmModal';
import {
  Settings,
  Calendar,
  DollarSign,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export interface EventSettingsViewProps {
  currentConfig: EventConfig;
  currentUserRole: UserRole;
  totalHistoricalAttendees: number;
  onSaveConfig: (newConfig: EventConfig) => void;
}

export const EventSettingsView: React.FC<EventSettingsViewProps> = ({
  currentConfig,
  currentUserRole,
  totalHistoricalAttendees,
  onSaveConfig,
}) => {
  const [eventName, setEventName] = useState(currentConfig.eventName);
  const [tagline, setTagline] = useState(currentConfig.tagline || '');
  const [eventDate, setEventDate] = useState(currentConfig.eventDate);
  const [registrationOpeningDate, setRegistrationOpeningDate] = useState(
    currentConfig.registrationOpeningDate || '2026-08-20'
  );
  const [registrationClosingDate, setRegistrationClosingDate] = useState(
    currentConfig.registrationClosingDate || '2026-10-20'
  );
  const [earlyBirdFee, setEarlyBirdFee] = useState<number>(currentConfig.earlyBirdFee);
  const [regularFee, setRegularFee] = useState<number>(currentConfig.regularFee);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(
    currentConfig.registrationStatus || 'OPEN'
  );
  const [currency, setCurrency] = useState(currentConfig.currency || 'PHP');
  const [savedToast, setSavedToast] = useState(false);
  const [isConfirmPriceModalOpen, setIsConfirmPriceModalOpen] = useState(false);

  useEffect(() => {
    setEventName(currentConfig.eventName);
    setTagline(currentConfig.tagline || '');
    setEventDate(currentConfig.eventDate);
    setRegistrationOpeningDate(currentConfig.registrationOpeningDate || '2026-08-20');
    setRegistrationClosingDate(currentConfig.registrationClosingDate || '2026-10-20');
    setEarlyBirdFee(currentConfig.earlyBirdFee);
    setRegularFee(currentConfig.regularFee);
    setRegistrationStatus(currentConfig.registrationStatus || 'OPEN');
    setCurrency(currentConfig.currency || 'PHP');
  }, [currentConfig]);

  const isAdmin = currentUserRole === 'ADMIN';

  const hasPriceChanged =
    earlyBirdFee !== currentConfig.earlyBirdFee || regularFee !== currentConfig.regularFee;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (hasPriceChanged) {
      // Require explicit price confirmation
      setIsConfirmPriceModalOpen(true);
    } else {
      commitSave();
    }
  };

  const commitSave = () => {
    const updated: EventConfig = {
      ...currentConfig,
      eventName: eventName.trim(),
      tagline: tagline.trim(),
      eventDate,
      registrationOpeningDate,
      registrationClosingDate,
      earlyBirdFee: Number(earlyBirdFee),
      regularFee: Number(regularFee),
      registrationStatus,
      currency,
    };
    onSaveConfig(updated);
    setIsConfirmPriceModalOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border-4 border-black p-5 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase bg-black text-[#FFD93D] px-2 py-0.5 border border-black">
              CONFIGURATION
            </span>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase">
              EVENT PARAMETERS & PRICE LEDGER
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase text-black tracking-tight">
            EVENT SETTINGS & PRICING
          </h2>
          <p className="text-xs font-mono font-bold text-gray-600 mt-1">
            Configure system schedule, brand messaging, pricing tiers, and global registration availability.
          </p>
        </div>

        {savedToast && (
          <div className="p-3 bg-[#10B981] text-black border-2 border-black font-mono font-black text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000000] animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>EVENT SETTINGS SUCCESSFULLY UPDATED</span>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 bg-[#FFD93D] border-4 border-black font-mono text-xs font-bold text-black flex items-start gap-3 shadow-[4px_4px_0px_#000000]">
          <Lock className="w-5 h-5 stroke-[3] shrink-0 text-black mt-0.5" />
          <div>
            <div className="font-black uppercase text-sm">READ-ONLY CONFIGURATION VIEW</div>
            <p className="mt-1">
              Officers can inspect active parameters, fee structures, and registration windows, but administrative privilege is required to commit changes.
            </p>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Section 1: Event Identity */}
        <div className="bg-[#FFFFFF] border-4 border-black shadow-[6px_6px_0px_#000000]">
          <div className="bg-black text-[#FFD93D] p-3 border-b-2 border-black font-mono text-xs font-black uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>EVENT BRANDING & IDENTITY</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="OFFICIAL EVENT NAME"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                disabled={!isAdmin}
                required
                helperText="DISPLAYS ACROSS PORTAL HEADERS, BADGES, AND NOTIFICATIONS"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="EVENT TAGLINE / MOTTO"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                disabled={!isAdmin}
                helperText="SECONDARY MARQUEE AND BANNER SLOGAN"
              />
            </div>

            <Input
              label="COLLEGE / ACADEMIC UNIT"
              value={currentConfig.college}
              disabled
              helperText="FIXED ATTRIBUTE (COLLEGE OF COMPUTER STUDIES)"
            />

            <Input
              label="ORGANIZING DEPARTMENT"
              value={currentConfig.department}
              disabled
              helperText="FIXED ATTRIBUTE (CCS DEPARTMENT)"
            />
          </div>
        </div>

        {/* Section 2: Schedules & Registration Windows */}
        <div className="bg-[#FFFFFF] border-4 border-black shadow-[6px_6px_0px_#000000]">
          <div className="bg-black text-[#FFD93D] p-3 border-b-2 border-black font-mono text-xs font-black uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>CALENDAR SCHEDULE & REGISTRATION WINDOWS</span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="EVENT GATHERING DATE"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={!isAdmin}
              required
              helperText="MAIN ACQUAINTANCE PARTY DATE"
            />

            <Input
              label="REGISTRATION OPENING DATE"
              type="date"
              value={registrationOpeningDate}
              onChange={(e) => setRegistrationOpeningDate(e.target.value)}
              disabled={!isAdmin}
              required
              helperText="PORTAL ACCEPTS NEW REGISTRATIONS"
            />

            <Input
              label="REGISTRATION CLOSING DATE"
              type="date"
              value={registrationClosingDate}
              onChange={(e) => setRegistrationClosingDate(e.target.value)}
              disabled={!isAdmin}
              required
              helperText="PORTAL LOCKS FURTHER SUBMISSIONS"
            />

            <div className="sm:col-span-3">
              <Select
                label="GLOBAL REGISTRATION STATUS"
                value={registrationStatus}
                onChange={(e) =>
                  setRegistrationStatus(e.target.value as RegistrationStatus)
                }
                disabled={!isAdmin}
                options={[
                  { value: 'UPCOMING', label: 'UPCOMING (ANNOUNCED / REGISTRATION NOT YET STARTED)' },
                  { value: 'OPEN', label: 'OPEN (ACTIVE REGISTRATION IN PROGRESS)' },
                  { value: 'CLOSED', label: 'CLOSED (REGISTRATION TERMINATED)' },
                ]}
                helperText="CONTROLS THE VISIBILITY AND SUBMISSION STATUS OF ATTENDEE REGISTRATION FORMS"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Price Management & Tier Settings */}
        <div className="bg-[#FFFFFF] border-4 border-black shadow-[6px_6px_0px_#000000]">
          <div className="bg-black text-[#FFD93D] p-3 border-b-2 border-black font-mono text-xs font-black uppercase flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>REGISTRATION PRICING STRUCTURE (PRICE MANAGEMENT)</span>
            </div>
            <span className="bg-[#FFD93D] text-black px-2 py-0.5 text-[10px]">
              {currency} CURRENCY
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-3.5 bg-[#FFFDF5] border-2 border-black font-mono text-xs font-bold text-gray-700 leading-relaxed">
              <strong className="text-black uppercase">Historical Protection Guarantee:</strong> Changing Early Bird or Regular pricing will apply strictly to <em>future attendee registrations</em>. The stored expected and actual fees on existing records ({totalHistoricalAttendees} attendees) are permanently preserved and will not be altered.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-black bg-[#FFFDF5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    EARLY BIRD TIER
                  </span>
                  <span className="bg-[#FFD93D] text-black text-[10px] font-mono font-black px-1.5 py-0.5 border border-black">
                    PROMOTIONAL RATE
                  </span>
                </div>
                <Input
                  label="EARLY BIRD FEE (PHP)"
                  type="number"
                  value={String(earlyBirdFee)}
                  onChange={(e) => setEarlyBirdFee(Number(e.target.value))}
                  disabled={!isAdmin}
                  required
                />
                <p className="text-[11px] font-mono text-gray-600 font-bold">
                  Assigned when attendees register under the Early Bird campaign.
                </p>
              </div>

              <div className="p-4 border-2 border-black bg-[#FFFDF5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    REGULAR TIER
                  </span>
                  <span className="bg-[#C4B5FD] text-black text-[10px] font-mono font-black px-1.5 py-0.5 border border-black">
                    STANDARD RATE
                  </span>
                </div>
                <Input
                  label="REGULAR FEE (PHP)"
                  type="number"
                  value={String(regularFee)}
                  onChange={(e) => setRegularFee(Number(e.target.value))}
                  disabled={!isAdmin}
                  required
                />
                <p className="text-[11px] font-mono text-gray-600 font-bold">
                  Standard attendee fee applied after promotional cutoff.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions (Only enabled for Admins) */}
        {isAdmin && (
          <div className="bg-[#FFFDF5] border-4 border-black p-4 shadow-[4px_4px_0px_#000000] flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-gray-600">
              {hasPriceChanged ? (
                <span className="text-[#FF6B6B] font-black uppercase">
                  PRICE CHANGE DETECTED &bull; CONFIRMATION REQUIRED BEFORE SAVING
                </span>
              ) : (
                'ALL PARAMETERS READY FOR PERSISTENCE'
              )}
            </span>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              leftIcon={<Save className="w-5 h-5 stroke-[2.5]" />}
            >
              SAVE EVENT SETTINGS
            </Button>
          </div>
        )}
      </form>

      {/* Price Change Explicit Confirmation Modal */}
      <PriceConfirmModal
        isOpen={isConfirmPriceModalOpen}
        onClose={() => setIsConfirmPriceModalOpen(false)}
        onConfirm={commitSave}
        oldEarlyBird={currentConfig.earlyBirdFee}
        newEarlyBird={earlyBirdFee}
        oldRegular={currentConfig.regularFee}
        newRegular={regularFee}
        currency={currency}
        totalHistoricalAttendees={totalHistoricalAttendees}
      />
    </div>
  );
};
