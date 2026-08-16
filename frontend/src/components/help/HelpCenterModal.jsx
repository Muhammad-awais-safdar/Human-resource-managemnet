'use client';

import React, { useState } from 'react';
import { Dialog } from '../primitives/Dialog';
import { Input } from '../primitives/Input';
import { Button } from '../primitives/Button';
import { useProductTour } from '../../context/ProductTourContext';

export function HelpCenterModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { restartTour } = useProductTour();

  const tutorials = [
    {
      id: 'welcome-overview',
      title: 'Workspace Guided Overview',
      category: 'Getting Started',
      description: 'Learn how to navigate dashboards, switch tenants, and manage your quick operational workflows.',
      tourId: 'welcome-overview',
    },
    {
      id: 'roles-rbac',
      title: 'Roles & RBAC Permission Matrix',
      category: 'Administration',
      description: 'Configure custom workspace roles, feature groups, and action permissions safely.',
      tourId: 'roles-rbac',
    },
    {
      id: 'employee-directory',
      title: 'Workforce Directory & Onboarding',
      category: 'Employees',
      description: 'Add employees, configure profiles, and assign default role policies.',
      tourId: 'employee-directory',
    },
  ];

  const filtered = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Platform Help & Interactive Guides"
      description="Search documentation topics or launch interactive in-app guided workflows."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        <Input
          placeholder="Search help topics (e.g., RBAC, Employees, Payroll)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between gap-4 transition-all hover:border-slate-600"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    restartTour(item.tourId);
                  }}
                >
                  Learn How
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No matching tutorials found.</p>
          )}
        </div>
      </div>
    </Dialog>
  );
}
