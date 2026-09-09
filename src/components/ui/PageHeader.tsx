import React from 'react';
import { Badge } from './Badge';
import { useTheme } from '../../context/ThemeContext';

export interface PageHeaderProps {
  tag?: string;
  title: string;
  titleAccent?: string;
  description: string;
  badgeText?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  tag = 'PSITS // IT ORG EVENT',
  title,
  titleAccent,
  description,
  badgeText = 'PHASE 1 FOUNDATION',
  actions,
}) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    return (
      <div className="w-full bg-[#C0C0C0] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000] shadow-[inset_1px_1px_0px_#DFDFDF,inset_-1px_-1px_0px_#808080] p-1 mb-6 font-sans">
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2.5 py-1 flex items-center justify-between font-bold text-xs mb-1 select-none">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 bg-[#FFFF00] border border-black inline-block"></span>
            <span className="truncate">{title} {titleAccent || ''} - {tag}</span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 ml-2">
            <span className="w-4 h-3.5 bg-[#C0C0C0] text-black text-[9px] font-bold flex items-center justify-center border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF]">
              _
            </span>
            <span className="w-4 h-3.5 bg-[#C0C0C0] text-black text-[9px] font-bold flex items-center justify-center border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF]">
              □
            </span>
            <span className="w-4 h-3.5 bg-[#C0C0C0] text-black text-[9px] font-bold flex items-center justify-center border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF]">
              ✕
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-4 border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF] text-black">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#000080] text-white font-mono text-[11px] px-2 py-0.5 font-bold">
                  {tag}
                </span>
                {badgeText && (
                  <Badge variant="yellow" size="sm">
                    {badgeText}
                  </Badge>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black">
                {title} {titleAccent && <span className="text-[#000080]">{titleAccent}</span>}
              </h1>

              <p className="text-xs sm:text-sm text-gray-700 font-sans leading-relaxed">
                {description}
              </p>
            </div>

            {actions && (
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Neo-Brutalist default
  return (
    <div className="w-full bg-[#FFFFFF] border-8 border-black p-6 sm:p-8 shadow-[10px_10px_0px_#000000] relative overflow-hidden mb-8">
      {/* Decorative top hazard bar */}
      <div className="h-3 bg-hazard-stripes -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 border-b-4 border-black"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-black text-[#FFD93D] font-mono text-xs px-2.5 py-1 font-black border-2 border-black">
              {tag}
            </span>
            {badgeText && (
              <Badge variant="violet" size="sm" tilt="left">
                {badgeText}
              </Badge>
            )}
            <span className="font-mono text-xs text-gray-700 font-black">
              SEC: // DEPT.SYS.01
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-black leading-none">
            {title}{' '}
            {titleAccent && (
              <span className="bg-[#FFD93D] px-2 border-4 border-black inline-block -rotate-1 shadow-[4px_4px_0px_#000000]">
                {titleAccent}
              </span>
            )}
          </h1>

          <p className="text-base sm:text-lg font-bold text-gray-800 leading-relaxed uppercase max-w-2xl">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
            {actions}
          </div>
        )}
      </div>

      {/* Decorative background stamps */}
      <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none select-none font-mono text-6xl font-black tracking-tighter hidden sm:block">
        PSITS.IT
      </div>
    </div>
  );
};
