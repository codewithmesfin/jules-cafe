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

import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'bg-white rounded-[2rem] border border-slate-100 shadow-premium',
        hover && 'transition-all duration-300 hover:shadow-premium-hover hover:border-slate-200 hover:-translate-y-1',
        className
      )}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400 font-medium mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={cn('px-8 py-6', paddingClasses[padding] && padding !== 'md' && paddingClasses[padding])}>
        {children}
      </div>
      {footer && (
        <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/30 rounded-b-[2rem]">
          {footer}
        </div>
      )}
    </motion.div>
  );
};
