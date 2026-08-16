import React from 'react';

export function Skeleton({ className = '', variant = 'text', width, height, ...props }) {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-lg w-full',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`animate-pulse bg-slate-800/80 ${variantStyles[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex gap-4 border-b border-slate-800 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-5" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <Skeleton variant="text" className="h-3 w-1/2" />
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
