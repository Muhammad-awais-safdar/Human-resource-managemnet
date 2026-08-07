import React from 'react';
import { cn } from '@/utils/cn';

export function Badge({ className, variant = 'default', children, icon: Icon, ...props }) {
  const variants = {
    default: 'bg-[var(--bg-surface-l2)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border select-none transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
