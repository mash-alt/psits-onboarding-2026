import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  headerVariant?: 'yellow' | 'red' | 'violet' | 'hazard';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  headerVariant = 'yellow',
  maxWidth = 'lg',
  children,
  footer,
}) => {
  const { isRetro } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
    '3xl': 'max-w-5xl',
    '4xl': 'max-w-6xl',
    '5xl': 'max-w-7xl',
  };

  if (isRetro) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto font-sans"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={`
            w-full ${maxWidthStyles[maxWidth]} bg-[#C0C0C0] text-black
            border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000]
            shadow-[inset_1px_1px_0px_#DFDFDF,inset_-1px_-1px_0px_#808080]
            p-1 relative my-8
          `}
        >
          {/* Classic Window Titlebar */}
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between font-bold text-xs select-none">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 bg-[#FFFF00] border border-black inline-block"></span>
              <span className="truncate">{title}</span>
              {badge && (
                <span className="bg-[#000000] text-[#FFFF00] text-[10px] px-1 py-0.2 font-mono">
                  [{badge}]
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="w-4 h-3.5 bg-[#C0C0C0] hover:bg-[#E8E8E8] text-black text-[9px] font-bold flex items-center justify-center border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF] cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {subtitle && (
            <div className="px-2 py-1 bg-[#E8E8E8] text-xs text-gray-800 font-sans border-b border-[#808080]">
              {subtitle}
            </div>
          )}

          {/* Body Content */}
          <div className="bg-[#FFFFFF] p-4 border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF] max-h-[70vh] overflow-y-auto text-black">
            {children}
          </div>

          {/* Modal Footer */}
          {footer && (
            <div className="p-2 bg-[#C0C0C0] flex flex-wrap items-center justify-end gap-2 border-t border-[#808080] mt-1">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Neo-Brutalist default
  const headerColors = {
    yellow: 'bg-[#FFD93D]',
    red: 'bg-[#FF6B6B]',
    violet: 'bg-[#C4B5FD]',
    hazard: 'bg-hazard-stripes',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`
          w-full ${maxWidthStyles[maxWidth]} bg-[#FFFDF5] text-black
          border-8 border-black shadow-[12px_12px_0px_#000000]
          relative my-8 animate-in fade-in zoom-in-95 duration-150
        `}
      >
        {/* Top Accent Strip */}
        <div className={`h-4 border-b-4 border-black ${headerColors[headerVariant]}`}></div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-4 border-black bg-[#FFFFFF] flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {badge && (
                <span className="bg-[#000000] text-[#FFD93D] font-mono text-[10px] uppercase px-2 py-0.5 font-black border border-black">
                  {badge}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 shrink-0 bg-[#FF6B6B] hover:bg-black hover:text-[#FF6B6B] text-black font-black border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t-4 border-black bg-[#FFFFFF] flex flex-wrap items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
