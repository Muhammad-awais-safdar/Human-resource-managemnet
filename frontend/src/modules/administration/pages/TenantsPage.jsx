import React from 'react';
import { Card } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Plus } from 'lucide-react';

export function TenantsPage() {
  const tenants = [
    { name: 'Awais HR Tech Solutions', subdomain: 'awais-hr', plan: 'ENTERPRISE', status: 'ACTIVE', users: 1420 },
    { name: 'Nexus Global Logistics', subdomain: 'nexus-logistics', plan: 'BUSINESS', status: 'ACTIVE', users: 380 },
    { name: 'Apex Financial Systems', subdomain: 'apex-fin', plan: 'ENTERPRISE', status: 'ACTIVE', users: 890 },
    { name: 'Vortex Cloud Inc', subdomain: 'vortex-cloud', plan: 'STARTER', status: 'PENDING', users: 45 },
  ];

  const columns = [
    { header: 'Tenant Name', accessor: 'name', sortable: true },
    { header: 'Subdomain', accessor: 'subdomain', render: (row) => `${row.subdomain}.hrm.com` },
    { header: 'Subscription Tier', accessor: 'plan', sortable: true },
    { header: 'Enrolled Employees', accessor: 'users', sortable: true },
    { header: 'Status', accessor: 'status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Tenant Management</h1>
          <p className="text-xs text-slate-500">SuperAdmin multi-tenant SaaS provisioning & subscription management</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Provision Tenant</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={tenants} pageSize={5} />
      </Card>
    </div>
  );
}
