import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  variant?: 'yellow' | 'red' | 'violet' | 'white' | 'black';
  icon?: React.ReactNode;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  badge,
  variant = 'yellow',
  icon,
  trend,
}) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    return (
      <div className="bg-[#FFFFFF] border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF] p-3 shadow-[inset_1px_1px_0px_#000000] font-sans">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase text-gray-700 tracking-wider">
              {label}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#000080] my-0.5">
              {value}
            </div>
          </div>
          {icon && (
            <div className="w-8 h-8 bg-[#C0C0C0] border border-t-white border-l-white border-r-black border-b-black text-black flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
        </div>

        {(subtext || badge || trend) && (
          <div className="flex items-center justify-between gap-1.5 mt-2 pt-1.5 border-t border-[#E8E8E8] text-[10px]">
            {subtext && (
              <span className="text-gray-600 truncate">
                {subtext}
              </span>
            )}
            {badge && (
              <span className="px-1.5 py-0.2 bg-[#000080] text-white font-mono font-bold shrink-0">
                {badge}
              </span>
            )}
            {trend && (
              <span className="font-bold text-[#008000] shrink-0">
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Neo-Brutalist default
  const bgVariants = {
    yellow: 'bg-[#FFD93D] text-black',
    red: 'bg-[#FF6B6B] text-black',
    violet: 'bg-[#C4B5FD] text-black',
    white: 'bg-[#FFFFFF] text-black',
    black: 'bg-[#000000] text-white',
  };

  const accentBars = {
    yellow: 'bg-black',
    red: 'bg-[#FFD93D]',
    violet: 'bg-black',
    white: 'bg-[#FFD93D]',
    black: 'bg-[#FFD93D]',
  };

  return (
    <div
      className={`
        border-4 border-black p-5 relative overflow-hidden transition-all select-none
        shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#000000]
        ${bgVariants[variant]}
      `}
    >
      {/* Decorative top strip */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${accentBars[variant]}`}></div>

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-widest opacity-85">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none my-1">
            {value}
          </div>
        </div>

        {icon && (
          <div className="w-12 h-12 shrink-0 border-3 border-black bg-white text-black flex items-center justify-center shadow-[3px_3px_0px_#000000]">
            {icon}
          </div>
        )}
      </div>

      {(subtext || badge || trend) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-black/30 text-xs">
          {subtext && (
            <span className="font-bold uppercase tracking-wider opacity-90 truncate">
              {subtext}
            </span>
          )}
          {badge && (
            <span className="px-2 py-0.5 bg-black text-[#FFD93D] font-mono font-black text-[10px] uppercase border border-black shrink-0">
              {badge}
            </span>
          )}
          {trend && (
            <span className="font-black text-xs uppercase shrink-0">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
