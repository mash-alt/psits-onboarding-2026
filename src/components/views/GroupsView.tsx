import React, { useState, useMemo, useEffect } from 'react';
import { MythicalCreatureGroup, AttendeeRegistration } from '../../types';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import {
  getStoredAttendees,
  getStoredMythicalGroups,
  randomizeAllAttendeesAcrossGroups,
  RandomizeGroupsResult,
} from '../../data/eventStore';
import { GroupRosterModal } from '../modals/GroupRosterModal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Users,
  Dices,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

export interface GroupsViewProps {
  onSelectGroup?: (group: MythicalCreatureGroup) => void;
  onNavigateToAttendees?: () => void;
  onNavigateToSpinWheel?: () => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  onSelectGroup,
  onNavigateToAttendees,
  onNavigateToSpinWheel,
}) => {
  const [attendees, setAttendees] = useState<AttendeeRegistration[]>([]);
  const [groups, setGroups] = useState<MythicalCreatureGroup[]>([]);
  const [selectedRosterGroup, setSelectedRosterGroup] = useState<MythicalCreatureGroup | null>(null);
  const [colorFilter, setColorFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Randomize state
  const [isRandomizeModalOpen, setIsRandomizeModalOpen] = useState<boolean>(false);
  const [isRandomizingAnimation, setIsRandomizingAnimation] = useState<boolean>(false);
  const [randomizeResult, setRandomizeResult] = useState<RandomizeGroupsResult | null>(null);

  // Load attendees & groups
  const loadData = () => {
    const loadedAttendees = getStoredAttendees();
    const storedGroups = getStoredMythicalGroups();
    setAttendees(loadedAttendees);
    setGroups(storedGroups);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live member counts and percentages for each of the 12 groups
  const groupStats = useMemo(() => {
    const counts: Record<string, number> = {};
    // initialize all 12 official groups
    OFFICIAL_MYTHICAL_GROUPS.forEach((g) => {
      counts[g.name.toLowerCase()] = 0;
    });

    attendees.forEach((att) => {
      const assigned = (att.groupAssignment || '').toLowerCase();
      // Handle Magkukulam / Mangkukulam mapping
      if (assigned === 'magkukulam' || assigned === 'mangkukulam') {
        counts['magkukulam'] = (counts['magkukulam'] || 0) + 1;
      } else if (counts[assigned] !== undefined) {
        counts[assigned] += 1;
      }
    });

    const total = attendees.length;

    return {
      counts,
      total,
      targetPerGroup: total > 0 ? (total / 12).toFixed(1) : '0',
    };
  }, [attendees]);

  // Execute random group assignment across all 12 groups
  const handleExecuteRandomize = () => {
    setIsRandomizingAnimation(true);

    setTimeout(() => {
      const result = randomizeAllAttendeesAcrossGroups();
      setRandomizeResult(result);
      loadData();
      setIsRandomizingAnimation(false);
    }, 900);
  };

  // Filter groups
  const filteredGroups = useMemo(() => {
    return OFFICIAL_MYTHICAL_GROUPS.filter((g) => {
      const matchesSearch =
        searchFilter.trim() === '' ||
        g.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        g.tagline.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesColor =
        colorFilter === 'ALL' ||
        (colorFilter === 'YELLOW' && g.color === '#FFD93D') ||
        (colorFilter === 'RED' && g.color === '#FF6B6B') ||
        (colorFilter === 'VIOLET' && g.color === '#C4B5FD') ||
        (colorFilter === 'BLACK' && g.color === '#000000') ||
        (colorFilter === 'WHITE' && g.color === '#FFFFFF');

      return matchesSearch && matchesColor;
    });
  }, [searchFilter, colorFilter]);

  const handleGroupCardClick = (group: MythicalCreatureGroup) => {
    setSelectedRosterGroup(group);
    if (onSelectGroup) {
      onSelectGroup(group);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="bg-[#FFFDF5] border-8 border-black p-6 sm:p-8 shadow-[10px_10px_0px_#000000] relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-black text-[#FFD93D] font-mono text-xs px-2.5 py-1 font-black uppercase border-2 border-black">
                PSITS EVENT PROTOCOL
              </span>
              <Badge variant="red" size="sm">
                EXACTLY 12 MYTHICAL GROUPS
              </Badge>
              <Badge variant="black" size="sm">
                CCS DEPARTMENT
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-none">
              MYTHICAL CREATURE{' '}
              <span className="bg-[#FFD93D] px-2 border-4 border-black inline-block -rotate-1 shadow-[4px_4px_0px_#000000]">
                GROUPS
              </span>
            </h1>

            <p className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wide">
              Official faction rosters for the College of Computer Studies (CCS). Every student attendee
              is balanced across the 12 authentic mythical creature groups. Click any group card to inspect
              its roster of student attendees.
            </p>
          </div>

          {/* Randomize Action Station */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setIsRandomizeModalOpen(true)}
              className="px-6 py-4 bg-[#FFD93D] hover:bg-black hover:text-[#FFD93D] text-black font-black uppercase tracking-wider text-sm border-4 border-black shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Dices className="w-5 h-5 stroke-[2.5]" />
              <span>RANDOMIZE GROUPS</span>
            </button>

            {onNavigateToSpinWheel && (
              <button
                onClick={onNavigateToSpinWheel}
                className="px-4 py-2.5 bg-white hover:bg-[#FF6B6B] hover:text-white text-black font-black uppercase tracking-wider text-xs border-3 border-black shadow-[4px_4px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>GO TO SPIN THE WHEEL</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Macro Stats Bar */}
        <div className="mt-8 pt-6 border-t-4 border-black grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0px_#000000]">
            <div className="text-[10px] font-mono font-black text-gray-500 uppercase">
              TOTAL REGISTERED ATTENDEES
            </div>
            <div className="text-2xl font-black font-mono text-black">
              {groupStats.total}
            </div>
          </div>

          <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0px_#000000]">
            <div className="text-[10px] font-mono font-black text-gray-500 uppercase">
              TOTAL CREATURE FACTIONS
            </div>
            <div className="text-2xl font-black font-mono text-black">
              12 GROUPS
            </div>
          </div>

          <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0px_#000000]">
            <div className="text-[10px] font-mono font-black text-gray-500 uppercase">
              BALANCED TARGET RATIO
            </div>
            <div className="text-2xl font-black font-mono text-black">
              ~{groupStats.targetPerGroup} / GROUP
            </div>
          </div>

          <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0px_#000000]">
            <div className="text-[10px] font-mono font-black text-gray-500 uppercase">
              ASSIGNMENT STATUS
            </div>
            <div className="text-sm font-black uppercase text-green-700 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>100% DISTRIBUTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Faction Color Toolbar */}
      <div className="bg-white border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor="groups-search" className="sr-only">Search Mythical Creature Groups</label>
          <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            id="groups-search"
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="FILTER CREATURE NAME OR TRAIT..."
            className="w-full pl-9 pr-3 py-2 bg-[#FFFDF5] text-black border-3 border-black font-mono text-xs uppercase font-bold focus:outline-none focus:bg-[#FFD93D] placeholder-gray-500"
          />
        </div>

        {/* Faction Palette Filter (Yellow, Red, Violet, Black, White) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono font-black uppercase text-gray-700 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>FACTION PALETTE:</span>
          </span>

          <button
            onClick={() => setColorFilter('ALL')}
            className={`px-2.5 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer ${
              colorFilter === 'ALL'
                ? 'bg-black text-[#FFD93D] shadow-[2px_2px_0px_#FFD93D]'
                : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_#000000]'
            }`}
          >
            ALL (12)
          </button>

          <button
            onClick={() => setColorFilter('YELLOW')}
            className={`px-2.5 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'YELLOW'
                ? 'bg-black text-[#FFD93D] shadow-[2px_2px_0px_#FFD93D]'
                : 'bg-[#FFD93D] text-black hover:opacity-90 shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <span className="w-2.5 h-2.5 bg-[#FFD93D] border border-black inline-block"></span>
            <span>YELLOW</span>
          </button>

          <button
            onClick={() => setColorFilter('RED')}
            className={`px-2.5 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'RED'
                ? 'bg-black text-[#FF6B6B] shadow-[2px_2px_0px_#FF6B6B]'
                : 'bg-[#FF6B6B] text-white hover:opacity-90 shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <span className="w-2.5 h-2.5 bg-[#FF6B6B] border border-black inline-block"></span>
            <span>RED</span>
          </button>

          <button
            onClick={() => setColorFilter('VIOLET')}
            className={`px-2.5 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'VIOLET'
                ? 'bg-black text-[#C4B5FD] shadow-[2px_2px_0px_#C4B5FD]'
                : 'bg-[#C4B5FD] text-black hover:opacity-90 shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <span className="w-2.5 h-2.5 bg-[#C4B5FD] border border-black inline-block"></span>
            <span>VIOLET</span>
          </button>

          <button
            onClick={() => setColorFilter('BLACK')}
            className={`px-2.5 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'BLACK'
                ? 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_#000000]'
                : 'bg-black text-white hover:bg-gray-800 shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <span className="w-2.5 h-2.5 bg-black border border-white inline-block"></span>
            <span>BLACK</span>
          </button>

          <button
            onClick={() => setColorFilter('WHITE')}
            className={`px-2.5 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'WHITE'
                ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_#000000]'
            }`}
          >
            <span className="w-2.5 h-2.5 bg-white border border-black inline-block"></span>
            <span>WHITE</span>
          </button>
        </div>
      </div>

      {/* 12 Mythical Creature Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGroups.map((group) => {
          const isDark = group.color === '#000000';
          const memberCount = groupStats.counts[group.name.toLowerCase()] || 0;
          const percentage =
            groupStats.total > 0
              ? ((memberCount / groupStats.total) * 100).toFixed(1)
              : '0.0';

          return (
            <div
              key={group.id}
              onClick={() => handleGroupCardClick(group)}
              className={`
                relative border-4 border-black p-5 flex flex-col justify-between cursor-pointer
                shadow-[6px_6px_0px_#000000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000000]
                active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0px_#000000]
                transition-all select-none group
                ${isDark ? 'bg-[#000000] text-white' : 'bg-[#FFFFFF] text-black'}
              `}
            >
              {/* Top Creature Banner Color Band */}
              <div
                className="h-3.5 -mx-5 -mt-5 mb-4 border-b-4 border-black"
                style={{ backgroundColor: group.color === '#000000' ? '#FFD93D' : group.color }}
              />

              {/* Group Identity Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] font-mono font-black uppercase tracking-widest ${
                        isDark ? 'text-[#FFD93D]' : 'text-gray-600'
                      }`}
                    >
                      MYTHICAL GROUP
                    </span>
                    <h2
                      className={`text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mt-0.5 ${
                        isDark ? 'text-white' : 'text-black'
                      }`}
                    >
                      {group.name}
                    </h2>
                  </div>

                  {/* Faction Symbol Box */}
                  <div
                    className={`
                      w-12 h-12 border-3 border-black flex items-center justify-center text-2xl shrink-0
                      shadow-[3px_3px_0px_#000000] group-hover:rotate-6 transition-transform
                      ${isDark ? 'bg-zinc-800 text-white' : 'bg-[#FFFDF5] text-black'}
                    `}
                  >
                    {group.symbol}
                  </div>
                </div>

                {/* Tagline / Faction Lore */}
                <p
                  className={`text-xs font-mono font-bold uppercase tracking-tight line-clamp-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {group.tagline}
                </p>

                {/* REQUIRED STATS: Member Count & Percentage of Attendees */}
                <div
                  className={`
                    p-3 border-3 border-black space-y-2
                    ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-[#FFFDF5]'}
                  `}
                >
                  <div className="flex items-center justify-between font-mono text-xs font-black">
                    <span className="uppercase text-gray-500">MEMBER COUNT</span>
                    <span className={`text-lg font-black ${isDark ? 'text-[#FFD93D]' : 'text-black'}`}>
                      {memberCount} MEMBERS
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs font-black">
                    <span className="uppercase text-gray-500">ATTENDEE SHARE</span>
                    <span
                      className={`px-1.5 py-0.5 border border-black font-mono font-black text-xs ${
                        isDark ? 'bg-[#FFD93D] text-black' : 'bg-black text-[#FFD93D]'
                      }`}
                    >
                      {percentage}% OF TOTAL
                    </span>
                  </div>

                  {/* Visual Proportion Bar */}
                  <div className="w-full bg-gray-200 border-2 border-black h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B6B] transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(5, parseFloat(percentage) * 8))}%`,
                        backgroundColor: group.color === '#000000' ? '#FFD93D' : group.color,
                      }}
                    />
                  </div>
                </div>

                {/* Specialty Pill */}
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase truncate">
                  <span className="text-gray-500">SPECIALTY:</span>
                  <span className={`truncate font-mono ${isDark ? 'text-gray-300' : 'text-black'}`}>
                    {group.itSpecialty}
                  </span>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div
                className={`
                  mt-5 pt-3 border-t-2 flex items-center justify-between text-xs font-mono font-black uppercase
                  ${isDark ? 'border-zinc-800 text-[#FFD93D]' : 'border-black text-black'}
                `}
              >
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>VIEW ROSTER</span>
                </span>
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* RANDOMIZE GROUPS CONFIRMATION & EXECUTION MODAL */}
      {isRandomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border-8 border-black p-6 sm:p-8 shadow-[12px_12px_0px_#000000] space-y-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 border-b-4 border-black pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-black text-[#FFD93D] font-mono text-[10px] font-black uppercase px-2 py-0.5">
                    ADMIN & OFFICER COMMAND
                  </span>
                  <Badge variant="red" size="sm">
                    AUTOMATIC DISTRIBUTION
                  </Badge>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight text-black mt-1">
                  RANDOMIZE GROUPS
                </h3>
              </div>

              <button
                onClick={() => {
                  if (!isRandomizingAnimation) {
                    setIsRandomizeModalOpen(false);
                    setRandomizeResult(null);
                  }
                }}
                disabled={isRandomizingAnimation}
                className="w-8 h-8 bg-black text-white hover:bg-[#FF6B6B] border-2 border-black flex items-center justify-center font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Protocol Specifications */}
            <div className="bg-[#FFFDF5] border-4 border-black p-4 space-y-3 font-mono text-xs">
              <div className="font-black text-sm uppercase text-black flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>MANDATORY RANDOMIZATION SPECIFICATIONS:</span>
              </div>
              <ul className="space-y-1.5 text-gray-800 list-disc list-inside font-bold uppercase">
                <li>Random distribution across all {groupStats.total} registered attendees</li>
                <li>Balanced group sizes (maximum deviation: ±1 student per group)</li>
                <li>All eligible attendees assigned to exactly one mythical group</li>
                <li>No duplicate assignments or unassigned attendees</li>
                <li>Persistent storage: records updated in local event storage</li>
                <li>No student manually selects or overrides their creature group</li>
              </ul>
            </div>

            {/* Live Progress or Result Notice */}
            {isRandomizingAnimation ? (
              <div className="p-6 bg-black text-[#FFD93D] border-4 border-black text-center space-y-3">
                <Dices className="w-10 h-10 mx-auto animate-spin" />
                <div className="font-black text-lg uppercase tracking-wider">
                  SHUFFLING ATTENDEES ACROSS 12 GROUPS...
                </div>
                <div className="font-mono text-xs text-white">
                  Executing Fisher-Yates shuffle and balanced round-robin allocation
                </div>
              </div>
            ) : randomizeResult ? (
              <div className="p-4 bg-green-100 border-4 border-black space-y-2">
                <div className="flex items-center gap-2 text-green-900 font-black uppercase text-sm">
                  <CheckCircle2 className="w-5 h-5 stroke-[3] text-green-700" />
                  <span>SUCCESSFULLY RANDOMIZED {randomizeResult.totalAssigned} ATTENDEES!</span>
                </div>
                <p className="text-xs font-bold text-green-800 uppercase">
                  All 12 Mythical Creature Groups are now balanced with approximately{' '}
                  {Math.floor(randomizeResult.totalAssigned / 12)}–
                  {Math.ceil(randomizeResult.totalAssigned / 12)} attendees each.
                </p>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsRandomizeModalOpen(false);
                  setRandomizeResult(null);
                }}
                disabled={isRandomizingAnimation}
              >
                {randomizeResult ? 'CLOSE WINDOW' : 'CANCEL'}
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleExecuteRandomize}
                disabled={isRandomizingAnimation}
                leftIcon={<Dices className="w-4 h-4 stroke-[3]" />}
              >
                {randomizeResult ? 'RE-RANDOMIZE ALL GROUPS' : 'CONFIRM & RANDOMIZE NOW'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GROUP ROSTER MODAL */}
      <GroupRosterModal
        group={selectedRosterGroup}
        isOpen={Boolean(selectedRosterGroup)}
        onClose={() => setSelectedRosterGroup(null)}
        totalEventAttendees={groupStats.total}
      />
    </div>
  );
};
