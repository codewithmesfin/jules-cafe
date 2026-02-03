import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  primary: 'bg-slate-900 text-white border-transparent',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
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
