'use client';

import React from 'react';
import { Dialog } from '../primitives/Dialog';
import { Badge } from '../primitives/Badge';

export function WhatsNewModal({ isOpen, onClose }) {
  const releases = [
    {
      version: 'v2.5.0 - August 2026',
      title: 'Enterprise UI/UX Design System & Product Tour Engine',
      items: [
        { type: 'NEW', text: 'Centralized product tour framework with guided step-by-step interactive workflows.' },
        { type: 'NEW', text: '10-Step workspace onboarding wizard with persistent setup checklist.' },
        { type: 'IMPROVEMENT', text: 'Standardized WCAG 2.2 AA accessible component library and responsive mobile drawer.' },
        { type: 'IMPROVEMENT', text: 'Hierarchical human-readable RBAC permission matrix with developer key toggle.' },
      ],
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="What's New in Awais HR Enterprise"
      description="Recent platform improvements, new features, and optimization releases."
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {releases.map((rel, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">{rel.title}</h3>
              <span className="text-xs text-slate-400 font-mono">{rel.version}</span>
            </div>

            <div className="space-y-2">
              {rel.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Badge variant={item.type === 'NEW' ? 'primary' : 'success'} size="sm">
                    {item.type}
                  </Badge>
                  <span className="mt-0.5 leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
