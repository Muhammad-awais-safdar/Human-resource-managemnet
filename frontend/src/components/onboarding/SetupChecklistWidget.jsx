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
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Workspace Setup Progress
          </span>
          <h4 className="text-sm font-semibold text-slate-900 mt-0.5">Quick Setup Checklist</h4>
        </div>
        <button
          type="button"
          onClick={onOpenWizard}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
        >
          Resume Setup Wizard
        </button>
      </div>

      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              item.completed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                item.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
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
