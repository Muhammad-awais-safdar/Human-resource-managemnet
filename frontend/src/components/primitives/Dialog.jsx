import React, { useEffect } from 'react';

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full ${maxWidth} bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-6 ${className}`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 id="dialog-title" className="text-lg font-bold text-white">
                {title}
              </h2>
            )}
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = '' }) {
  return <div className={`mb-4 pb-2 border-b border-slate-800 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = '' }) {
  return <h3 className={`text-base font-bold text-white ${className}`}>{children}</h3>;
}

export function DialogDescription({ children, className = '' }) {
  return <p className={`text-xs text-slate-400 mt-1 ${className}`}>{children}</p>;
}

export function DialogContent({ children, className = '' }) {
  return <div className={`py-2 ${className}`}>{children}</div>;
}

export function DialogFooter({ children, className = '' }) {
  return <div className={`mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2 ${className}`}>{children}</div>;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionStyles = {
    right: 'right-0 top-0 bottom-0 border-l',
    left: 'left-0 top-0 bottom-0 border-r',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`fixed ${positionStyles[position]} w-full ${maxWidth} bg-slate-900 border-slate-800 shadow-2xl p-6 flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
