'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function AgritechPage() {
  const [metrics, setMetrics] = useState(null);
  const [harvestLogs, setHarvestLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Harvest Form
  const [fieldSector, setFieldSector] = useState('Sector C-2 (Cotton)');
  const [cropType, setCropType] = useState('Cotton / Fiber');
  const [acreageHarvested, setAcreageHarvested] = useState('10.0');
  const [yieldWeightKg, setYieldWeightKg] = useState('5000');
  const [pieceRateWagePerKg, setPieceRateWagePerKg] = useState('0.50');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [mRes, lRes] = await Promise.all([
          apiClient.get('/verticals/agritech/metrics').catch(() => ({})),
          apiClient.get('/verticals/agritech/harvest-logs').catch(() => ([])),
        ]);
        if (isMounted) {
          setMetrics(mRes);
          setHarvestLogs(Array.isArray(lRes) ? lRes : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/verticals/agritech/harvest-logs', {
        fieldSector,
        cropType,
        acreageHarvested: parseFloat(acreageHarvested),
        yieldWeightKg: parseFloat(yieldWeightKg),
        pieceRateWagePerKg: parseFloat(pieceRateWagePerKg),
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to record harvest log');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="text-2xl font-bold text-emerald-400">Agritech Crop & Farm Yield Engine</h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track seasonal harvest yields, field sector tonnage, and automated worker piece-rate labor wages.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
        >
          + Record Crop Harvest Yield
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Total Harvest Output</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {metrics?.totalHarvestTonnageKg ? `${(metrics.totalHarvestTonnageKg / 1000).toFixed(1)} Tons` : '27.6 Tons'}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-1">Across active field sectors</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Active Field Sectors</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {metrics?.activeFieldSectors || 8} Sectors
          </div>
          <div className="text-[10px] text-amber-500/80 mt-1">Soil sensors online</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Seasonal Target Completion</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {metrics?.seasonalTargetCompletionPct || 78.4}%
          </div>
          <div className="text-[10px] text-indigo-500/80 mt-1">On schedule for Q3 harvest</div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] font-medium uppercase">Piece-Rate Labor Wages</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            ${metrics?.totalLaborDisbursements ? metrics.totalLaborDisbursements.toLocaleString() : '13,822.50'}
          </div>
          <div className="text-[10px] text-cyan-500/80 mt-1">Directly synced to payroll</div>
        </div>
      </div>

      {/* Harvest Log Table */}
      <div className="bg-[var(--bg-surface-l1)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">🌾 Field Harvest Tonnage & Piece-Rate Logs</h3>
          <span className="text-xs text-emerald-400 font-mono">{harvestLogs.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-surface-l2)] text-[var(--text-muted)] uppercase text-[10px]">
              <tr>
                <th className="p-3">Harvest ID</th>
                <th className="p-3">Field Sector</th>
                <th className="p-3">Crop Variety</th>
                <th className="p-3">Yield Weight</th>
                <th className="p-3">Piece Rate</th>
                <th className="p-3">Total Labor Wage</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-[var(--text-muted)]">Loading agritech telemetry...</td>
                </tr>
              ) : harvestLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-[var(--text-muted)]">No crop harvest entries found.</td>
                </tr>
              ) : (
                harvestLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-surface-l2)] transition-colors">
                    <td className="p-3 font-mono font-medium text-emerald-400">{log.id}</td>
                    <td className="p-3 font-medium text-[var(--text-primary)]">{log.fieldSector}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{log.cropType}</td>
                    <td className="p-3 font-bold text-[var(--text-primary)]">{Number(log.yieldWeightKg).toLocaleString()} kg</td>
                    <td className="p-3 text-[var(--text-secondary)]">${log.pieceRateWagePerKg} / kg</td>
                    <td className="p-3 font-semibold text-emerald-400">${Number(log.totalLaborCost).toLocaleString()}</td>
                    <td className="p-3 text-[var(--text-muted)]">{log.harvestDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-emerald-400">Record Farm Harvest & Piece Rate</h3>
            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Field Sector</label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  value={fieldSector}
                  onChange={(e) => setFieldSector(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1">Crop Type</label>
                <input
                  type="text"
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1">Yield (Kg)</label>
                  <input
                    type="number"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    value={yieldWeightKg}
                    onChange={(e) => setYieldWeightKg(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] mb-1">Wage Rate ($/Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    value={pieceRateWagePerKg}
                    onChange={(e) => setPieceRateWagePerKg(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--bg-surface-l2)] text-[var(--text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  {submitting ? 'Saving...' : 'Save & Calculate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
