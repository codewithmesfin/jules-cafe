import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-[0.97]',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-[0.97]',
  outline: 'border-2 border-slate-200 bg-transparent hover:border-primary hover:text-primary active:scale-[0.97]',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 active:scale-[0.97]',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-[0.97]',
  accent: 'bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/20 active:scale-[0.97]',
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-2xl',
  xl: 'px-8 py-4 text-lg gap-3 rounded-[2rem]',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
      ) : leftIcon ? (
        <span className="flex-shrink-0 transition-transform group-hover:scale-110">{leftIcon}</span>
      ) : null}
      <span className="relative">{children}</span>
      {!isLoading && rightIcon ? (
        <span className="flex-shrink-0 transition-transform group-hover:translate-x-0.5">{rightIcon}</span>
      ) : null}
    </button>
  );
};
