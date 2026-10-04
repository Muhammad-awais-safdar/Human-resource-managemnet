import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef(({ className, children, side = 'right', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/40 animate-in fade-in duration-200" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-white border-slate-200 p-6 shadow-xl transition ease-in-out duration-200 overflow-y-auto flex flex-col text-slate-900',
        side === 'right' && 'right-0 top-0 h-full w-full max-w-lg border-l animate-in slide-in-from-right',
        side === 'left' && 'left-0 top-0 h-full w-full max-w-lg border-r animate-in slide-in-from-left',
        side === 'bottom' && 'bottom-0 inset-x-0 h-auto max-h-[85vh] rounded-t-2xl border-t animate-in slide-in-from-bottom',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none">
        <X className="w-4 h-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

export function SheetHeader({ className, children, ...props }) {
  return <div className={cn('flex flex-col space-y-1 text-left pb-4 border-b border-slate-100 mb-4', className)} {...props}>{children}</div>;
}

export function SheetTitle({ className, children, ...props }) {
  return <DialogPrimitive.Title className={cn('text-base font-semibold text-slate-900', className)} {...props}>{children}</DialogPrimitive.Title>;
}

export function SheetDescription({ className, children, ...props }) {
  return <DialogPrimitive.Description className={cn('text-xs text-slate-500 leading-relaxed', className)} {...props}>{children}</DialogPrimitive.Description>;
}
