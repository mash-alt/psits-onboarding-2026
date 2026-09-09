import React from 'react';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import { Clock } from 'lucide-react';

export interface MythicalGroupBadgeProps {
  groupName: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showSymbol?: boolean;
  className?: string;
  onClick?: () => void;
}

// Consistent high-contrast color scheme for all 12 official groups
const GROUP_PALETTE: Record<
  string,
  { bg: string; text: string; border: string; symbol: string }
> = {
  kapre: { bg: '#FFD93D', text: '#000000', border: '#000000', symbol: '🪵' },
  sigbin: { bg: '#FF6B6B', text: '#000000', border: '#000000', symbol: '🐾' },
  aswang: { bg: '#C4B5FD', text: '#000000', border: '#000000', symbol: '🦇' },
  tikbalang: { bg: '#FFFDF5', text: '#000000', border: '#000000', symbol: '🐎' },
  chanak: { bg: '#F59E0B', text: '#000000', border: '#000000', symbol: '⚡' },
  shokoy: { bg: '#10B981', text: '#000000', border: '#000000', symbol: '🌊' },
  manananggal: { bg: '#FB7185', text: '#000000', border: '#000000', symbol: '🦅' },
  duwende: { bg: '#A78BFA', text: '#000000', border: '#000000', symbol: '🪨' },
  mangkukulam: { bg: '#FBBF24', text: '#000000', border: '#000000', symbol: '🔮' },
  sirena: { bg: '#38BDF8', text: '#000000', border: '#000000', symbol: '🧜‍♀️' },
  diwata: { bg: '#E879F9', text: '#000000', border: '#000000', symbol: '✨' },
  otlum: { bg: '#FB923C', text: '#000000', border: '#000000', symbol: '⏳' },
};

export const MythicalGroupBadge: React.FC<MythicalGroupBadgeProps> = ({
  groupName,
  size = 'md',
  showSymbol = true,
  className = '',
  onClick,
}) => {
  if (!groupName || groupName.trim() === '' || groupName.toUpperCase() === 'UNASSIGNED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase bg-[#F3F4F6] text-gray-700 border-2 border-dashed border-black ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : size === 'lg'
            ? 'px-3.5 py-1.5 text-sm'
            : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <Clock className="w-3 h-3 text-gray-500" />
        <span>PENDING ASSIGNMENT</span>
      </span>
    );
  }

  const key = groupName.toLowerCase().trim();
  const palette = GROUP_PALETTE[key] || {
    bg: '#FFD93D',
    text: '#000000',
    border: '#000000',
    symbol: '⚡',
  };

  const groupInfo = OFFICIAL_MYTHICAL_GROUPS.find(
    (g) => g.name.toLowerCase() === key
  );

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 shadow-[2px_2px_0px_#000000]',
    md: 'px-2.5 py-1 text-xs gap-1.5 shadow-[2px_2px_0px_#000000]',
    lg: 'px-4 py-1.5 text-sm gap-2 shadow-[3px_3px_0px_#000000]',
  };

  const symbol = groupInfo?.symbol || palette.symbol;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-mono font-black uppercase tracking-wider border-2 border-black whitespace-nowrap transition-transform ${
        onClick ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5' : ''
      } ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
      title={`${groupName} Mythical Creature Group`}
    >
      {showSymbol && <span className="select-none text-[1.1em]">{symbol}</span>}
      <span>{groupName.toUpperCase()}</span>
    </span>
  );
};
