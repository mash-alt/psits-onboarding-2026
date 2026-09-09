import React from 'react';
import { NavItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export interface FooterProps {
  onNavigate: (item: NavItem) => void;
  onOpenRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenRegister }) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    return (
      <footer className="w-full bg-[#C0C0C0] text-black border-t-2 border-t-[#FFFFFF] shadow-[inset_0px_1px_0px_#808080] mt-12 font-sans select-none">
        {/* Windows 95 Style Status Bar */}
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs border-b border-[#808080]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-[#E8E8E8] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-[11px] font-bold">
              SYS STATUS: READY
            </span>
            <span className="px-2 py-0.5 bg-[#E8E8E8] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-[11px]">
              DATE: OCT 24, 2026
            </span>
            <span className="px-2 py-0.5 bg-[#E8E8E8] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-[11px]">
              GROUPS: 12 MYTHICAL
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#0000FF]">
            <button onClick={() => onNavigate('HOME')} className="underline hover:text-black cursor-pointer">
              Home
            </button>
            <span>|</span>
            <button onClick={onOpenRegister} className="underline hover:text-black cursor-pointer">
              Register
            </button>
            <span>|</span>
            <button onClick={() => onNavigate('ATTENDEES')} className="underline hover:text-black cursor-pointer">
              Attendees
            </button>
            <span>|</span>
            <button onClick={() => onNavigate('GROUPS')} className="underline hover:text-black cursor-pointer">
              Groups
            </button>
            <span>|</span>
            <button onClick={() => onNavigate('SPIN THE WHEEL')} className="underline hover:text-black cursor-pointer">
              Wheel
            </button>
            <span>|</span>
            <button onClick={() => onNavigate('ADMIN')} className="underline hover:text-black cursor-pointer">
              Admin
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-700">
          <p>© 1997-2026 PSITS CCS Department. Best viewed with 800x600 resolution.</p>
          <p className="font-mono text-[10px]">BUILD: RETRO-1997-V1.0 // COLLEGE OF COMPUTER STUDIES</p>
        </div>
      </footer>
    );
  }

  // Neo-Brutalist default
  return (
    <footer className="w-full bg-[#000000] text-[#FFFFFF] border-t-8 border-black mt-20 relative select-none">
      {/* Top hazard strip */}
      <div className="h-3 bg-hazard-stripes border-b-4 border-black"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Organization & Identity */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFD93D] text-black border-4 border-[#FFFDF5] flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_#FF6B6B]">
                  CCS
                </div>
                <div>
                  <span className="bg-[#FFD93D] text-black font-mono text-[10px] font-black uppercase px-1.5 py-0.5 border border-black">
                    OFFICIAL CCS ORG
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#FFFDF5] mt-0.5">
                    PSITS EVENT
                  </h3>
                </div>
              </div>

              <p className="text-xs font-bold text-gray-300 uppercase leading-relaxed mt-4">
                Philippine Society of Information Technology Students — College of Computer Studies (CCS).
                Connecting future software engineers, architects, and technologists across the CCS department.
              </p>

              <div className="p-2.5 bg-[#141414] border-2 border-[#FFD93D] font-mono text-[11px] text-[#FFD93D] mt-3">
                PROTOCOL: ACQUAINTANCE_PARTY_V1
                <br />
                TERMINAL ID: #PSITS-CCS-2026
              </div>
            </div>
          </div>

          {/* Column 2: 12 Mythical Creature Groups list preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FFD93D] flex items-center gap-2 border-b-2 border-white/20 pb-2">
              <span>MYTHICAL CREATURE GROUPS (12)</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-bold uppercase text-gray-300">
              <span className="hover:text-[#FFD93D] transition-colors cursor-default">⚡ Kapre</span>
              <span className="hover:text-[#FF6B6B] transition-colors cursor-default">⚡ Sigbin</span>
              <span className="hover:text-[#C4B5FD] transition-colors cursor-default">⚡ Aswang</span>
              <span className="hover:text-[#FFD93D] transition-colors cursor-default">⚡ Tikbalang</span>
              <span className="hover:text-[#FF6B6B] transition-colors cursor-default">⚡ Chanak</span>
              <span className="hover:text-[#C4B5FD] transition-colors cursor-default">⚡ Shokoy</span>
              <span className="hover:text-[#FFD93D] transition-colors cursor-default">⚡ Manananggal</span>
              <span className="hover:text-[#FF6B6B] transition-colors cursor-default">⚡ Duwende</span>
              <span className="hover:text-[#C4B5FD] transition-colors cursor-default">⚡ Magkukulam</span>
              <span className="hover:text-[#FFD93D] transition-colors cursor-default">⚡ Sirena</span>
              <span className="hover:text-[#FF6B6B] transition-colors cursor-default">⚡ Diwata</span>
              <span className="hover:text-[#C4B5FD] transition-colors cursor-default">⚡ Otlum</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono uppercase pt-1">
              12 OFFICIAL MYTHICAL CREATURE GROUPS
            </p>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FFD93D] border-b-2 border-white/20 pb-2">
              DIRECT LINKS
            </h4>
            <ul className="space-y-2 text-xs font-black uppercase">
              <li>
                <button
                  onClick={() => onNavigate('HOME')}
                  className="hover:text-[#FFD93D] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#FF6B6B]">►</span> HOME
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRegister}
                  className="hover:text-[#FFD93D] text-[#FFD93D] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#FF6B6B]">►</span> ATTENDEE REGISTRATION
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ATTENDEES')}
                  className="hover:text-[#FFD93D] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#FF6B6B]">►</span> GROUP ROSTER DIRECTORY
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('GROUPS')}
                  className="hover:text-[#FFD93D] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#FF6B6B]">►</span> 12 MYTHICAL GROUPS SHOWCASE
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('SPIN THE WHEEL')}
                  className="hover:text-[#FFD93D] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-[#FF6B6B]">►</span> RANDOMIZER WHEEL
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ADMIN')}
                  className="hover:text-[#FFD93D] text-[#FF6B6B] transition-colors flex items-center gap-1.5 cursor-pointer font-black"
                >
                  <span className="text-[#FFD93D]">►</span> PSITS CONTROL CENTER
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Event Schedule & Stamp */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FFD93D] border-b-2 border-white/20 pb-2">
              EVENT DISPATCH
            </h4>
            <div className="bg-[#141414] border-3 border-white p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400">DATE:</span>
                <span className="text-[#FFD93D] font-mono font-black">OCT 24, 2026</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400">CALL TIME:</span>
                <span className="text-[#FFFDF5] font-mono font-black">05:00 PM PST</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400">VENUE:</span>
                <span className="text-[#C4B5FD] font-mono font-black">MAIN AUDITORIUM</span>
              </div>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#FF6B6B]">SYSTEM: ONLINE</span>
                <span className="w-2 h-2 bg-[#FFD93D] inline-block"></span>
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="bg-white text-black p-2 border-2 border-black flex flex-col items-center">
              <div className="h-6 w-full flex items-center justify-center gap-0.5 overflow-hidden">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black h-full"
                    style={{
                      width: i % 3 === 0 ? '4px' : i % 2 === 0 ? '2px' : '1px',
                      marginRight: i % 4 === 0 ? '3px' : '1px',
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] font-black tracking-widest mt-1">
                PSITS-2026-MYTHIC-12
              </span>
            </div>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="border-t-4 border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase">
          <p>© 2026 PSITS — CCS DEPARTMENT, COLLEGE OF COMPUTER STUDIES. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#FFD93D]">PHASE 1: FRONTEND FOUNDATION</span>
            <span>//</span>
            <span>BUILD: 1.0.0-PROD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
