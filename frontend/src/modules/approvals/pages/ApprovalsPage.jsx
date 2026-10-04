import React from 'react';
import { Card } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Check, X } from 'lucide-react';

export function ApprovalsPage() {
  const requests = [
    { id: 'REQ-101', type: 'Annual Leave', requester: 'Sarah Jenkins', details: '3 days (Oct 12 - Oct 14)', status: 'PENDING' },
    { id: 'REQ-102', type: 'Expense Claim', requester: 'Ali Raza', details: '$340.00 (Client Dinner)', status: 'PENDING' },
    { id: 'REQ-103', type: 'Equipment Request', requester: 'Usman Farooq', details: 'MacBook Pro M3 Max 36GB', status: 'PENDING' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Request Type', accessor: 'type', sortable: true },
    { header: 'Requester', accessor: 'requester', sortable: true },
    { header: 'Details', accessor: 'details' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusPill status={row.status} /> },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="success" leftIcon={<Check className="w-3.5 h-3.5" />}>Approve</Button>
          <Button size="sm" variant="danger" leftIcon={<X className="w-3.5 h-3.5" />}>Reject</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Approvals Queue</h1>
        <p className="text-xs text-slate-500">Manager sign-offs for leave, expenses, and equipment</p>
      </div>

      <Card>
        <DataTable columns={columns} data={requests} pageSize={5} />
      </Card>
    </div>
  );
}
