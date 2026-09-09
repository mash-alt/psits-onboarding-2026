import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  options,
  className = '',
  id,
  disabled,
  ...props
}) => {
  const { isRetro } = useTheme();
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  if (isRetro) {
    return (
      <div className="w-full flex flex-col gap-1 text-left font-sans">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-bold uppercase text-black flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-[#FF0000] font-mono text-[11px]">*REQUIRED</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-2 pointer-events-none text-[#808080] z-10">
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            disabled={disabled}
            {...props}
            className={`
              w-full appearance-none px-2 py-1.5 bg-[#FFFFFF] text-black font-sans text-xs
              border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF]
              shadow-[inset_1px_1px_0px_#000000] outline-none pr-7 cursor-pointer
              focus:ring-1 focus:ring-black
              disabled:bg-[#E8E8E8] disabled:cursor-not-allowed
              ${leftIcon ? 'pl-8' : ''}
              ${error ? 'border-t-[#FF0000] border-l-[#FF0000]' : ''}
              ${className}
            `}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="py-1">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-black bg-[#C0C0C0] border border-t-white border-l-white border-r-black border-b-black p-0.5 shadow-[inset_0.5px_0.5px_0px_#DFDFDF]">
            {rightIcon ? rightIcon : <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
        </div>

        {error ? (
          <p className="text-[11px] font-bold text-[#FF0000] uppercase tracking-wide flex items-center gap-1 mt-0.5">
            <span>⚠ ERROR:</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-gray-600 uppercase tracking-wide">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }

  // Neo-Brutalist default
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-black uppercase tracking-wider text-black flex items-center justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-[#FF6B6B] font-mono">*REQUIRED</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 pointer-events-none text-black z-10">
            {leftIcon}
          </div>
        )}
        <select
          id={selectId}
          disabled={disabled}
          {...props}
          className={`
            w-full appearance-none px-4 py-3 bg-[#FFFFFF] text-black font-bold
            border-4 border-black transition-all outline-none pr-10 cursor-pointer
            shadow-[4px_4px_0px_#000000]
            focus:bg-[#FFFDF5] focus:shadow-[6px_6px_0px_#FFD93D] focus:border-black
            disabled:bg-gray-200 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-[#FF6B6B]' : ''}
            ${className}
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="font-bold py-1">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black bg-[#FFD93D] border-2 border-black p-0.5">
          {rightIcon ? rightIcon : <ChevronDown className="w-4 h-4 stroke-[3]" />}
        </div>
      </div>

      {error ? (
        <p className="text-xs font-black text-[#FF6B6B] uppercase tracking-wide flex items-center gap-1 mt-0.5">
          <span>⚠ ERROR:</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
