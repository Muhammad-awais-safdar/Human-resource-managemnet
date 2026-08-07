import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef(({ className, children, side = 'right', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-[var(--bg-surface-l1)] border-[var(--border-strong)] p-6 shadow-2xl transition ease-in-out duration-300 overflow-y-auto flex flex-col',
        side === 'right' && 'right-0 top-0 h-full w-full max-w-lg border-l animate-in slide-in-from-right',
        side === 'left' && 'left-0 top-0 h-full w-full max-w-lg border-r animate-in slide-in-from-left',
        side === 'bottom' && 'bottom-0 inset-x-0 h-auto max-h-[85vh] rounded-t-2xl border-t animate-in slide-in-from-bottom',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-l2)] transition-colors focus:outline-none">
        <X className="w-4 h-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

export function SheetHeader({ className, children, ...props }) {
  return <div className={cn('flex flex-col space-y-1 text-left pb-4 border-b border-[var(--border-subtle)] mb-4', className)} {...props}>{children}</div>;
}

export function SheetTitle({ className, children, ...props }) {
  return <DialogPrimitive.Title className={cn('text-base font-bold text-[var(--text-primary)]', className)} {...props}>{children}</DialogPrimitive.Title>;
}

export function SheetDescription({ className, children, ...props }) {
  return <DialogPrimitive.Description className={cn('text-xs text-[var(--text-secondary)] leading-relaxed', className)} {...props}>{children}</DialogPrimitive.Description>;
}
