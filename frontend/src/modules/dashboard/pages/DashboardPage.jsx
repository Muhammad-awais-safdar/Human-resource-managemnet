import React from 'react';
import { StatCard, Card, CardTitle, CardDescription } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Users, CreditCard, Calendar, CheckSquare } from 'lucide-react';

export function DashboardPage() {
  const employeeData = [
    { id: 'EMP-101', name: 'Muhammad Awais', role: 'Engineering Lead', department: 'Technology', status: 'ACTIVE' },
    { id: 'EMP-102', name: 'Sarah Jenkins', role: 'Senior HR Manager', department: 'Human Resources', status: 'ACTIVE' },
    { id: 'EMP-103', name: 'Zeeshan Ali', role: 'DevOps Architect', department: 'Infrastructure', status: 'ACTIVE' },
    { id: 'EMP-104', name: 'Fatima Noor', role: 'Product Designer', department: 'UI/UX', status: 'PENDING' },
    { id: 'EMP-105', name: 'Usman Farooq', role: 'QA Automation Lead', department: 'Quality Assurance', status: 'ACTIVE' },
  ];

  const columns = [
    { header: 'Employee ID', accessor: 'id', sortable: true },
    { header: 'Employee Name', accessor: 'name', sortable: true },
    { header: 'Role', accessor: 'role', sortable: true },
    { header: 'Department', accessor: 'department', sortable: true },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusPill status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workforce"
          value="1,420"
          subtitle="+12 new hires this month"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          trend="8.4%"
          trendDirection="up"
          status="primary"
        />
        <StatCard
          title="Monthly Payroll"
          value="$248,500"
          subtitle="Processed on 28th Sep"
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
          trend="2.1%"
          trendDirection="up"
          status="success"
        />
        <StatCard
          title="Pending Approvals"
          value="18"
          subtitle="Requires Manager Action"
          icon={<CheckSquare className="w-5 h-5 text-amber-600" />}
          status="warning"
        />
        <StatCard
          title="Leave Requests"
          value="5 Active"
          subtitle="On PTO today"
          icon={<Calendar className="w-5 h-5 text-indigo-600" />}
          status="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card
            header={
              <div>
                <CardTitle>Directory & Workforce Status</CardTitle>
                <CardDescription>Live synchronized corporate employee database</CardDescription>
              </div>
            }
          >
            <DataTable columns={columns} data={employeeData} pageSize={5} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card
            header={
              <div>
                <CardTitle>Quick System Actions</CardTitle>
                <CardDescription>Enterprise workflow execution</CardDescription>
              </div>
            }
          >
            <div className="space-y-2">
              <button type="button" className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Add New Employee</p>
                  <p className="text-[11px] text-slate-500">Trigger onboarding workflow</p>
                </div>
                <Users className="w-4 h-4 text-blue-600" />
              </button>

              <button type="button" className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Run Monthly Payroll</p>
                  <p className="text-[11px] text-slate-500">Calculate salaries & tax withholding</p>
                </div>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </button>

              <button type="button" className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Review Leave Requests</p>
                  <p className="text-[11px] text-slate-500">18 pending manager sign-offs</p>
                </div>
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
