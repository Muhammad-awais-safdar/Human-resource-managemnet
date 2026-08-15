'use client';

import React, { useState } from 'react';
import apiClient from '../../../services/api';

export default function ConstructionDashboardPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [gatePass, setGatePass] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckWeather = () => {
    setLoading(true);
    apiClient.get('/api/v1/construction/weather-check')
      .then(res => { if (res.success) setWeatherData(res); })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleGenerateGatePass = () => {
    setLoading(true);
    apiClient.post('/api/v1/construction/gate-pass/generate', { workerName: 'Alex Rivers', contractorCompany: 'Apex Build Corp' })
      .then(res => { if (res.success) setGatePass(res); })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          🏗️ Construction & Field Services Operations Hub
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Weather delay auto-attendance pause triggers and Subcontractor Gate Pass signed QR generator.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Check Card */}
        <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">🌧️ Weather Delay Auto-Attendance Pause</h3>
          <p className="text-xs text-gray-400">Monitor site OpenWeatherMap feed to trigger automated shift pauses during rainstorms.</p>
          <button
            onClick={handleCheckWeather}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Check Site Weather Trigger
          </button>
          {weatherData && (
            <div className={`p-4 rounded-xl text-xs font-semibold border ${weatherData.autoPauseAttendanceTriggered ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              <div>Site: {weatherData.siteName}</div>
              <div>Condition: {weatherData.weatherCondition}</div>
              <div className="mt-2 font-bold">{weatherData.policyMessage}</div>
            </div>
          )}
        </div>

        {/* Gate Pass QR Card */}
        <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-bold text-indigo-400">🎫 Subcontractor Gate Pass & QR Token</h3>
          <p className="text-xs text-gray-400">Generate signed, expiring QR access tokens for site labor workers.</p>
          <button
            onClick={handleGenerateGatePass}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Generate Signed QR Token
          </button>
          {gatePass && (
            <div className="p-4 rounded-xl bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="font-bold text-white">{gatePass.workerName} ({gatePass.contractorCompany})</div>
              <div className="font-mono text-indigo-400 text-[11px]">QR Token: {gatePass.qrToken}</div>
              <div className="text-[10px] text-gray-400">Expires: {gatePass.expiresAt}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
