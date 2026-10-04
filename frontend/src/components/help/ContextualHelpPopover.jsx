'use client';

import React, { useState } from 'react';

export function ContextualHelpPopover({ title, content, learnMoreTourId }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Help info: ${title}`}
        className="w-4 h-4 rounded-full bg-slate-200 hover:bg-blue-600 text-slate-600 hover:text-white text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
      >
        ?
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-6 top-0 z-[100] w-64 bg-white border border-slate-200 rounded-xl p-3.5 shadow-lg animate-fade-in text-slate-900">
            <h4 className="text-xs font-semibold text-slate-900 mb-1">{title}</h4>
            <p className="text-[11px] text-slate-600 leading-normal mb-2">{content}</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold uppercase tracking-wider cursor-pointer"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
