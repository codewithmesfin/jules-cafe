import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] shadow-sm ring-slate-500/20',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98] ring-slate-500/20',
  outline: 'border-2 border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700 active:scale-[0.98] ring-slate-500/20',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 active:scale-[0.98] ring-slate-500/20',
  danger: 'bg-error-600 text-white hover:bg-error-700 active:scale-[0.98] shadow-sm ring-error-500/20',
  success: 'bg-success-600 text-white hover:bg-success-700 active:scale-[0.98] shadow-sm ring-success-500/20',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  icon: 'p-2.5 rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon ? (
        <span className="flex-shrink-0">{rightIcon}</span>
      ) : null}
    </button>
  );
};
