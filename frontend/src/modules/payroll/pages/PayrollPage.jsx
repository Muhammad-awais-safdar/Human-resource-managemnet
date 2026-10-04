import React, { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/core/primitives/Card';
import { DataTable } from '@/core/primitives/DataTable';
import { StatusPill } from '@/core/primitives/Badge';
import { Button } from '@/core/primitives/Button';
import { Play, RefreshCw } from 'lucide-react';
import { payrollService } from '../services/payrollService';

export function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);

  const fetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollService.getPayrollRuns();
      const list = Array.isArray(response)
        ? response
        : response?.data || response?.runs || [];
      setPayrollRuns(list);
    } catch (err) {
      setError(err.message || 'Failed to load payroll runs from server.');
      setPayrollRuns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleExecutePayroll = async () => {
    setExecuting(true);
    try {
      await payrollService.executePayrollRun({ period: new Date().toISOString().substring(0, 7) });
      fetchPayroll();
    } catch (err) {
      alert(err.message || 'Error executing payroll run.');
    } finally {
      setExecuting(false);
    }
  };

  const columns = [
    { header: 'Payroll Period', accessor: (row) => row.period || row.month || 'Current Period', sortable: true },
    { header: 'Disbursement Amount', accessor: (row) => row.totalAmount || row.disbursementAmount || '$0.00', sortable: true },
    { header: 'Employees Count', accessor: (row) => row.employeesCount || row.employeeCount || 0, sortable: true },
    { header: 'Payment Date', accessor: (row) => row.date || row.createdAt || 'N/A' },
    { header: 'Status', accessor: (row) => <StatusPill status={row.status || 'COMPLETED'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Payroll Disbursement Engine</h1>
          <p className="text-xs text-slate-500">Live payroll records from Spring Boot API backend</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchPayroll}>
            Refresh
          </Button>
          <Button leftIcon={<Play className="w-4 h-4" />} onClick={handleExecutePayroll} disabled={executing}>
            {executing ? 'Executing...' : 'Execute Payroll Run'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <Card header={<CardTitle>Payroll Execution History</CardTitle>}>
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading payroll runs...</div>
        ) : (
          <DataTable columns={columns} data={payrollRuns} pageSize={5} />
        )}
      </Card>
    </div>
  );
}
