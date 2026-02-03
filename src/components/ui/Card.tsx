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
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
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
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200 shadow-sm',
        hover && 'transition-all duration-300 hover:shadow-lg hover:border-slate-300',
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          {footer}
        </div>
      )}
    </div>
  );
};
