'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DollarSign, Play, CheckCircle2, AlertCircle, FileText, Users, ArrowUpRight } from 'lucide-react';
import * as suiteService from '../../../services/suiteService';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/primitives/Card';
import { TableSkeleton } from '@/components/primitives/Skeleton';

export default function PayrollPage() {
  const [payslips, setPayslips] = useState([]);
  const [allPayslips, setAllPayslips] = useState([]);
  const [activeTab, setActiveTab] = useState('mine');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const loadPayslips = useCallback(() => {
    setLoading(true);
    Promise.all([
      suiteService.getPayslips().catch(() => []),
      suiteService.getAllPayslips().catch(() => []),
    ]).then(([mine, all]) => {
      setPayslips(mine);
      setAllPayslips(all);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayslips();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPayslips]);

  const handleRunPayroll = async () => {
    setRunning(true);
    setMessage('');
    try {
      const result = await suiteService.runPayroll();
      setLastResult(result);
      setMessage('✅ Payroll processed successfully!');
      loadPayslips();
    } catch (err) {
      setMessage('❌ ' + (err?.response?.data?.message || 'Failed to run payroll.'));
    } finally { setRunning(false); }
  };

  const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Payroll Engine</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Calculate statutory tax deductions, process salaries, and view employee payslips across the organization.
        </p>
      </div>

      {message && (
        <div className={`p-3 border rounded-lg text-xs flex items-center gap-2 ${message.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.startsWith('✅') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message}</span>
        </div>
      )}

      {/* RUN PAYROLL PANEL */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Run Automated Payroll Engine</CardTitle>
            <CardDescription>
              Calculates gross pay, statutory tax (10% threshold for gross &gt; $3,000), benefits, and net payouts.
            </CardDescription>
          </div>

          <Button 
            variant="success" 
            onClick={handleRunPayroll} 
            isLoading={running}
            icon={Play}
            size="md"
          >
            Run Payroll Batch
          </Button>
        </CardHeader>

        {lastResult && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-[var(--border-subtle)]">
            {[
              { label: 'Pay Period', value: lastResult.period, variant: 'primary' },
              { label: 'Gross Pay', value: formatCurrency(lastResult.gross), variant: 'purple' },
              { label: 'Tax Amount', value: formatCurrency(lastResult.taxAmount), variant: 'warning' },
              { label: 'Deductions', value: formatCurrency(lastResult.deductions), variant: 'danger' },
              { label: 'Net Salary', value: formatCurrency(lastResult.netSalary), variant: 'success' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">{label}</span>
                <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* PAYSLIP TABULAR VIEWS */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-2">
          <Button
            variant={activeTab === 'mine' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('mine')}
            icon={FileText}
          >
            My Payslips ({payslips.length})
          </Button>
          <Button
            variant={activeTab === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            icon={Users}
          >
            Organization All Payslips ({allPayslips.length})
          </Button>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : (
          <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-lg">
            {(activeTab === 'mine' ? payslips : allPayslips).length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--text-muted)]">
                No payslips generated for this tab context yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-surface-l2)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                      {activeTab === 'all' && <th className="py-3 px-4">Employee</th>}
                      {activeTab === 'all' && <th className="py-3 px-4">Work Email</th>}
                      <th className="py-3 px-4">Pay Period</th>
                      <th className="py-3 px-4">Net Salary</th>
                      <th className="py-3 px-4">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {(activeTab === 'mine' ? payslips : allPayslips).map((p, i) => (
                      <tr key={i} className="hover:bg-[var(--bg-surface-l2)]/50 transition-colors">
                        {activeTab === 'all' && (
                          <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{p.first_name} {p.last_name}</td>
                        )}
                        {activeTab === 'all' && (
                          <td className="py-3 px-4 text-[var(--text-secondary)]">{p.email}</td>
                        )}
                        <td className="py-3 px-4 font-mono text-[var(--text-primary)]">{p.pay_period}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400 font-mono">{formatCurrency(p.net_salary)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={p.status === 'PAID' ? 'success' : 'warning'}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
