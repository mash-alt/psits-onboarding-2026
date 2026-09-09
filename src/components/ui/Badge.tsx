import React from 'react';
import { BadgeVariant } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  tilt?: 'none' | 'left' | 'right';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  tilt = 'none',
  icon,
  className = '',
  ...props
}) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    const retroColors: Record<BadgeVariant, string> = {
      yellow: 'bg-[#FFFF00] text-black border-black',
      red: 'bg-[#FF0000] text-white border-black',
      violet: 'bg-[#000080] text-white border-black',
      black: 'bg-black text-white border-black',
      white: 'bg-white text-black border-black',
      cream: 'bg-[#E8E8E8] text-black border-black',
    };

    return (
      <span
        {...props}
        className={`
          inline-flex items-center gap-1 font-bold uppercase text-[10px] px-1.5 py-0.5 select-none whitespace-nowrap
          border border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF]
          ${retroColors[variant]}
          ${className}
        `}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }

  // Neo-Brutalist default
  const variantStyles: Record<BadgeVariant, string> = {
    yellow: 'bg-[#FFD93D] text-black',
    red: 'bg-[#FF6B6B] text-black',
    violet: 'bg-[#C4B5FD] text-black',
    black: 'bg-[#000000] text-white',
    white: 'bg-[#FFFFFF] text-black',
    cream: 'bg-[#FFFDF5] text-black',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider border-2',
    md: 'px-3 py-1 text-xs tracking-wider border-3',
    lg: 'px-4 py-1.5 text-sm tracking-widest border-4',
  };

  const tiltStyles = {
    none: '',
    left: '-rotate-2 hover:rotate-0 transition-transform',
    right: 'rotate-2 hover:rotate-0 transition-transform',
  };

  return (
    <span
      {...props}
      className={`
        inline-flex items-center gap-1.5 font-black uppercase border-black select-none whitespace-nowrap
        shadow-[2px_2px_0px_#000000]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${tiltStyles[tilt]}
        ${className}
      `}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
