import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-[#e60023] text-white hover:bg-[#ad081b] shadow-md shadow-red-100',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  outline: 'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-100',
  premium: 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm gap-2 rounded-xl',
  md: 'px-6 py-3 text-sm gap-2.5 rounded-2xl',
  lg: 'px-8 py-4 text-base gap-3 rounded-2xl',
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
  whileTap = { scale: 0.96 },
  whileHover = { scale: 1.01 },
  ...props
}) => {
  return (
    <motion.button
      whileTap={disabled || isLoading ? {} : whileTap}
      whileHover={disabled || isLoading ? {} : whileHover}
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
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
        <span className="flex-shrink-0 transition-transform">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon ? (
        <span className="flex-shrink-0 transition-transform">{rightIcon}</span>
      ) : null}
    </motion.button>
  );
};
