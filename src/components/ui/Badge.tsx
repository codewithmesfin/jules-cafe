import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'accent';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  error: 'bg-rose-50 text-rose-600 border-rose-100',
  info: 'bg-blue-50 text-blue-600 border-blue-100',
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] uppercase tracking-widest font-extrabold',
  md: 'px-3 py-1 text-[11px] uppercase tracking-widest font-extrabold',
  lg: 'px-4 py-1.5 text-xs uppercase tracking-widest font-extrabold',
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
        'inline-flex items-center gap-1 rounded-lg border transition-all duration-300',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
