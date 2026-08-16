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
        className="w-4 h-4 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
      >
        ?
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-6 top-0 z-[100] w-64 bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-2xl animate-fade-in">
            <h4 className="text-xs font-bold text-white mb-1">{title}</h4>
            <p className="text-[11px] text-slate-300 leading-normal mb-2">{content}</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
