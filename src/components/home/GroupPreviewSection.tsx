import React from 'react';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import { MythicalCreatureGroup } from '../../types';
import { Badge } from '../ui/Badge';
import { Users, Cpu, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface GroupPreviewSectionProps {
  onSelectGroup: (group: MythicalCreatureGroup) => void;
}

export const GroupPreviewSection: React.FC<GroupPreviewSectionProps> = ({ onSelectGroup }) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    return (
      <section id="mythical-groups" className="w-full py-8 bg-[#C0C0C0] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Windows 95 Directory Header */}
          <div className="bg-[#C0C0C0] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000] p-1 mb-6">
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 font-bold text-xs flex items-center justify-between">
              <span>MYTHICAL CREATURE GROUPS DATABASE (12 RECORDS)</span>
              <span className="text-[10px] font-mono">[TABLE: GROUPS_V1]</span>
            </div>
            <div className="bg-[#FFFFFF] p-3 text-xs text-black border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="font-bold">
                Official faction list for the College of Computer Studies (CCS). Click any entry to inspect the group profile and attendee roster.
              </p>
              <div className="bg-[#E8E8E8] px-2 py-1 border border-[#808080] text-[11px] font-mono shrink-0">
                TOTAL: 12 FACTIONS
              </div>
            </div>
          </div>

          {/* 12 Mythical Creature Groups Grid (Windows Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {OFFICIAL_MYTHICAL_GROUPS.map((group) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="bg-[#C0C0C0] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000] shadow-[inset_1px_1px_0px_#DFDFDF,inset_-1px_-1px_0px_#808080] p-1 cursor-pointer hover:bg-[#D4D4D4] active:border-t-black active:border-l-black active:border-r-white active:border-b-white transition-none"
              >
                {/* Titlebar */}
                <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 font-bold text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 bg-[#FFFF00] border border-black inline-block"></span>
                    <span className="truncate">{group.name}</span>
                  </div>
                  <span className="text-sm shrink-0">{group.symbol}</span>
                </div>

                {/* Content Box */}
                <div className="bg-[#FFFFFF] p-3 border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF] text-black text-xs space-y-2 mt-1">
                  <div className="bg-[#E8E8E8] px-1.5 py-0.5 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-[10px] font-mono font-bold text-[#000080] truncate">
                    ROLE: {group.itSpecialty}
                  </div>

                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-tight">
                    {group.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E8E8E8] text-[10px] font-bold">
                    <span className="text-gray-600 font-mono">
                      ROSTER: {group.memberCount}/{group.maxCapacity}
                    </span>
                    <span className="text-[#0000FF] underline">
                      DETAILS ▶
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Neo-Brutalist default
  return (
    <section id="mythical-groups" className="w-full py-16 bg-[#FFFDF5] border-t-8 border-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-black text-[#FFD93D] font-mono text-xs px-2.5 py-1 font-black uppercase border-2 border-black">
                OFFICIAL ROSTERS
              </span>
              <Badge variant="red" size="sm" tilt="left">
                12 MYTHICAL CREATURE GROUPS
              </Badge>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
              MYTHICAL CREATURE{' '}
              <span className="bg-[#FFD93D] px-2 border-4 border-black inline-block -rotate-1 shadow-[4px_4px_0px_#000000]">
                GROUPS
              </span>
            </h2>

            <p className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-wide">
              Every CCS attendee is organized into one of the 12 mythical creature groups. The creature name
              is the authentic group identity across all event activities and competitions.
            </p>
          </div>

          {/* Quick Notice Stamp */}
          <div className="p-4 bg-[#FFFFFF] border-4 border-black shadow-[6px_6px_0px_#000000] shrink-0 text-left max-w-xs">
            <div className="text-[10px] font-mono font-black text-gray-500 uppercase">
              ASSIGNMENT PROTOCOL
            </div>
            <div className="text-sm font-black uppercase text-black mt-1">
              BALANCED RANDOMIZER READY
            </div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              Target: ~38 Attendees per Group
            </div>
          </div>
        </div>

        {/* 12 Mythical Creature Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {OFFICIAL_MYTHICAL_GROUPS.map((group) => {
            const isDark = group.color === '#000000';

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
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
                  className="h-3 -mx-5 -mt-5 mb-4 border-b-4 border-black"
                  style={{ backgroundColor: group.color === '#000000' ? '#FFD93D' : group.color }}
                />

                {/* Group Title & Identity */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-mono font-black uppercase tracking-widest ${
                          isDark ? 'text-[#FFD93D]' : 'text-gray-600'
                        }`}
                      >
                        MYTHICAL GROUP
                      </span>
                      <h3
                        className={`text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none ${
                          isDark ? 'text-white' : 'text-black'
                        }`}
                      >
                        {group.name}
                      </h3>
                    </div>

                    <div
                      className="w-11 h-11 shrink-0 border-3 border-black flex items-center justify-center text-xl shadow-[3px_3px_0px_#000000]"
                      style={{
                        backgroundColor: group.color === '#000000' ? '#FFD93D' : group.color,
                        color: '#000000',
                      }}
                    >
                      {group.symbol}
                    </div>
                  </div>

                  {/* IT Tech Role Specialty */}
                  <div
                    className={`text-[11px] font-mono font-black uppercase px-2 py-1 border-2 border-black tracking-wider ${
                      isDark ? 'bg-[#1a1a1a] text-[#FFD93D]' : 'bg-[#FFFDF5] text-black'
                    }`}
                  >
                    <Cpu className="w-3 h-3 inline mr-1" />
                    {group.itSpecialty}
                  </div>

                  {/* Description */}
                  <p
                    className={`text-xs font-bold leading-relaxed line-clamp-2 uppercase ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {group.description}
                  </p>
                </div>

                {/* Traits Pills */}
                <div className="flex flex-wrap gap-1 my-4">
                  {group.traits.map((trait) => (
                    <span
                      key={trait}
                      className={`text-[10px] font-black uppercase px-1.5 py-0.5 border border-black ${
                        isDark ? 'bg-white text-black' : 'bg-[#FFFDF5] text-black'
                      }`}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Bottom Roster Stats & Action */}
                <div
                  className={`pt-3 border-t-3 border-black flex items-center justify-between text-xs font-black uppercase ${
                    isDark ? 'text-white' : 'text-black'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {group.memberCount} / {group.maxCapacity} ROSTER
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-black text-[#FF6B6B] group-hover:translate-x-1 transition-transform">
                    VIEW DETAILS →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Notice */}
        <div className="mt-12 p-6 bg-black text-[#FFD93D] border-4 border-black shadow-[8px_8px_0px_#FFD93D] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD93D] text-black font-black flex items-center justify-center border-2 border-black text-lg">
              !
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                OFFICIAL 12 MYTHICAL CREATURE GROUPS
              </h4>
              <p className="text-xs font-bold text-gray-300 uppercase">
                All activities, chants, scores, and attendee rosters are organized strictly under these 12
                official Mythical Creature Groups.
              </p>
            </div>
          </div>

          <div className="bg-[#FF6B6B] text-black font-black text-xs uppercase px-4 py-2 border-3 border-black shadow-[3px_3px_0px_#000000]">
            PSITS CONST. SEC 12
          </div>
        </div>
      </div>
    </section>
  );
};
