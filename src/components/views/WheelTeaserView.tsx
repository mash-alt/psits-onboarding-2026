import React, { useState, useRef } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import { MythicalCreatureGroup } from '../../types';
import { Play, Sparkles, RotateCw, Volume2, VolumeX, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

export interface WheelTeaserViewProps {
  onSelectGroup: (group: MythicalCreatureGroup) => void;
  onOpenRegister: () => void;
}

export const WheelTeaserView: React.FC<WheelTeaserViewProps> = ({
  onSelectGroup,
  onOpenRegister,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<MythicalCreatureGroup | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play arcade synth beep using Web Audio API
  const playArcadeTone = (freq: number, duration: number = 0.08) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext might be muted or not permitted
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedGroup(null);

    // Play arcade launch sound
    playArcadeTone(440, 0.15);

    // Random additional rotations (at least 5 full rotations + random angle)
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomIndex = Math.floor(Math.random() * OFFICIAL_MYTHICAL_GROUPS.length);
    const segmentAngle = 360 / OFFICIAL_MYTHICAL_GROUPS.length; // 30 degrees per slice
    // Pointer is at the top (270 degrees or 90 depending on coordinate system)
    const targetDegree = extraSpins * 360 + randomIndex * segmentAngle;

    setRotationDegrees((prev) => prev + targetDegree);

    // Tick audio sound interval during spin
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      playArcadeTone(600 + (tickCount % 6) * 80, 0.04);
      if (tickCount > 15) clearInterval(interval);
    }, 180);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedGroup(OFFICIAL_MYTHICAL_GROUPS[randomIndex]);
      playArcadeTone(880, 0.3);
    }, 3800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <PageHeader
        tag="ARCADE RANDOMIZER // PROTOCOL"
        title="SPIN THE"
        titleAccent="WHEEL"
        description="Interactive Group Assignment engine for the 12 Mythical Creature Groups. Experience the arcade induction ritual for all College of Computer Studies (CCS) students."
        badgeText="PHASE 1 VISUAL TEASER"
        actions={
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="px-3 py-2 bg-white text-black border-3 border-black font-black uppercase text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#000000] cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>SFX: {soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center: The Neo-Brutalist Wheel Stage */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border-8 border-black p-6 sm:p-8 shadow-[12px_12px_0px_#000000] flex flex-col items-center relative overflow-hidden">
          {/* Top Arcade Bar */}
          <div className="w-full bg-black text-[#FFD93D] p-2.5 font-mono text-xs font-black uppercase flex items-center justify-between border-b-4 border-black -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FF6B6B] animate-pulse"></span>
              <span>ARCADE ENGINE // MYTHIC_WHEEL_V1</span>
            </div>
            <span>12 MYTHICAL CREATURES</span>
          </div>

          {/* Faction Pointer Indicator */}
          <div className="relative z-20 -mb-5 flex flex-col items-center pointer-events-none">
            <div className="bg-[#FF6B6B] text-black font-mono font-black text-xs px-2.5 py-0.5 border-3 border-black shadow-[2px_2px_0px_#000000] uppercase">
              TARGET POINTER
            </div>
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-black"></div>
          </div>

          {/* The Spinning Wheel Canvas */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 my-4 select-none">
            <div
              className="w-full h-full rounded-full border-8 border-black shadow-[8px_8px_0px_#000000] relative overflow-hidden transition-transform ease-out"
              style={{
                transform: `rotate(${rotationDegrees}deg)`,
                transitionDuration: isSpinning ? '3.8s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
              }}
            >
              {OFFICIAL_MYTHICAL_GROUPS.map((group, idx) => {
                const angle = (360 / OFFICIAL_MYTHICAL_GROUPS.length) * idx;
                const colors = ['#FFD93D', '#FF6B6B', '#C4B5FD', '#FFFFFF'];
                const sliceBg = colors[idx % colors.length];

                return (
                  <div
                    key={group.id}
                    className="absolute top-0 left-1/2 w-0 h-0 border-l-[50px] sm:border-l-[66px] border-r-[50px] sm:border-r-[66px] border-t-[144px] sm:border-t-[192px] -translate-x-1/2 origin-bottom border-transparent"
                    style={{
                      borderTopColor: sliceBg,
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    <span
                      className="absolute -top-[128px] sm:-top-[170px] left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-black uppercase text-black whitespace-nowrap tracking-wider"
                      style={{ transform: 'translateX(-50%) rotate(90deg)' }}
                    >
                      {group.symbol} {group.name}
                    </span>
                  </div>
                );
              })}

              {/* Wheel Center Cap */}
              <div className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 bg-black border-4 border-[#FFD93D] rounded-full flex flex-col items-center justify-center text-[#FFD93D] shadow-[2px_2px_0px_#000000] z-10">
                <span className="font-mono text-[9px] font-black uppercase">PSITS</span>
                <span className="text-base sm:text-lg font-black">12</span>
              </div>
            </div>
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-4 w-full flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="xl"
              onClick={spinWheel}
              disabled={isSpinning}
              leftIcon={<RotateCw className={`w-5 h-5 stroke-[3] ${isSpinning ? 'animate-spin' : ''}`} />}
              className="text-base sm:text-lg py-4 w-full sm:w-auto"
            >
              {isSpinning ? 'SPINNING MYTHICAL WHEEL...' : 'INITIATE WHEEL SPIN →'}
            </Button>
          </div>

          <div className="w-full mt-6 pt-3 border-t-2 border-black flex justify-between text-[11px] font-mono font-bold text-gray-600 uppercase">
            <span>RULE: BALANCED CAPACITY PROTOCOL</span>
            <span>PHASE 1 RANDOMIZER TEASER</span>
          </div>
        </div>

        {/* Right: Result Panel / Group Assignment Teaser */}
        <div className="lg:col-span-5 space-y-6">
          {selectedGroup ? (
            <div className="bg-[#FFFFFF] border-8 border-black p-6 shadow-[10px_10px_0px_#000000] animate-in zoom-in-95 duration-200">
              <div className="bg-[#FFD93D] text-black p-2 font-mono text-xs font-black uppercase border-b-4 border-black -mx-6 -mt-6 mb-4 flex items-center justify-between">
                <span>ASSIGNED OUTCOME</span>
                <span>MATCH 100%</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-[#FF6B6B] border-4 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_#000000]">
                  {selectedGroup.symbol}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-gray-600">
                    YOU WERE ASSIGNED TO:
                  </span>
                  <h3 className="text-3xl font-black uppercase tracking-tight text-black">
                    {selectedGroup.name} Group
                  </h3>
                </div>
              </div>

              <div className="p-3 bg-[#FFFDF5] border-3 border-black text-xs font-bold uppercase space-y-1 mb-4">
                <div className="text-[11px] font-mono font-black text-black flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>SPECIALTY: {selectedGroup.itSpecialty}</span>
                </div>
                <p className="text-gray-700">{selectedGroup.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <span className="text-xs font-mono font-black uppercase text-black block">
                  GROUP TRAITS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGroup.traits.map((t) => (
                    <Badge key={t} variant="yellow" size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => onSelectGroup(selectedGroup)}
                  rightIcon={<ArrowRight className="w-4 h-4 stroke-[3]" />}
                >
                  VIEW FULL {selectedGroup.name.toUpperCase()} DOSSIER
                </Button>
                <Button variant="secondary" size="md" fullWidth onClick={spinWheel}>
                  SPIN AGAIN (TEST RANDOMIZER)
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFDF5] border-6 border-black p-6 shadow-[8px_8px_0px_#000000]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
                <h3 className="text-xl font-black uppercase tracking-tight text-black">
                  HOW THE WHEEL WORKS
                </h3>
              </div>

              <p className="text-xs sm:text-sm font-bold text-gray-800 uppercase leading-relaxed mb-4">
                During the live PSITS Acquaintance Party, incoming College of Computer Studies (CCS) students
                participate in the Group Assignment ceremony. The wheel ensures equal distribution across all
                12 Mythical Creature Groups.
              </p>

              <div className="space-y-2 text-xs font-mono font-bold uppercase">
                <div className="p-2.5 bg-white border-2 border-black flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#FFD93D] font-black text-black flex items-center justify-center border border-black">
                    1
                  </span>
                  <span>12 OFFICIAL MYTHICAL CREATURE GROUPS</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-black flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#FF6B6B] font-black text-black flex items-center justify-center border border-black">
                    2
                  </span>
                  <span>AUTHENTIC FILIPINO MYTHOLOGY</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-black flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#C4B5FD] font-black text-black flex items-center justify-center border border-black">
                    3
                  </span>
                  <span>BALANCED CAPACITY (~38 ATTENDEES EACH)</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-black">
                <Button
                  variant="accent"
                  size="md"
                  fullWidth
                  onClick={onOpenRegister}
                  leftIcon={<Sparkles className="w-4 h-4 stroke-[2.5]" />}
                >
                  PRE-REGISTER NOW →
                </Button>
              </div>
            </div>
          )}

          {/* Terminology Banner */}
          <div className="bg-black text-[#FFFDF5] border-4 border-black p-4 text-xs font-bold uppercase space-y-1">
            <span className="text-[#FFD93D] font-mono font-black text-[11px] block">
              OFFICIAL SYSTEM POLICY // TERMINOLOGY:
            </span>
            <p>
              "Group", "Mythical Creature Group", "Group Assignment", and "Group Roster" are the only
              official event terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
