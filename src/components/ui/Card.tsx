import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glass' | 'outline' | 'flat';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

const variantStyles = {
  default: 'bg-white border-slate-100 shadow-premium',
  glass: 'glass border-white/40 shadow-premium',
  outline: 'bg-transparent border-slate-200 border-2',
  flat: 'bg-slate-50 border-transparent',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  footer,
  headerAction,
  hover = false,
  padding = 'md',
  variant = 'default',
}) => {
  return (
    <div
      className={cn(
        'rounded-3xl border transition-all duration-300',
        variantStyles[variant],
        hover && 'hover:shadow-premium-hover hover:-translate-y-1',
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/30 rounded-b-3xl">
          {footer}
        </div>
      )}
    </div>
  );
};
