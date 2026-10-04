import React from 'react';
import { Card } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { Badge } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Plus } from 'lucide-react';

export function RolesPage() {
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system control & multi-tenant operations', permissions: 'ALL_PERMISSIONS', usersCount: 2 },
    { name: 'HR_MANAGER', description: 'Employee management, onboarding & payroll approvals', permissions: 'HR_READ, HR_WRITE, PAYROLL_RUN', usersCount: 8 },
    { name: 'FINANCE_LEAD', description: 'Payroll processing, tax calculations & expense claims', permissions: 'PAYROLL_ALL, EXPENSE_APPROVE', usersCount: 4 },
    { name: 'EMPLOYEE', description: 'Self service access, leave requests & profile management', permissions: 'ESS_READ, LEAVE_REQUEST', usersCount: 1406 },
  ];

  const columns = [
    { header: 'Role Code', accessor: 'name', render: (row) => <Badge variant="primary">{row.name}</Badge> },
    { header: 'Description', accessor: 'description' },
    { header: 'Assigned Users', accessor: 'usersCount', sortable: true },
    { header: 'Granted Permissions', accessor: 'permissions' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Roles & RBAC Matrix</h1>
          <p className="text-xs text-slate-500">Manage granular user access privileges</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Create Role</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={roles} pageSize={10} />
      </Card>
    </div>
  );
}
