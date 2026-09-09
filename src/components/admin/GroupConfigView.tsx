import React, { useState, useEffect } from 'react';
import { MythicalCreatureGroup, UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MythicalGroupBadge } from '../ui/MythicalGroupBadge';
import {
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Eye,
  Check,
  X,
  Palette,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export interface GroupConfigViewProps {
  groups: MythicalCreatureGroup[];
  currentUserRole: UserRole;
  onUpdateGroup: (
    groupId: string,
    updates: { displayName?: string; color?: string; isActive?: boolean }
  ) => void;
  onResetDefaults: () => void;
}

const COLOR_PRESETS = [
  '#FFD93D', // Yellow
  '#FF6B6B', // Red
  '#C4B5FD', // Violet
  '#FFFDF5', // Cream
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#FB7185', // Rose
  '#8B5CF6', // Purple
  '#FBBF24', // Ochre
  '#38BDF8', // Sky Blue
  '#E879F9', // Fuchsia
  '#FB923C', // Orange
];

export const GroupConfigView: React.FC<GroupConfigViewProps> = ({
  groups,
  currentUserRole,
  onUpdateGroup,
  onResetDefaults,
}) => {
  const [localGroups, setLocalGroups] = useState<MythicalCreatureGroup[]>(groups);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  const isAdmin = currentUserRole === 'ADMIN';

  const handleDisplayNameChange = (id: string, val: string) => {
    setLocalGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, displayName: val } : g))
    );
  };

  const handleColorChange = (id: string, color: string) => {
    setLocalGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, color } : g))
    );
  };

  const handleToggleActive = (id: string) => {
    setLocalGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: g.isActive === false ? true : false } : g))
    );
  };

  const handleSaveIndividualGroup = (group: MythicalCreatureGroup) => {
    onUpdateGroup(group.id, {
      displayName: group.displayName,
      color: group.color,
      isActive: group.isActive !== false,
    });
    setSavedSuccess(`UPDATED ${group.name.toUpperCase()} GROUP CONFIGURATION`);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const handleSaveAll = () => {
    localGroups.forEach((g) => {
      onUpdateGroup(g.id, {
        displayName: g.displayName,
        color: g.color,
        isActive: g.isActive !== false,
      });
    });
    setSavedSuccess('ALL 12 MYTHICAL CREATURE GROUP CONFIGURATIONS SAVED');
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border-4 border-black p-5 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase bg-black text-[#FFD93D] px-2 py-0.5 border border-black">
              CREATURE FACTIONS
            </span>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase">
              12 OFFICIAL MYTHICAL CREATURE GROUPS
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase text-black tracking-tight">
            MYTHICAL CREATURE GROUP CONFIGURATION
          </h2>
          <p className="text-xs font-mono font-bold text-gray-600 mt-1">
            Admins may adjust display names, hex color themes, and toggle allocation availability. Exactly 12 official groups are preserved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={onResetDefaults}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                title="Reset all 12 groups to default names and colors"
              >
                RESET DEFAULTS
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveAll}
                leftIcon={<Save className="w-4 h-4 stroke-[2.5]" />}
              >
                SAVE ALL 12 GROUPS
              </Button>
            </>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-[#10B981] text-black border-4 border-black font-mono font-black text-xs flex items-center gap-2 shadow-[4px_4px_0px_#000000] animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {!isAdmin && (
        <div className="p-4 bg-[#FFD93D] border-4 border-black font-mono text-xs font-bold text-black flex items-start gap-3 shadow-[4px_4px_0px_#000000]">
          <Lock className="w-5 h-5 stroke-[3] shrink-0 text-black mt-0.5" />
          <div>
            <div className="font-black uppercase text-sm">OFFICER GROUP ROSTER INSPECTION</div>
            <p className="mt-1">
              Officers can inspect the 12 Mythical Creature Groups and their assigned member capacities, but modifying group display names, colors, or allocation statuses is reserved for System Admins.
            </p>
          </div>
        </div>
      )}

      {/* Grid of 12 Mythical Creature Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {localGroups.map((group) => {
          const isActive = group.isActive !== false;
          const isModified =
            group.displayName !== group.name || group.color !== group.color;

          return (
            <div
              key={group.id}
              className={`bg-white border-4 border-black shadow-[6px_6px_0px_#000000] flex flex-col justify-between overflow-hidden transition-all ${
                !isActive ? 'opacity-65 bg-gray-50' : ''
              }`}
            >
              {/* Group Card Header */}
              <div
                className="p-4 border-b-4 border-black flex items-center justify-between"
                style={{ backgroundColor: group.color }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl select-none">{group.symbol}</span>
                  <div>
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-black text-[#FFFDF5] px-1.5 py-0.5 block w-fit">
                      OFFICIAL GROUP
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-black mt-0.5">
                      {group.name}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {isActive ? (
                    <span className="bg-[#10B981] text-black font-mono font-black text-[10px] px-2 py-0.5 border-2 border-black shadow-[1px_1px_0px_#000000]">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="bg-gray-400 text-black font-mono font-black text-[10px] px-2 py-0.5 border-2 border-black shadow-[1px_1px_0px_#000000]">
                      PAUSED
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold text-black/80 mt-1">
                    {group.memberCount} MEMBERS
                  </span>
                </div>
              </div>

              {/* Group Configuration Controls */}
              <div className="p-4 space-y-3 font-mono text-xs flex-1">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                    DISPLAY NAME (CUSTOMIZABLE)
                  </label>
                  <input
                    type="text"
                    value={group.displayName || group.name}
                    onChange={(e) => handleDisplayNameChange(group.id, e.target.value)}
                    disabled={!isAdmin}
                    className="w-full bg-[#FFFDF5] border-2 border-black px-2.5 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] focus:outline-none focus:bg-white disabled:bg-gray-100"
                  />
                </div>

                {/* Color Palette Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase text-gray-700">
                      FACTION COLOR
                    </label>
                    <span className="font-bold text-[10px] text-black">{group.color}</span>
                  </div>

                  {isAdmin ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorChange(group.id, c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 border-2 border-black shadow-[1px_1px_0px_#000000] cursor-pointer transition-transform ${
                            group.color.toLowerCase() === c.toLowerCase()
                              ? 'scale-120 ring-2 ring-black z-10'
                              : 'hover:scale-110'
                          }`}
                          title={c}
                        />
                      ))}
                      <input
                        type="color"
                        value={group.color}
                        onChange={(e) => handleColorChange(group.id, e.target.value)}
                        className="w-6 h-6 border-2 border-black cursor-pointer p-0"
                        title="Custom Color Picker"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 border-2 border-black"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-mono text-xs">{group.color}</span>
                    </div>
                  )}
                </div>

                {/* Lore and IT Specialty Metadata */}
                <div className="p-2 bg-[#FFFDF5] border border-black/30 text-[11px] text-gray-700 space-y-1">
                  <div className="font-bold text-black">
                    <strong>IT Track:</strong> {group.itSpecialty}
                  </div>
                  <div className="italic line-clamp-2 text-gray-600 font-sans text-xs">
                    "{group.tagline}"
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              {isAdmin && (
                <div className="p-3 bg-[#FFFDF5] border-t-2 border-black flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(group.id)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all ${
                      isActive
                        ? 'bg-white hover:bg-gray-200 text-black'
                        : 'bg-[#10B981] hover:bg-[#0ea5e9] text-black'
                    }`}
                  >
                    {isActive ? 'PAUSE ALLOCATION' : 'ENABLE GROUP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveIndividualGroup(group)}
                    className="px-3 py-1 bg-black text-[#FFD93D] hover:bg-black/90 font-mono font-black text-[10px] uppercase border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>SAVE</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
