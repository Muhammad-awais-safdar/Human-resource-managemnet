'use client';

import React, { useState } from 'react';
import apiClient from '../../../services/api';

export default function LogisticsDashboardPage() {
  const [drivingResult, setDrivingResult] = useState(null);
  const [allowanceResult, setAllowanceResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidateDriving = () => {
    setLoading(true);
    apiClient.get('/api/v1/logistics/driving-hours/validate?driverId=DRV-88&continuousDrivingHours=10.5&jurisdiction=US_DOT')
      .then(res => { if (res.success) setDrivingResult(res); })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleCalculateAllowance = () => {
    setLoading(true);
    apiClient.post('/api/v1/logistics/allowance/calculate', { distanceKm: 420.0, unitRate: 0.50 })
      .then(res => { if (res.success) setAllowanceResult(res); })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          🚚 Logistics, Fleet Transport & Supply Chain Hub
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          DOT/EU legal driving hours validator, telematics GPS sync, and Per-KM mileage allowance engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driving Hours Card */}
        <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">⏱️ Driver DOT / EU Legal Hours Monitor</h3>
          <p className="text-xs text-gray-400">Enforce legal driving hour limits and mandatory rest period compliance.</p>
          <button
            onClick={handleValidateDriving}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Validate Driver Shift Limits
          </button>
          {drivingResult && (
            <div className={`p-4 rounded-xl text-xs font-semibold border ${drivingResult.legalViolation ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              <div>Driver: {drivingResult.driverId} ({drivingResult.jurisdiction})</div>
              <div>Continuous Driving: {drivingResult.continuousDrivingHours} hrs (Max: {drivingResult.maxLegalHoursAllowed} hrs)</div>
              <div className="mt-2 font-bold">{drivingResult.statusMessage}</div>
            </div>
          )}
        </div>

        {/* Distance Allowance Card */}
        <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">🛣️ Per-Kilometer Mileage Allowance Engine</h3>
          <p className="text-xs text-gray-400">Calculate trip mileage allowances based on telematics distance data.</p>
          <button
            onClick={handleCalculateAllowance}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Calculate Distance Allowance
          </button>
          {allowanceResult && (
            <div className="p-4 rounded-xl bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div>Record ID: {allowanceResult.recordId}</div>
              <div>Distance: {allowanceResult.distanceKm} km @ ${allowanceResult.ratePerKm}/km</div>
              <div className="text-sm font-bold text-emerald-400">Total Allowance: ${allowanceResult.totalAllowance}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
