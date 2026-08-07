'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Laptop, Plus, CheckCircle2, AlertCircle, Package, UserCheck, RefreshCw, Smartphone, HardDrive, Truck } from 'lucide-react';
import * as suiteService from '../../../services/suiteService';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/primitives/Card';
import { TableSkeleton } from '@/components/primitives/Skeleton';

export default function AssetPage() {
  const [assets, setAssets] = useState([]);
  const [myAssets, setMyAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Add asset form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('LAPTOP');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  // Assign form
  const [assignAssetId, setAssignAssetId] = useState('');
  const [assignEmpId, setAssignEmpId] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      suiteService.getAllAssets().catch(() => []),
      suiteService.getMyAssets().catch(() => []),
    ]).then(([all, mine]) => { 
      setAssets(Array.isArray(all) ? all : all.data || []); 
      setMyAssets(Array.isArray(mine) ? mine : mine.data || []); 
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      await suiteService.addAsset({ name, category, serialNumber, purchaseDate });
      setMessage('✅ Asset registered successfully!'); 
      setName(''); 
      setSerialNumber(''); 
      setPurchaseDate('');
      loadData();
    } catch { setMessage('❌ Failed to register asset.'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const result = await suiteService.assignAsset(assignAssetId, assignEmpId);
      setMessage(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
      setAssignAssetId(''); 
      setAssignEmpId(''); 
      loadData();
    } catch { setMessage('❌ Failed to assign asset.'); }
  };

  const handleReturn = async (assetId) => {
    try {
      const result = await suiteService.returnAsset(assetId);
      setMessage(result.success ? '✅ Asset returned to available inventory.' : '❌ Failed to return asset.');
      loadData();
    } catch { setMessage('❌ Error returning asset.'); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Corporate Asset Management</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Track hardware inventory, assign hardware assets to employees, and process return clearances.
        </p>
      </div>

      {message && (
        <div className={`p-3 border rounded-lg text-xs flex items-center gap-2 ${message.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.startsWith('✅') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message}</span>
        </div>
      )}

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: assets.length, icon: Package, color: 'text-cyan-400' },
          { label: 'Available Inventory', value: assets.filter(a => a.status === 'AVAILABLE').length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Currently Assigned', value: assets.filter(a => a.status === 'ASSIGNED').length, icon: UserCheck, color: 'text-amber-400' },
          { label: 'Assigned to Me', value: myAssets.length, icon: Laptop, color: 'text-indigo-400' },
        ].map(stat => (
          <Card key={stat.label} className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-[var(--bg-surface-l2)] ${stat.color} border border-[var(--border-subtle)]`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</div>
              <div className="text-xl font-extrabold text-[var(--text-primary)] font-mono">{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* NAVIGATION TAB CONTROLS */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-2">
        <Button
          variant={activeTab === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          All Inventory ({assets.length})
        </Button>
        <Button
          variant={activeTab === 'mine' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('mine')}
        >
          My Allocated Assets ({myAssets.length})
        </Button>
        <Button
          variant={activeTab === 'add' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('add')}
          icon={Plus}
        >
          Add New Asset
        </Button>
        <Button
          variant={activeTab === 'assign' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('assign')}
          icon={UserCheck}
        >
          Assign Asset
        </Button>
      </div>

      {/* CONTENT PANELS */}
      {loading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <Card className="p-0 overflow-hidden">
          {activeTab === 'all' && (
            assets.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--text-muted)]">No corporate assets registered.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-surface-l2)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Asset Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Serial Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned Employee</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {assets.map((a, i) => (
                      <tr key={i} className="hover:bg-[var(--bg-surface-l2)]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{a.name}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{a.category}</td>
                        <td className="py-3 px-4 font-mono text-[var(--text-muted)]">{a.serial_number || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={a.status === 'AVAILABLE' ? 'success' : a.status === 'ASSIGNED' ? 'warning' : 'danger'}>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{a.first_name ? `${a.first_name} ${a.last_name}` : '—'}</td>
                        <td className="py-3 px-4 text-right">
                          {a.status === 'ASSIGNED' && (
                            <Button variant="danger" size="sm" onClick={() => handleReturn(a.id)}>
                              Return
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === 'mine' && (
            <div className="p-6">
              {myAssets.length === 0 ? (
                <div className="text-center text-xs text-[var(--text-muted)] py-8">No hardware assets currently assigned to your account.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myAssets.map((a, i) => (
                    <div key={i} className="p-4 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <Laptop className="w-5 h-5 text-indigo-400" />
                        <Badge variant="success">{a.status}</Badge>
                      </div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">{a.name}</div>
                      <div className="text-xs font-mono text-[var(--text-muted)]">Serial: {a.serial_number}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="p-6 max-w-md">
              <form onSubmit={handleAddAsset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Asset Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. MacBook Pro 16" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 focus:outline-none focus:border-[var(--accent-primary)]"
                  >
                    {['HARDWARE', 'LAPTOP', 'MOBILE', 'FURNITURE', 'VEHICLE', 'GENERAL', 'OTHER'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Serial Code</label>
                  <Input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="e.g. C02FX019MD6M" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Purchase Date</label>
                  <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                </div>
                <Button type="submit" variant="primary">Add Asset Record</Button>
              </form>
            </div>
          )}

          {activeTab === 'assign' && (
            <div className="p-6 max-w-md">
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Select Available Asset</label>
                  <select
                    value={assignAssetId}
                    onChange={e => setAssignAssetId(e.target.value)}
                    required
                    className="w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 focus:outline-none focus:border-[var(--accent-primary)]"
                  >
                    <option value="">Select asset from available pool...</option>
                    {assets.filter(a => a.status === 'AVAILABLE').map((a, i) => (
                      <option key={i} value={a.id}>{a.name} ({a.serial_number})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Assignee Employee ID</label>
                  <Input value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} required placeholder="Enter employee UUID" />
                </div>
                <Button type="submit" variant="primary">Confirm Asset Allocation</Button>
              </form>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
