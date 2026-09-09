import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface MarqueeProps {
  text?: string;
  variant?: 'yellow' | 'black' | 'red' | 'violet';
  speed?: 'normal' | 'fast' | 'slow';
  bordered?: boolean;
}

export const Marquee: React.FC<MarqueeProps> = ({
  text = 'PSITS // CCS DEPARTMENT // ACQUAINTANCE PARTY // 12 MYTHICAL CREATURE GROUPS // SYSTEM ONLINE // CONNECT // COMPETE // CHAOS //',
  variant = 'yellow',
  bordered = true,
}) => {
  const { isRetro } = useTheme();

  const variantStyles = {
    yellow: 'bg-[#FFD93D] text-black',
    black: 'bg-[#000000] text-[#FFD93D]',
    red: 'bg-[#FF6B6B] text-black',
    violet: 'bg-[#C4B5FD] text-black',
  };

  const textRepeated = `${text} `.repeat(4);

  if (isRetro) {
    return (
      <div
        className="w-full overflow-hidden whitespace-nowrap py-1 bg-[#000000] text-[#00FF00] font-mono text-xs font-bold select-none border-y border-[#808080]"
      >
        <div className="animate-marquee inline-flex items-center gap-4">
          <span>{textRepeated}</span>
          <span>{textRepeated}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        w-full overflow-hidden whitespace-nowrap py-2.5 font-black uppercase text-sm sm:text-base tracking-widest select-none
        ${bordered ? 'border-y-4 border-black' : ''}
        ${variantStyles[variant]}
      `}
    >
      <div className="animate-marquee inline-flex items-center gap-4">
        <span>{textRepeated}</span>
        <span>{textRepeated}</span>
      </div>
    </div>
  );
};
