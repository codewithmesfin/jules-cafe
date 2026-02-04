import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  id,
  className,
  containerClassName,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={cn("w-full space-y-2", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium transition-all duration-300',
            'focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 shadow-sm',
            'disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/10',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs font-bold text-rose-500 animate-fade-in pl-1">{error}</p>}
      {hint && !error && <p className="mt-2 text-xs font-bold text-slate-400 tracking-wide pl-1">{hint}</p>}
    </div>
  );
};
