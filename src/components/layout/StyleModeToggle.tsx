import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Monitor, Zap } from 'lucide-react';

export const StyleModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { uiStyle, setUIStyle, isRetro } = useTheme();

  if (isRetro) {
    return (
      <div
        role="group"
        aria-label="UI Visual Theme Selection"
        className={`inline-flex items-center gap-1.5 p-1 bg-[#C0C0C0] border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF] font-sans text-xs ${className}`}
      >
        <span className="font-bold text-[11px] text-black uppercase px-1 select-none flex items-center gap-1">
          <Monitor className="w-3.5 h-3.5" />
          STYLE:
        </span>
        <div className="inline-flex gap-1">
          <button
            type="button"
            aria-pressed={uiStyle === 'neo'}
            onClick={() => setUIStyle('neo')}
            className={`
              px-2 py-0.5 text-[11px] font-bold uppercase transition-none cursor-pointer
              ${
                uiStyle === 'neo'
                  ? 'bg-[#000080] text-white border-2 border-t-[#000030] border-l-[#000030] border-r-[#6090E0] border-b-[#6090E0] shadow-[inset_1px_1px_0px_#000020]'
                  : 'bg-[#C0C0C0] text-black border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000] hover:bg-[#D4D4D4] shadow-[inset_0.5px_0.5px_0px_#DFDFDF]'
              }
            `}
          >
            NEO-BRUTALISM
          </button>
          <button
            type="button"
            aria-pressed={uiStyle === 'retro1997'}
            onClick={() => setUIStyle('retro1997')}
            className={`
              px-2 py-0.5 text-[11px] font-bold uppercase transition-none cursor-pointer
              ${
                uiStyle === 'retro1997'
                  ? 'bg-[#000080] text-white border-2 border-t-[#000030] border-l-[#000030] border-r-[#6090E0] border-b-[#6090E0] shadow-[inset_1px_1px_0px_#000020]'
                  : 'bg-[#C0C0C0] text-black border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000] hover:bg-[#D4D4D4] shadow-[inset_0.5px_0.5px_0px_#DFDFDF]'
              }
            `}
          >
            RETRO 1997
          </button>
        </div>
      </div>
    );
  }

  // Neo-Brutalist Toggle
  return (
    <div
      role="group"
      aria-label="UI Visual Theme Selection"
      className={`inline-flex items-center gap-1.5 p-1 bg-white border-3 border-black shadow-[3px_3px_0px_#000000] text-xs font-black ${className}`}
    >
      <span className="text-[10px] font-mono tracking-widest text-black uppercase pl-1 select-none flex items-center gap-1">
        <Zap className="w-3.5 h-3.5 fill-[#FFD93D]" />
        STYLE:
      </span>
      <div className="inline-flex gap-1">
        <button
          type="button"
          aria-pressed={uiStyle === 'neo'}
          onClick={() => setUIStyle('neo')}
          className={`
            px-2 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer select-none
            ${
              uiStyle === 'neo'
                ? 'bg-black text-[#FFD93D] shadow-[2px_2px_0px_#FFD93D]'
                : 'bg-white text-black hover:bg-[#FFFDF5] hover:text-black'
            }
          `}
        >
          NEO-BRUTALISM
        </button>
        <button
          type="button"
          aria-pressed={uiStyle === 'retro1997'}
          onClick={() => setUIStyle('retro1997')}
          className={`
            px-2 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer select-none
            ${
              uiStyle === 'retro1997'
                ? 'bg-[#C4B5FD] text-black shadow-[2px_2px_0px_#000000]'
                : 'bg-white text-black hover:bg-[#C4B5FD]/40'
            }
          `}
        >
          RETRO 1997
        </button>
      </div>
    </div>
  );
};
