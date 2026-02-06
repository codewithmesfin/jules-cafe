import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  showClose?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showClose = true,
}) => {
  const isBottom = position === 'bottom';
  
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          'fixed z-[60] bg-white shadow-2xl transition-transform duration-300 ease-out',
          isBottom 
            ? 'inset-x-0 bottom-0 rounded-t-3xl max-h-[95vh]' 
            : `inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} w-full max-w-md`,
          isOpen 
            ? isBottom ? 'translate-y-0' : 'translate-x-0' 
            : isBottom ? 'translate-y-full' : position === 'right' ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between px-6 py-4 border-b border-slate-100',
            isBottom && 'rounded-t-3xl'
          )}>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {showClose && (
              <button 
                onClick={onClose}
                className={cn(
                  'p-2 -mr-2 -my-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500',
                  isBottom && 'absolute top-2 right-2'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
