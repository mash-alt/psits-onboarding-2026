import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    const retroSizeStyles: Record<ButtonSize, string> = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3.5 py-1.5 text-xs',
      lg: 'px-5 py-2 text-sm',
      xl: 'px-6 py-2.5 text-sm',
    };

    const isPrimary = variant === 'primary' || variant === 'accent';
    const isDark = variant === 'dark';

    return (
      <button
        {...props}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center gap-1.5 font-bold uppercase select-none cursor-pointer
          border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000]
          shadow-[inset_1px_1px_0px_#DFDFDF,inset_-1px_-1px_0px_#808080]
          active:border-t-[#000000] active:border-l-[#000000] active:border-r-[#FFFFFF] active:border-b-[#FFFFFF]
          active:shadow-[inset_1px_1px_0px_#808080]
          focus:outline-1 focus:outline-dotted focus:outline-black
          ${isPrimary ? 'bg-[#C0C0C0] text-black ring-1 ring-black' : isDark ? 'bg-[#000080] text-white border-t-[#6090E0] border-l-[#6090E0] border-r-[#000020] border-b-[#000020]' : 'bg-[#C0C0C0] text-black'}
          ${retroSizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-[#C0C0C0] text-[#808080]' : ''}
          ${className}
        `}
      >
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span className="whitespace-nowrap">{children}</span>
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }

  // Neo-Brutalist default
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#FFD93D] text-black hover:bg-[#ffe366]',
    secondary: 'bg-[#FFFFFF] text-black hover:bg-[#f0f0f0]',
    accent: 'bg-[#FF6B6B] text-black hover:bg-[#ff8585]',
    violet: 'bg-[#C4B5FD] text-black hover:bg-[#d8cefd]',
    dark: 'bg-[#000000] text-white hover:bg-[#1a1a1a]',
    outline: 'bg-transparent text-black hover:bg-[#FFD93D]',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs tracking-wider',
    md: 'px-5 py-2.5 text-sm tracking-wider',
    lg: 'px-7 py-3.5 text-base tracking-widest',
    xl: 'px-9 py-4.5 text-lg tracking-widest',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2.5 font-black uppercase tracking-wider
        border-4 border-black transition-transform duration-100 select-none cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-300'
            : 'shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000000]'
        }
        ${className}
      `}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span className="whitespace-nowrap">{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
