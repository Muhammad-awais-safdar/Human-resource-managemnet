import React from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef(
  ({ className, type = 'text', error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center w-full">
          {Icon && (
            <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)] rounded-lg px-3 transition-all duration-150 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed',
              Icon && 'pl-9',
              error && 'border-[var(--accent-danger)] focus:border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] font-medium text-[var(--accent-danger)] leading-none mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
