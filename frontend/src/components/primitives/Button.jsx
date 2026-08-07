import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, icon: Icon, ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--accent-primary)] hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-[0.98]',
      secondary: 'bg-[var(--bg-surface-l2)] hover:bg-[var(--bg-surface-l3)] text-[var(--text-primary)] border border-[var(--border-subtle)] active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-[var(--bg-surface-l2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-[0.98]',
      danger: 'bg-[var(--accent-danger)] hover:bg-red-600 text-white shadow-md shadow-red-500/20 active:scale-[0.98]',
      outline: 'bg-transparent border border-[var(--border-strong)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] active:scale-[0.98]',
      success: 'bg-[var(--accent-success)] hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      md: 'h-9 px-4 text-xs font-semibold gap-2 rounded-lg',
      lg: 'h-11 px-5 text-sm font-semibold gap-2 rounded-xl',
      icon: 'h-9 w-9 p-0 flex items-center justify-center rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : Icon ? (
          <Icon className="w-4 h-4 text-current" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
