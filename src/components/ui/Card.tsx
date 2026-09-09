import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  borderSize?: '4' | '8';
  shadowSize?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  bgColor?: 'white' | 'cream' | 'yellow' | 'violet' | 'red' | 'black';
  headerTitle?: string;
  headerBadge?: React.ReactNode;
  headerVariant?: 'yellow' | 'black' | 'hazard' | 'red' | 'violet';
}

export const Card: React.FC<CardProps> = ({
  children,
  borderSize = '4',
  shadowSize = 'md',
  bgColor = 'white',
  headerTitle,
  headerBadge,
  headerVariant = 'yellow',
  className = '',
  ...props
}) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    return (
      <div
        {...props}
        className={`
          bg-[#C0C0C0] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000]
          shadow-[inset_1px_1px_0px_#DFDFDF,inset_-1px_-1px_0px_#808080] p-1 text-black font-sans
          ${className}
        `}
      >
        {headerTitle && (
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between font-bold text-xs mb-1 select-none">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 bg-[#FFFF00] inline-block border border-black"></span>
              <span className="truncate">{headerTitle}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {headerBadge}
              <div className="flex items-center gap-0.5">
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
          </div>
        )}
        <div className="bg-[#FFFFFF] p-4 border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF] text-black">
          {children}
        </div>
      </div>
    );
  }

  // Neo-Brutalist default
  const borderStyles = {
    '4': 'border-4 border-black',
    '8': 'border-8 border-black',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-[3px_3px_0px_#000000]',
    md: 'shadow-[6px_6px_0px_#000000]',
    lg: 'shadow-[10px_10px_0px_#000000]',
    xl: 'shadow-[14px_14px_0px_#000000]',
  };

  const bgStyles = {
    white: 'bg-[#FFFFFF]',
    cream: 'bg-[#FFFDF5]',
    yellow: 'bg-[#FFD93D]',
    violet: 'bg-[#C4B5FD]',
    red: 'bg-[#FF6B6B]',
    black: 'bg-[#000000] text-white',
  };

  const headerBgStyles = {
    yellow: 'bg-[#FFD93D] text-black border-b-4 border-black',
    black: 'bg-[#000000] text-[#FFD93D] border-b-4 border-black',
    hazard: 'bg-hazard-stripes text-black border-b-4 border-black',
    red: 'bg-[#FF6B6B] text-black border-b-4 border-black',
    violet: 'bg-[#C4B5FD] text-black border-b-4 border-black',
  };

  return (
    <div
      {...props}
      className={`
        relative overflow-hidden
        ${borderStyles[borderSize]}
        ${shadowStyles[shadowSize]}
        ${bgStyles[bgColor]}
        ${className}
      `}
    >
      {headerTitle && (
        <div
          className={`
            px-4 py-2 flex items-center justify-between font-black uppercase tracking-wider text-xs
            ${headerBgStyles[headerVariant]}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-black"></span>
            <span className={headerVariant === 'hazard' ? 'bg-[#FFD93D] px-1 border-2 border-black' : ''}>
              {headerTitle}
            </span>
          </div>
          {headerBadge && <div>{headerBadge}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
