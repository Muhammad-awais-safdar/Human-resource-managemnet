import React from 'react';
import { Card, CardTitle, StatCard } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { Badge } from '@/core/primitives/Badge';
import { Award, Target, TrendingUp } from 'lucide-react';

export function PerformancePage() {
  const reviews = [
    { employee: 'Muhammad Awais', cycle: 'Q3 2026 Appraisal', rating: '5.0 / 5.0 (Exceeds Expectations)', reviewer: 'Executive Board', status: 'COMPLETED' },
    { employee: 'Sarah Jenkins', cycle: 'Q3 2026 Appraisal', rating: '4.8 / 5.0 (Exceeds Expectations)', reviewer: 'Muhammad Awais', status: 'COMPLETED' },
    { employee: 'Ali Raza', cycle: 'Q3 2026 Appraisal', rating: '4.5 / 5.0 (Meets Expectations)', reviewer: 'Sarah Jenkins', status: 'IN_PROGRESS' },
  ];

  const columns = [
    { header: 'Employee', accessor: 'employee', sortable: true },
    { header: 'Review Cycle', accessor: 'cycle' },
    { header: 'Overall Rating', accessor: 'rating' },
    { header: 'Reviewer', accessor: 'reviewer' },
    { header: 'Status', accessor: 'status', render: (row) => <Badge variant="primary">{row.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Performance Appraisals & OKRs</h1>
        <p className="text-xs text-slate-500">360-degree reviews, goal tracking & performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Company OKR Progress" value="84%" subtitle="Q3 2026 Targets" icon={<Target className="w-5 h-5 text-blue-600" />} />
        <StatCard title="Reviews Completed" value="1,240 / 1,420" subtitle="92% Completion" icon={<Award className="w-5 h-5 text-emerald-600" />} />
        <StatCard title="Top Performers" value="142 Staff" subtitle="Rated Exceeds" icon={<TrendingUp className="w-5 h-5 text-purple-600" />} />
      </div>

      <Card header={<CardTitle>Performance Review Submissions</CardTitle>}>
        <DataTable columns={columns} data={reviews} pageSize={5} />
      </Card>
    </div>
  );
}
