import React from 'react';
import { Card } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Plus } from 'lucide-react';

export function ExpensesPage() {
  const expenses = [
    { title: 'AWS Cloud Infrastructure Summit', category: 'Travel & Conference', amount: '$450.00', date: '2026-09-20', status: 'APPROVED' },
    { title: 'Client Team Dinner', category: 'Meals & Entertainment', amount: '$180.00', date: '2026-09-25', status: 'PENDING' },
    { title: 'Software Subscription (JetBrains)', category: 'Tools & Software', amount: '$299.00', date: '2026-09-10', status: 'APPROVED' },
  ];

  const columns = [
    { header: 'Expense Description', accessor: 'title', sortable: true },
    { header: 'Category', accessor: 'category', sortable: true },
    { header: 'Amount', accessor: 'amount', sortable: true },
    { header: 'Submission Date', accessor: 'date' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Expense Management</h1>
          <p className="text-xs text-slate-500">Submit receipt claims for reimbursement</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>File Expense Claim</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={expenses} pageSize={5} />
      </Card>
    </div>
  );
}
