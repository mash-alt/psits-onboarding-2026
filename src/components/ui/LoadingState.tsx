import React from 'react';
import { Terminal } from 'lucide-react';

export interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  progressPercent?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'INITIALIZING SYSTEM ROUTINE...',
  subtitle = 'FETCHING 12 MYTHICAL CREATURE GROUP ROSTERS AND ATTENDEE REGISTRY',
  progressPercent = 78,
}) => {
  return (
    <div className="w-full bg-[#000000] text-[#FFD93D] border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_#000000] relative my-6 select-none">
      <div className="flex items-center justify-between border-b-2 border-[#FFD93D]/40 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 stroke-[2.5]" />
          <span className="font-mono text-xs uppercase font-black tracking-widest text-[#FFFFFF]">
            PSITS.CORE // RUNTIME_BOOT_SEQUENCE
          </span>
        </div>
        <span className="inline-block w-3 h-3 bg-[#FF6B6B] animate-pulse border border-black"></span>
      </div>

      <div className="space-y-4 max-w-xl">
        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#FFD93D]">
          {title}
        </h3>

        <p className="text-xs sm:text-sm font-bold text-[#FFFDF5]/80 uppercase tracking-wider font-mono">
          {subtitle}
        </p>

        {/* Chunky Brutalist Progress Bar */}
        <div className="w-full h-8 bg-[#1a1a1a] border-3 border-[#FFD93D] p-1 relative">
          <div
            className="h-full bg-[#FFD93D] transition-all duration-500 bg-hazard-stripes flex items-center justify-end pr-2"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="bg-black text-[#FFD93D] text-[10px] font-mono font-black px-1 border border-black">
              {progressPercent}%
            </span>
          </div>
        </div>

        <div className="flex justify-between text-[11px] font-mono font-bold text-gray-400">
          <span>MEM: OK // BUFFER: ALLOCATED</span>
          <span>SPEED: 1000MBPS // ASYNC</span>
        </div>
      </div>
    </div>
  );
};
