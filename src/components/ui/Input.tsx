import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  ...props
}) => {
  const { isRetro } = useTheme();
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  if (isRetro) {
    return (
      <div className="w-full flex flex-col gap-1 text-left font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold uppercase text-black flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-[#FF0000] font-mono text-[11px]">*REQUIRED</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-2 pointer-events-none text-[#808080]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            disabled={disabled}
            {...props}
            className={`
              w-full px-2 py-1.5 bg-[#FFFFFF] text-black font-sans text-xs placeholder:text-gray-500
              border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF]
              shadow-[inset_1px_1px_0px_#000000] outline-none
              focus:bg-[#FFFFFF] focus:ring-1 focus:ring-black
              disabled:bg-[#E8E8E8] disabled:cursor-not-allowed
              ${leftIcon ? 'pl-8' : ''}
              ${rightIcon ? 'pr-8' : ''}
              ${error ? 'border-t-[#FF0000] border-l-[#FF0000]' : ''}
              ${className}
            `}
          />
          {rightIcon && (
            <div className="absolute right-2 pointer-events-none text-[#808080]">
              {rightIcon}
            </div>
          )}
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
          htmlFor={inputId}
          className="text-xs font-black uppercase tracking-wider text-black flex items-center justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-[#FF6B6B] font-mono">*REQUIRED</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 pointer-events-none text-black">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          {...props}
          className={`
            w-full px-4 py-3 bg-[#FFFFFF] text-black font-bold placeholder:text-gray-400
            border-4 border-black transition-all outline-none
            shadow-[4px_4px_0px_#000000]
            focus:bg-[#FFFDF5] focus:shadow-[6px_6px_0px_#FFD93D] focus:border-black
            disabled:bg-gray-200 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-[#FF6B6B] focus:shadow-[6px_6px_0px_#FF6B6B]' : ''}
            ${className}
          `}
        />
        {rightIcon && (
          <div className="absolute right-3 pointer-events-none text-black">
            {rightIcon}
          </div>
        )}
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
