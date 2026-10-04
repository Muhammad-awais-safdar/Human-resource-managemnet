import React from 'react';
import { Card } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Plus } from 'lucide-react';

export function RecruitmentPage() {
  const jobs = [
    { title: 'Senior Backend Engineer (Java)', department: 'Engineering', applicants: 48, status: 'IN_PROGRESS' },
    { title: 'Full Stack React Developer', department: 'UI/UX', applicants: 32, status: 'IN_PROGRESS' },
    { title: 'HR Generalist', department: 'People Ops', applicants: 19, status: 'COMPLETED' },
  ];

  const columns = [
    { header: 'Job Title', accessor: 'title', sortable: true },
    { header: 'Department', accessor: 'department', sortable: true },
    { header: 'Applicants', accessor: 'applicants', sortable: true },
    { header: 'Status', accessor: 'status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Recruitment & ATS Pipeline</h1>
          <p className="text-xs text-slate-500">Track job requisitions, candidate stages, and interview schedules</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Post Job Requisition</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={jobs} pageSize={5} />
      </Card>
    </div>
  );
}
