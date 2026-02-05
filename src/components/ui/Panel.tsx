import React from 'react';
import { cn } from '../../utils/cn';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Panel: React.FC<PanelProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 transition-all duration-200',
        paddingClasses[padding],
        hover && 'hover:border-gray-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface StatPanelProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export const StatPanel: React.FC<StatPanelProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconBg = 'bg-gray-100',
  className,
}) => {
  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <Panel hover className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <span className={cn(
              'inline-flex items-center gap-1 text-xs font-medium mt-2 px-2 py-0.5 rounded-full',
              changeColors[changeType]
            )}>
              {change}
            </span>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </Panel>
  );
};
