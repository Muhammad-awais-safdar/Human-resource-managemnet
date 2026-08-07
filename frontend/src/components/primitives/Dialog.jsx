import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 focus:outline-none',
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
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className, children, ...props }) {
  return <div className={cn('flex flex-col space-y-1 text-left mb-4', className)} {...props}>{children}</div>;
}

export function DialogTitle({ className, children, ...props }) {
  return <DialogPrimitive.Title className={cn('text-base font-bold text-[var(--text-primary)]', className)} {...props}>{children}</DialogPrimitive.Title>;
}

export function DialogDescription({ className, children, ...props }) {
  return <DialogPrimitive.Description className={cn('text-xs text-[var(--text-secondary)] leading-relaxed', className)} {...props}>{children}</DialogPrimitive.Description>;
}

export function DialogFooter({ className, children, ...props }) {
  return <div className={cn('flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] mt-6', className)} {...props}>{children}</div>;
}
