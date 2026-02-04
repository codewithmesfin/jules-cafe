import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100/80',
  warning: 'bg-amber-50 text-amber-600 border-amber-100/80',
  error: 'bg-rose-50 text-rose-600 border-rose-100/80',
  info: 'bg-sky-50 text-sky-600 border-sky-100/80',
  primary: 'bg-[#e60023] text-white border-transparent shadow-sm shadow-red-100',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-bold',
  md: 'px-3 py-1 text-xs font-bold',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
  size = 'md',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full text-xs font-semibold border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
