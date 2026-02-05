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
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'comfortable';
  variant?: 'flat' | 'bordered';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  comfortable: 'p-5 sm:p-6',
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
  variant = 'bordered',
  onClick,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-200',
        variant === 'flat' ? 'bg-white' : 'bg-white border border-gray-200',
        hover && 'hover:border-gray-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="sm:ml-4">{headerAction}</div>}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};
