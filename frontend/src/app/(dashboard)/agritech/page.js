'use client';

import React, { useState } from 'react';
import { 
  Sprout, Wheat, Tractor, DollarSign, Calculator, CheckCircle2, 
  Sparkles, Layers, ShieldCheck, ArrowRight, BarChart3, Users, Calendar
} from 'lucide-react';

export default function AgritechCropYieldPage() {
  const [formData, setFormData] = useState({
    harvesterEmail: 'worker@farm.com',
    cropType: 'Organic Apples',
    kgHarvested: 350.0,
    ratePerKg: 0.40
  });

  const [loading, setLoading] = useState(false);
  const [lastLogResult, setLastLogResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample Field & Yield Logs Data
  const [fields] = useState([
    { id: 'FLD-101', name: 'North Orchard Sector 4', crop: 'Organic Apples', acres: 45, crewCount: 18, yieldTarget: '45.0 Tons', harvestStatus: 'IN_PROGRESS', readiness: 92 },
    { id: 'FLD-102', name: 'East Valley Plot B', crop: 'Sweet Corn', acres: 80, crewCount: 25, yieldTarget: '120.0 Tons', harvestStatus: 'READY', readiness: 98 },
    { id: 'FLD-103', name: 'Highland Berry Field', crop: 'Strawberries', acres: 30, crewCount: 14, yieldTarget: '18.5 Tons', harvestStatus: 'IN_PROGRESS', readiness: 88 },
    { id: 'FLD-104', name: 'West Terraces', crop: 'Arabica Coffee', acres: 60, crewCount: 32, yieldTarget: '28.0 Tons', harvestStatus: 'SCHEDULED', readiness: 75 },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kgHarvested' || name === 'ratePerKg' ? parseFloat(value) || 0 : value
    }));
  };

  const handleLogHarvest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setLastLogResult(null);

    try {
      const token = localStorage.getItem('token');
      const tenant = localStorage.getItem('tenant_subdomain') || 'awais';

      const res = await fetch('/api/v1/verticals/agriculture/crop-yield/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(tenant && { 'X-Tenant': tenant, 'X-Tenant-ID': tenant })
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to log crop yield harvest entry');
      }

      setLastLogResult(data.data || data);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while communicating with the Agritech API.');
    } finally {
      setLoading(false);
    }
  };

  const calculatedTotalPay = (formData.kgHarvested * formData.ratePerKg).toFixed(2);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
          <Sprout size={320} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={14} /> Plugin Extension Active: CROP_YIELD
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Wheat className="text-amber-400" size={36} />
              Agritech Crop & Farm Yield Engine
            </h1>
            <p className="text-emerald-100 mt-2 max-w-2xl text-sm leading-relaxed">
              Manage agricultural workforce piece-rate compensation, field harvest logs, seasonal crop yield forecasting, and automated worker payroll disbursements.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
              <span className="block text-xs text-emerald-200 uppercase font-semibold">Active Fields</span>
              <span className="text-2xl font-bold text-white">4 Sectors</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
              <span className="block text-xs text-emerald-200 uppercase font-semibold">Field Crew</span>
              <span className="text-2xl font-bold text-amber-300">89 Workers</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg">
            <Wheat size={24} />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Season Target Yield</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">211.5 Tons</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <Tractor size={24} />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Harvest Rate</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">$0.40 / Kg</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Field Harvesters</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">89 Active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Accrued Piece Pay</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">$14,820.00</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Harvest Log Entry Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Field Harvest & Calculate Piece Pay</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Trigger live API log request to /api/v1/verticals/agriculture/crop-yield/log</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-xl text-sm border border-red-200 dark:border-red-800/40">
              {errorMsg}
            </div>
          )}

          {lastLogResult && (
            <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-200 dark:border-emerald-800/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={18} /> Harvest Entry Logged Successfully!
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
                <div>
                  <span className="block text-slate-500 dark:text-slate-400">Harvester</span>
                  <span className="font-semibold">{lastLogResult.harvesterEmail}</span>
                </div>
                <div>
                  <span className="block text-slate-500 dark:text-slate-400">Crop</span>
                  <span className="font-semibold">{lastLogResult.cropType}</span>
                </div>
                <div>
                  <span className="block text-slate-500 dark:text-slate-400">Quantity</span>
                  <span className="font-semibold">{lastLogResult.kgHarvested} Kg</span>
                </div>
                <div>
                  <span className="block text-slate-500 dark:text-slate-400">Total Pay</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${lastLogResult.totalHarvestPayUsd?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogHarvest} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Harvester Employee Email
              </label>
              <input 
                type="email"
                name="harvesterEmail"
                value={formData.harvesterEmail}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Crop Variety
                </label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Organic Apples">Organic Apples</option>
                  <option value="Sweet Corn">Sweet Corn</option>
                  <option value="Strawberries">Strawberries</option>
                  <option value="Arabica Coffee">Arabica Coffee</option>
                  <option value="Valencia Oranges">Valencia Oranges</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Harvest Weight (Kg)
                </label>
                <input 
                  type="number"
                  name="kgHarvested"
                  step="0.5"
                  value={formData.kgHarvested}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Rate per Kg ($)
                </label>
                <input 
                  type="number"
                  name="ratePerKg"
                  step="0.05"
                  value={formData.ratePerKg}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Calculated Worker Earnings</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">${calculatedTotalPay}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    Log Harvest Entry <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Active Farm Fields Directory (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sprout size={18} className="text-emerald-500" /> Farm Field Allocation
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full font-medium text-slate-600 dark:text-slate-300">
              4 Sectors Active
            </span>
          </div>

          <div className="space-y-3">
            {fields.map(field => (
              <div key={field.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-emerald-500/50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{field.name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{field.crop} • {field.acres} Acres</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    field.harvestStatus === 'READY' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                    field.harvestStatus === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {field.harvestStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Crew: <strong className="text-slate-800 dark:text-slate-200">{field.crewCount} Harvesters</strong></span>
                  <span className="text-slate-500 dark:text-slate-400">Target: <strong className="text-emerald-600 dark:text-emerald-400">{field.yieldTarget}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
