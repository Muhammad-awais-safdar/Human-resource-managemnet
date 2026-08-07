import React from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-lg shadow-black/20 transition-all duration-200 hover:border-[var(--border-strong)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('flex justify-between items-center pb-3 border-b border-[var(--border-subtle)] mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-sm font-bold text-[var(--text-primary)] tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}
