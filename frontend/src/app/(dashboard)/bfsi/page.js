'use client';

import React, { useState } from 'react';
import apiClient from '../../../services/api';

export default function BFSIDashboardPage() {
  const [xmlResult, setXmlResult] = useState(null);
  const [makerCheckerMsg, setMakerCheckerMsg] = useState('');
  const [blockLeaveResult, setBlockLeaveResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateIso20022 = () => {
    setLoading(true);
    apiClient.post('/api/v1/bfsi/disbursement/iso20022-xml', { totalAmount: 75000.00 })
      .then(res => { if (res.success) setXmlResult(res); })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleMakerCheckerRequest = () => {
    setLoading(true);
    apiClient.post('/api/v1/bfsi/maker-checker/request', {
      makerEmployeeId: 'EMP-MAKER-01',
      requestType: 'SALARY_REVISION',
      entityId: 'EMP-SALARY-101',
      changePayload: '{"oldSalary": 100000, "newSalary": 120000}'
    })
      .then(res => { if (res.success) setMakerCheckerMsg(`Created Request: ${res.requestId} (Status: ${res.status})`); })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleValidateBlockLeave = () => {
    setLoading(true);
    apiClient.post('/api/v1/bfsi/block-leave/validate', { requestedDays: 10, isSensitiveRole: true })
      .then(res => { if (res.success) setBlockLeaveResult(res); })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          🏦 Banking, Financial Services & Insurance (BFSI) Hub
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          ISO 20022 XML direct bank disbursement generator, Maker-Checker dual authorization, and 10-day block leave enforcement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ISO 20022 Card */}
        <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">📄 Direct Bank Disbursement ISO 20022 XML</h3>
          <p className="text-xs text-gray-400">Generate Raast/ACH schema-compliant ISO 20022 pain.001.001.03 payment file.</p>
          <button
            onClick={handleGenerateIso20022}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Generate ISO 20022 XML
          </button>
          {xmlResult && (
            <pre className="p-3 bg-[var(--bg-primary)] rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-40">
              {xmlResult.xmlContent}
            </pre>
          )}
        </div>

        {/* Maker-Checker Card */}
        <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">👥 Maker-Checker Dual Authorization</h3>
          <p className="text-xs text-gray-400">Enforce two-person dual approvals for salary revisions and payment disbursements.</p>
          <button
            onClick={handleMakerCheckerRequest}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Create Salary Change Request
          </button>
          {makerCheckerMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              ✅ {makerCheckerMsg}
            </div>
          )}
        </div>

        {/* Block Leave Card */}
        <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">🏖️ 10-Day Mandatory Block Leave</h3>
          <p className="text-xs text-gray-400">Verify regulatory consecutive block leave compliance for sensitive roles.</p>
          <button
            onClick={handleValidateBlockLeave}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Validate Leave Compliance
          </button>
          {blockLeaveResult && (
            <div className={`p-3 rounded-lg text-xs font-semibold border ${blockLeaveResult.compliant ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
              {blockLeaveResult.policyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
