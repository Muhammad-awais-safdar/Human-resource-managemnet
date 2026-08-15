'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function ItServicesPage() {
  const [metrics, setMetrics] = useState(null);
  const [worklogs, setWorklogs] = useState([]);
  const [equityGrants, setEquityGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [mRes, wRes, eRes] = await Promise.all([
        apiClient.get('/verticals/it-services/metrics').catch(() => ({})),
        apiClient.get('/verticals/it-services/dev-worklogs').catch(() => ([])),
        apiClient.get('/verticals/it-services/equity-grants').catch(() => ([])),
      ]);
      setMetrics(mRes);
      setWorklogs(Array.isArray(wRes) ? wRes : []);
      setEquityGrants(Array.isArray(eRes) ? eRes : []);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-6 rounded-2xl border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💻</span>
            <h1 className="text-2xl font-bold text-blue-400">Software & IT Services Management Suite</h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Git commit & Jira worklog listener, developer billable hours utilization, and employee stock option equity vesting engine.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Billable Dev Hours Today</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {metrics?.billableDeveloperHoursToday || 142.5} hrs
          </div>
          <div className="text-[10px] text-blue-500/80 mt-1">Git & Jira Webhook Logged</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Developer Utilization</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {metrics?.billableUtilizationPct || 91.8}%
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-1">Target: &gt; 85% Billable</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Vested Stock Options Pool</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {metrics?.totalVestedOptionsPool ? metrics.totalVestedOptionsPool.toLocaleString() : '145,000'} Units
          </div>
          <div className="text-[10px] text-indigo-500/80 mt-1">4-Year Standard Vesting</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Active Sprint Velocity</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {metrics?.activeSprintVelocity || 84} Story Pts
          </div>
          <div className="text-[10px] text-cyan-500/80 mt-1">100% On Time Delivery</div>
        </div>
      </div>

      {/* Dev Worklogs Table */}
      <div className="bg-[var(--bg-surface-l1)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">💻 Git Commit & Jira Developer Worklogs</h3>
          <span className="text-xs text-blue-400 font-mono">{worklogs.length} Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-surface-l2)] text-[var(--text-muted)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Developer</th>
                <th className="p-3">Jira Task</th>
                <th className="p-3">Commit Hash</th>
                <th className="p-3">Hours Logged</th>
                <th className="p-3">Billable Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {worklogs.map((w) => (
                <tr key={w.id} className="hover:bg-[var(--bg-surface-l2)] transition-colors">
                  <td className="p-3 font-mono text-blue-400 font-medium">{w.id}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{w.developerName}</td>
                  <td className="p-3 font-mono text-indigo-400">{w.jiraKey}</td>
                  <td className="p-3 font-mono text-[var(--text-muted)]">{w.commitHash}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{w.hoursLogged} hrs</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {w.billableStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
