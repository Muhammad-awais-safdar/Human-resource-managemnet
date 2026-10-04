import React from 'react';
import { Card, CardTitle, StatCard } from '@/core/primitives/Card';
import { Button } from '@/core/primitives/Button';
import { FileText, Calendar, DollarSign, Download } from 'lucide-react';

export function ESSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Employee Self Service (ESS) Portal</h1>
        <p className="text-xs text-slate-500">Access payslips, tax forms, time-off balances & personal records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Available PTO Balance" value="18 Days" subtitle="Accrued for FY 2026" icon={<Calendar className="w-5 h-5 text-blue-600" />} />
        <StatCard title="Latest Payslip" value="$5,850.00" subtitle="September 2026" icon={<DollarSign className="w-5 h-5 text-emerald-600" />} />
        <StatCard title="Tax Filing Status" value="W-2 Ready" subtitle="Tax Year 2025" icon={<FileText className="w-5 h-5 text-indigo-600" />} />
      </div>

      <Card header={<CardTitle>Recent Payslips & Documents</CardTitle>}>
        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Payslip - September 2026</p>
              <p className="text-[11px] text-slate-400">Net Pay: $5,850.00 | Direct Deposit #9812</p>
            </div>
            <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>Download PDF</Button>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Payslip - August 2026</p>
              <p className="text-[11px] text-slate-400">Net Pay: $5,850.00 | Direct Deposit #9812</p>
            </div>
            <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>Download PDF</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
