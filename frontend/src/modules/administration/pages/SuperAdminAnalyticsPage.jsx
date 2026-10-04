import React from 'react';
import { StatCard, Card, CardTitle } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { Building2, Users, Cpu, ShieldCheck } from 'lucide-react';

export function SuperAdminAnalyticsPage() {
  const systemMetrics = [
    { metric: 'Database Connection Pool', status: 'Healthy (14 / 50 active)', responseTime: '2.4 ms' },
    { metric: 'Redis Cache Hit Ratio', status: '98.4%', responseTime: '0.8 ms' },
    { metric: 'Spring Security Token Validation', status: 'Optimal', responseTime: '4.1 ms' },
  ];

  const columns = [
    { header: 'Subsystem Metric', accessor: 'metric', sortable: true },
    { header: 'Health Status', accessor: 'status' },
    { header: 'Latency', accessor: 'responseTime', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform System Telemetry</h1>
        <p className="text-xs text-slate-500">SuperAdmin multi-tenant monitoring & backend health</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Active Tenants" value="42 SaaS Orgs" subtitle="All Healthy" icon={<Building2 className="w-5 h-5 text-blue-600" />} />
        <StatCard title="Total Users Across Tenants" value="18,450" subtitle="Active sessions: 420" icon={<Users className="w-5 h-5 text-emerald-600" />} />
        <StatCard title="Backend Latency" value="12ms avg" subtitle="Spring Boot 3.3" icon={<Cpu className="w-5 h-5 text-indigo-600" />} />
        <StatCard title="Security Status" value="Zero Outages" subtitle="RBAC Enforced" icon={<ShieldCheck className="w-5 h-5 text-teal-600" />} />
      </div>

      <Card header={<CardTitle>Real-Time Component Telemetry</CardTitle>}>
        <DataTable columns={columns} data={systemMetrics} pageSize={5} />
      </Card>
    </div>
  );
}
