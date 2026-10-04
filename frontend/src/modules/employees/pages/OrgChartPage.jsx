import React from 'react';
import { Card } from '@/core/primitives/Card';

export function OrgChartPage() {
  const treeData = {
    name: 'Muhammad Awais',
    role: 'Chief Executive Officer / Founder',
    department: 'Executive Office',
    reports: [
      {
        name: 'Sarah Jenkins',
        role: 'Director of HR',
        department: 'Human Resources',
        reports: [
          { name: 'Ali Raza', role: 'HR Manager', department: 'People Operations' },
          { name: 'Ayesha Khan', role: 'Talent Acquisition Lead', department: 'Recruitment' },
        ],
      },
      {
        name: 'Zeeshan Ali',
        role: 'VP of Engineering',
        department: 'Technology',
        reports: [
          { name: 'Usman Farooq', role: 'QA Lead', department: 'Quality Assurance' },
          { name: 'Hamza Tariq', role: 'Backend Tech Lead', department: 'Engineering' },
        ],
      },
    ],
  };

  const renderNode = (node) => (
    <div key={node.name} className="flex flex-col items-center space-y-2">
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-500 transition-colors w-64 text-center">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto text-xs mb-2">
          {node.name[0]}
        </div>
        <h4 className="text-xs font-bold text-slate-900">{node.name}</h4>
        <p className="text-[11px] text-blue-600 font-semibold">{node.role}</p>
        <span className="text-[10px] text-slate-400">{node.department}</span>
      </div>

      {node.reports && node.reports.length > 0 && (
        <div className="flex flex-col items-center space-y-2">
          <div className="w-0.5 h-4 bg-slate-300"></div>
          <div className="flex gap-6 items-start">
            {node.reports.map((child) => renderNode(child))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Organizational Hierarchy</h1>
        <p className="text-xs text-slate-500">Visual corporate structure & reporting lines</p>
      </div>

      <Card className="overflow-x-auto p-8">
        <div className="min-w-[800px] flex justify-center">{renderNode(treeData)}</div>
      </Card>
    </div>
  );
}
