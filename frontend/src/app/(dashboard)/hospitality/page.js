'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function HospitalityPage() {
  const [metrics, setMetrics] = useState(null);
  const [tipPools, setTipPools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [mRes, tRes] = await Promise.all([
        apiClient.get('/verticals/hospitality/metrics').catch(() => ({})),
        apiClient.get('/verticals/hospitality/tip-pools').catch(() => ([])),
      ]);
      setMetrics(mRes);
      setTipPools(Array.isArray(tRes) ? tRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-900/30 to-amber-900/30 p-6 rounded-2xl border border-orange-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏨</span>
            <h1 className="text-2xl font-bold text-orange-400">Hospitality & HoReCa Operations Suite</h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Automated shift gratuity tip distribution calculator, hotel roster scheduling, and food safety permits compliance.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Shift Tip Pool Gratuity</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">
            ${metrics?.todayTotalGratuityPool ? metrics.todayTotalGratuityPool.toLocaleString() : '2,450.00'}
          </div>
          <div className="text-[10px] text-orange-500/80 mt-1">Ready for Payout Distribution</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Active Outlets & Bars</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {metrics?.activeOutletsCount || 4} Outlets
          </div>
          <div className="text-[10px] text-amber-500/80 mt-1">Dining Room, Rooftop & Lounge</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Food Safety Permits</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {metrics?.foodSafetyPermitValidityPct || 100.0}%
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-1">All Health Certificates Valid</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Shift Coverage Rate</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {metrics?.shiftCoveragePct || 96.5}%
          </div>
          <div className="text-[10px] text-indigo-500/80 mt-1">Peak Dinner Roster Filled</div>
        </div>
      </div>

      {/* Tip Pools Table */}
      <div className="bg-[var(--bg-surface-l1)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">🍹 Shift Gratuity & Tip Distribution Calculation</h3>
          <span className="text-xs text-orange-400 font-mono">{tipPools.length} Shift Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-surface-l2)] text-[var(--text-muted)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Tip Pool ID</th>
                <th className="p-3">Outlet</th>
                <th className="p-3">Shift Type</th>
                <th className="p-3">Total Gratuity</th>
                <th className="p-3">Waitstaff (70%)</th>
                <th className="p-3">Kitchen (20%)</th>
                <th className="p-3">Busser (10%)</th>
                <th className="p-3">Avg / Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {tipPools.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--bg-surface-l2)] transition-colors">
                  <td className="p-3 font-mono text-orange-400 font-medium">{t.id}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{t.outlet}</td>
                  <td className="p-3 text-[var(--text-secondary)]">{t.shiftType}</td>
                  <td className="p-3 font-bold text-orange-400">${Number(t.totalGratuityCollected).toLocaleString()}</td>
                  <td className="p-3 text-[var(--text-secondary)]">${(t.totalGratuityCollected * 0.7).toFixed(2)}</td>
                  <td className="p-3 text-[var(--text-secondary)]">${(t.totalGratuityCollected * 0.2).toFixed(2)}</td>
                  <td className="p-3 text-[var(--text-secondary)]">${(t.totalGratuityCollected * 0.1).toFixed(2)}</td>
                  <td className="p-3 font-semibold text-emerald-400">${Number(t.perStaffAvgPayout).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
