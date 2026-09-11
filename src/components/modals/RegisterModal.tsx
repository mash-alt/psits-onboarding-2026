import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, User, Hash, School, Sparkles, ArrowRight } from 'lucide-react';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { studentId: string; fullName: string; yearLevel: string; section: string }) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [yearLevel, setYearLevel] = useState('1st Year');
  const [section, setSection] = useState('BSIT-1A');
  const [submitted, setSubmitted] = useState(false);
  const [assignedGroupPreview, setAssignedGroupPreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !fullName) return;

    // Pick a preview group from the 12 Mythical Creature Groups
    const randomGroup =
      OFFICIAL_MYTHICAL_GROUPS[Math.floor(Math.random() * OFFICIAL_MYTHICAL_GROUPS.length)].name;
    setAssignedGroupPreview(randomGroup);
    setSubmitted(true);

    if (onSuccess) {
      onSuccess({ studentId, fullName, yearLevel, section });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setStudentId('');
    setFullName('');
    setAssignedGroupPreview(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={submitted ? 'REGISTRATION CONFIRMED' : 'ATTENDEE REGISTRATION'}
      subtitle={
        submitted
          ? 'PROVISIONAL TICKET ISSUED // PHASE 1 PREVIEW'
          : 'ONBOARDING TO PSITS ACQUAINTANCE PARTY 2026'
      }
      badge={submitted ? 'CONFIRMED' : 'PORTAL'}
      headerVariant={submitted ? 'yellow' : 'hazard'}
      maxWidth="lg"
    >
      {submitted ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-20 h-20 mx-auto bg-[#FFD93D] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_#000000] rotate-2">
            <CheckCircle2 className="w-12 h-12 text-black stroke-[3]" />
          </div>

          <div className="space-y-2">
            <span className="bg-black text-[#FFD93D] font-mono text-xs px-3 py-1 font-black uppercase border border-black">
              ATTENDEE ID: {studentId}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              WELCOME TO THE PARTY, {fullName}!
            </h3>
            <p className="text-sm font-bold text-gray-700 uppercase max-w-md mx-auto">
              Your registration request has been queued in the system. In the official event, you will be
              randomly assigned to one of the 12 Mythical Creature Groups.
            </p>
          </div>

          {/* Group Assignment Teaser Card */}
          <div className="border-4 border-black bg-[#FFFFFF] p-5 shadow-[6px_6px_0px_#000000] text-left max-w-md mx-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-[11px] font-mono font-black uppercase text-gray-600">
                PROVISIONAL GROUP ASSIGNMENT
              </span>
              <Badge variant="violet" size="sm">
                RANDOMIZED PREVIEW
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FFD93D] border-3 border-black flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_#000000]">
                ⚡
              </div>
              <div>
                <span className="text-xs font-mono font-black text-black">MYTHICAL CREATURE GROUP:</span>
                <div className="text-2xl font-black uppercase tracking-tight text-black">
                  {assignedGroupPreview}
                </div>
              </div>
            </div>

            <p className="text-[11px] font-bold text-gray-600 uppercase mt-3 pt-2 border-t border-black/20">
              *Full database synchronization and finalized group verification will be powered by Firebase in Phase 2.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="dark" size="lg" onClick={handleReset}>
              CLOSE & RETURN TO HOME
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-3 bg-[#FFFDF5] border-3 border-black text-xs font-bold uppercase space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-600">
              <span className="w-2 h-2 bg-[#FF6B6B] inline-block"></span>
              <span>FIRESTORE REGISTRATION PORTAL</span>
            </div>
            <p className="text-black font-black">
              Enter the attendee's official information to create a verified registration record.
            </p>
          </div>

          <Input
            label="STUDENT ID NUMBER"
            placeholder="e.g. 84920194"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            helperText="OFFICIAL 8-DIGIT UNIVERSITY ID ISSUED BY REGISTRAR"
            leftIcon={<Hash className="w-4 h-4 stroke-[2.5]" />}
          />

          <Input
            label="FULL LEGAL NAME"
            placeholder="e.g. Juan De La Cruz"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            helperText="FIRST NAME, MIDDLE INITIAL, SURNAME"
            leftIcon={<User className="w-4 h-4 stroke-[2.5]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="YEAR LEVEL"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              options={[
                { value: '1st Year', label: '1ST YEAR — FRESHMEN' },
                { value: '2nd Year', label: '2ND YEAR — SOPHOMORES' },
                { value: '3rd Year', label: '3RD YEAR — JUNIORS' },
                { value: '4th Year', label: '4TH YEAR — SENIORS' },
              ]}
            />

            <Select
              label="SECTION / BLOCK"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              options={[
                { value: 'BSIT-1A', label: 'BSIT-1A (INFO TECH)' },
                { value: 'BSIT-2A', label: 'BSIT-2A (INFO TECH)' },
                { value: 'BSIT-3A', label: 'BSIT-3A (INFO TECH)' },
                { value: 'BSIT-4A', label: 'BSIT-4A (INFO TECH)' },
                { value: 'BSCS-1A', label: 'BSCS-1A (COMPUTER SCIENCE)' },
                { value: 'BSCS-2A', label: 'BSCS-2A (COMPUTER SCIENCE)' },
                { value: 'BSCS-3A', label: 'BSCS-3A (COMPUTER SCIENCE)' },
                { value: 'BSCS-4A', label: 'BSCS-4A (COMPUTER SCIENCE)' },
                { value: 'BSIS-1A', label: 'BSIS-1A (INFO SYSTEMS)' },
                { value: 'BSIS-2A', label: 'BSIS-2A (INFO SYSTEMS)' },
              ]}
            />
          </div>

          {/* Group Assignment Explanation */}
          <div className="border-3 border-black p-3 bg-[#FFFFFF] space-y-1">
            <span className="text-[11px] font-mono font-black uppercase text-[#FF6B6B]">
              GROUP ASSIGNMENT DISCLOSURE:
            </span>
            <p className="text-xs font-bold text-gray-700 uppercase">
              You will be assigned to 1 of 12 Mythical Creature Groups (Kapre, Sigbin, Aswang, Tikbalang,
              Chanak, Shokoy, Manananggal, Duwende, Mangkukulam, Sirena, Diwata, or Otlum).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
            >
              CONFIRM REGISTRATION →
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={handleReset}>
              CANCEL
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
