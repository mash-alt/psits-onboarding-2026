import React from 'react';
import { MythicalCreatureGroup } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Users, Cpu, Sparkles, Shield, Bookmark, CheckCircle2 } from 'lucide-react';
import { MOCK_ATTENDEES } from '../../data/mockAttendees';

export interface GroupDetailModalProps {
  group: MythicalCreatureGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onViewRoster: (groupName: string) => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  isOpen,
  onClose,
  onViewRoster,
}) => {
  if (!group) return null;

  // Find sample attendees in this group
  const assignedAttendees = MOCK_ATTENDEES.filter(
    (att) => att.groupAssignment?.toLowerCase() === group.name.toLowerCase()
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${group.name} Group`}
      subtitle={`MYTHICAL CREATURE GROUP // ${group.tagline}`}
      badge="OFFICIAL GROUP"
      headerVariant="yellow"
      maxWidth="xl"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            CLOSE DOSSIER
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onClose();
              onViewRoster(group.name);
            }}
            rightIcon={<Users className="w-4 h-4 stroke-[3]" />}
          >
            VIEW GROUP ROSTER
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Banner with Symbol & Color */}
        <div
          className="border-4 border-black p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-[6px_6px_0px_#000000]"
          style={{ backgroundColor: group.color === '#000000' ? '#FFD93D' : group.color }}
        >
          <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000000] shrink-0">
            {group.symbol}
          </div>

          <div className="text-black space-y-1 text-center sm:text-left">
            <span className="font-mono text-xs font-black uppercase tracking-widest bg-black text-[#FFD93D] px-2 py-0.5">
              CREATURE IDENTITY
            </span>
            <h3 className="text-3xl font-black uppercase tracking-tight">{group.name}</h3>
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">
              Element: {group.element}
            </p>
          </div>
        </div>

        {/* Tech Specialty & Role in CCS Acquaintance Party */}
        <div className="bg-[#FFFFFF] border-4 border-black p-4 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-1.5">
            <Cpu className="w-4 h-4" />
            <span>CCS DEPARTMENT & COLLEGE OF COMPUTER STUDIES SPECIALTY</span>
          </div>
          <p className="text-sm font-black uppercase text-black">{group.itSpecialty}</p>
          <p className="text-xs font-bold text-gray-700 uppercase leading-relaxed">
            {group.description}
          </p>
        </div>

        {/* Folklore Origin & Lore */}
        <div className="bg-[#FFFDF5] border-4 border-black p-4 shadow-[4px_4px_0px_#000000] space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-1.5">
            <Bookmark className="w-4 h-4" />
            <span>FILIPINO FOLKLORE HERITAGE</span>
          </div>
          <p className="text-xs font-bold text-gray-800 uppercase leading-relaxed">
            {group.mythLore}
          </p>
        </div>

        {/* Traits Pills */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-black uppercase tracking-wider block">
            GROUP ADVANTAGE TRAITS:
          </span>
          <div className="flex flex-wrap gap-2">
            {group.traits.map((trait) => (
              <Badge key={trait} variant="yellow" size="md">
                ⚡ {trait}
              </Badge>
            ))}
            <Badge variant="violet" size="md">
              AUTHENTIC CREATURE FACTION
            </Badge>
          </div>
        </div>

        {/* Group Roster Status & Sample Members */}
        <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="text-xs font-mono font-black uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>GROUP ROSTER STATUS</span>
            </span>
            <span className="font-mono text-xs font-black bg-black text-[#FFD93D] px-2 py-0.5">
              {group.memberCount} / {group.maxCapacity} ASSIGNED
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold text-gray-600 uppercase">
              CONFIRMED MEMBERS SAMPLE:
            </span>
            {assignedAttendees.length > 0 ? (
              <div className="space-y-1">
                {assignedAttendees.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 bg-[#FFFDF5] border-2 border-black flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                      <span className="font-black uppercase">{att.fullName}</span>
                      <span className="text-gray-500 font-mono">({att.section})</span>
                    </div>
                    <span className="font-mono text-[10px] bg-black text-white px-1.5 py-0.5">
                      {att.yearLevel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-gray-500 uppercase italic">
                Active attendees registered in the database.
              </p>
            )}
          </div>
        </div>

        {/* Group Info Stamp */}
        <div className="p-2.5 bg-black text-[#FFD93D] text-[10px] font-mono font-black uppercase flex justify-between border-2 border-black">
          <span>OFFICIAL GROUP ROSTER</span>
          <span>12 MYTHICAL CREATURE GROUPS</span>
        </div>
      </div>
    </Modal>
  );
};
