import React from 'react';
import { cn } from '@/utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('bg-[var(--bg-surface-l2)]/80 animate-pulse rounded-lg', className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
      <Skeleton className="h-9 w-full mb-2" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
