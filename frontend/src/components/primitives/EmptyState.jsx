import React from 'react';
import { Button } from './Button';

export function EmptyState({
  title = 'No Data Available',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-slate-900/60 border border-slate-800/80 rounded-xl ${className}`}
    >
      <div className="p-3.5 bg-slate-800/80 text-indigo-400 rounded-full mb-4 shadow-inner">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>

      <div className="flex items-center gap-3">
        {onSecondaryAction && (
          <Button variant="outline" size="sm" onClick={onSecondaryAction}>
            {secondaryActionLabel || 'Clear Filters'}
          </Button>
        )}

        {onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel || 'Add Item'}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ErrorState({
  title = 'Something Went Wrong',
  description = 'We encountered an error loading this resource. Technical details have been logged.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-rose-950/20 border border-rose-500/30 rounded-xl ${className}`}
    >
      <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full mb-3">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h3 className="text-sm font-bold text-rose-300 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
