'use client';

import React from 'react';

export function SetupChecklistWidget({ onOpenWizard }) {
  const items = [
    { title: 'Company Profile & Domain', completed: true },
    { title: 'Industry Vertical Capabilities', completed: true },
    { title: 'Add Initial Employees', completed: true },
    { title: 'Configure Attendance & Shifts', completed: false },
    { title: 'Assign Custom Role Permissions', completed: false },
  ];

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div
      data-tour="setup-checklist-widget"
      className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-5 shadow-lg shadow-indigo-950/20"
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
            Workspace Setup Progress
          </span>
          <h4 className="text-sm font-bold text-white mt-0.5">Quick Setup Checklist</h4>
        </div>
        <button
          type="button"
          onClick={onOpenWizard}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
        >
          Resume Setup Wizard
        </button>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
        <div
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              item.completed
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                item.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {item.completed ? '✓' : idx + 1}
            </span>
            <span className="truncate">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
