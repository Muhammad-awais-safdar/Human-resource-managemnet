'use client';

import React, { useEffect, useState, useTransition } from 'react';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

export default function RolesDashboardPage() {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'effective' | 'assignment'
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'SYSTEM' | 'CUSTOM'

  // Modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSourceRoleId, setCloneSourceRoleId] = useState('');

  // Accordion Expand/Collapse
  const [expandedModules, setExpandedModules] = useState({});

  // Effective Permissions State
  const [inspectEmail, setInspectEmail] = useState('');
  const [effectiveData, setEffectiveData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // User Assignment State
  const [assignUserEmail, setAssignUserEmail] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    apiClient.get('/roles')
      .then((res) => {
        if (isMounted && res.success) {
          setRoles(res.roles);
          setAllPermissions(res.allPermissions);

          // Expand all modules by default
          const mods = {};
          res.allPermissions.forEach(p => {
            mods[p.module_key || 'CORE_HR'] = true;
          });
          setExpandedModules(mods);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setError(err.message || 'Failed to load enterprise RBAC roles & permissions.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Group permissions by module_key
  const groupedPermissions = React.useMemo(() => {
    const groups = {};
    allPermissions.forEach(perm => {
      const mod = perm.module_key || 'CORE_HR';
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(perm);
    });
    return groups;
  }, [allPermissions]);

  const handleCreateRole = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newRoleName) return setError('Role name is required.');

    startTransition(async () => {
      try {
        const res = await apiClient.post('/roles', {
          name: newRoleName,
          description: newRoleDesc,
        });
        if (res.success) {
          setMessage('New enterprise role created successfully!');
          setNewRoleName('');
          setNewRoleDesc('');
          setShowRoleModal(false);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to create role.');
      }
    });
  };

  const handleCloneRole = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newRoleName || !cloneSourceRoleId) return setError('Role name and source role are required.');

    startTransition(async () => {
      try {
        const res = await apiClient.post('/roles/clone', {
          sourceRoleId: cloneSourceRoleId,
          name: newRoleName,
          description: newRoleDesc,
        });
        if (res.success) {
          setMessage('Role cloned successfully!');
          setNewRoleName('');
          setNewRoleDesc('');
          setShowCloneModal(false);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to clone role.');
      }
    });
  };

  const handleDeleteRole = (role) => {
    if (role.is_system_role) {
      alert('System roles are protected and cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete role '${role.name}'?`)) return;

    startTransition(async () => {
      try {
        await apiClient.delete(`/roles/${role.id}`);
        setMessage(`Role '${role.name}' deleted.`);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to delete role.');
      }
    });
  };

  const handleCheckboxToggle = (role, permissionId, isChecked) => {
    setError('');
    setMessage('');

    let updated = [...role.permissions];
    if (isChecked) {
      if (!updated.includes(permissionId)) updated.push(permissionId);
    } else {
      updated = updated.filter(id => id !== permissionId);
    }

    startTransition(async () => {
      try {
        await apiClient.put(`/roles/${role.id}/permissions`, {
          permissionIds: updated,
        });
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: updated } : r));
        setMessage(`Updated permissions for role ${role.name}`);
      } catch (err) {
        setError(err.message || 'Failed to update role permissions.');
      }
    });
  };

  const handleSelectAllModule = (role, moduleKey, select) => {
    const modPermIds = (groupedPermissions[moduleKey] || []).map(p => p.id);
    let updated = [...role.permissions];

    if (select) {
      modPermIds.forEach(id => {
        if (!updated.includes(id)) updated.push(id);
      });
    } else {
      updated = updated.filter(id => !modPermIds.includes(id));
    }

    startTransition(async () => {
      try {
        await apiClient.put(`/roles/${role.id}/permissions`, { permissionIds: updated });
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, permissions: updated } : r));
        setMessage(`Batch updated module permissions for role ${role.name}`);
      } catch (err) {
        setError(err.message || 'Failed to batch update permissions.');
      }
    });
  };

  const handleInspectUser = (e) => {
    e.preventDefault();
    if (!inspectEmail) return;
    setInspectLoading(true);
    setEffectiveData(null);
    apiClient.get(`/roles/user-effective/${inspectEmail}`)
      .then(res => {
        if (res.success) setEffectiveData(res);
      })
      .catch(err => alert(err.message || 'User not found or has no roles assigned.'))
      .finally(() => setInspectLoading(false));
  };

  const filteredRoles = roles.filter(r => {
    if (roleFilter === 'SYSTEM' && !r.is_system_role) return false;
    if (roleFilter === 'CUSTOM' && r.is_system_role) return false;
    if (searchTerm) {
      return r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-bold text-white">Enterprise Role & Permission Management</h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Feature-based access control, system role guards, and real-time effective permissions audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowCloneModal(true); setError(''); setMessage(''); }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-indigo-500 transition-colors cursor-pointer"
          >
            📋 Clone Role
          </button>
          <button
            onClick={() => { setShowRoleModal(true); setError(''); setMessage(''); }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
          >
            + Create Custom Role
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${activeTab === 'matrix' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          🔐 Role Builder & Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('effective')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${activeTab === 'effective' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          🔍 Effective Permissions Inspector
        </button>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          ✅ {message}
        </div>
      )}

      {/* TAB 1: ROLE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--bg-surface-l1)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search roles or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] w-full sm:w-64"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
              >
                <option value="ALL">All Roles ({roles.length})</option>
                <option value="SYSTEM">System Roles Only</option>
                <option value="CUSTOM">Custom Roles Only</option>
              </select>
            </div>

            <div className="text-xs text-[var(--text-muted)] font-mono">
              Showing {filteredRoles.length} Roles Across {Object.keys(groupedPermissions).length} Feature Modules
            </div>
          </div>

          {/* Module Accordions */}
          <div className="space-y-6">
            {Object.keys(groupedPermissions).map((moduleKey) => {
              const perms = groupedPermissions[moduleKey];
              const isExpanded = expandedModules[moduleKey] !== false;

              return (
                <div key={moduleKey} className="bg-[var(--bg-surface-l1)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-lg">
                  {/* Module Header */}
                  <div
                    onClick={() => setExpandedModules(prev => ({ ...prev, [moduleKey]: !isExpanded }))}
                    className="p-4 bg-[var(--bg-surface-l2)] border-b border-[var(--border-subtle)] flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wider">
                        {isExpanded ? '▼' : '►'} Module: {moduleKey.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                        {perms.length} Permissions
                      </span>
                    </div>
                  </div>

                  {/* Permissions Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] uppercase text-[10px] border-b border-[var(--border-subtle)]">
                          <tr>
                            <th className="p-4 min-w-[280px]">Feature Action Capability</th>
                            {filteredRoles.map(role => (
                              <th key={role.id} className="p-4 text-center min-w-[140px]">
                                <div className="font-bold text-[var(--text-primary)] flex justify-center items-center gap-1">
                                  {role.name}
                                  {role.is_system_role && (
                                    <span title="System Protected Role" className="text-[10px]">🛡️</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5">
                                  {role.user_count || 0} Users
                                </div>

                                {/* Batch Module Select Buttons */}
                                <div className="flex justify-center gap-1 mt-2">
                                  <button
                                    onClick={() => handleSelectAllModule(role, moduleKey, true)}
                                    className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold"
                                  >
                                    All
                                  </button>
                                  <button
                                    onClick={() => handleSelectAllModule(role, moduleKey, false)}
                                    className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-semibold"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {perms.map(perm => (
                            <tr key={perm.id} className="hover:bg-[var(--bg-surface-l2)] transition-colors">
                              <td className="p-4">
                                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                  {perm.ui_label || perm.name}
                                  {perm.is_sensitive && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                      ⚠️ Sensitive
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                  {perm.description}
                                </div>
                                <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                                  Key: {perm.name}
                                </div>
                              </td>

                              {filteredRoles.map(role => {
                                const hasPerm = role.permissions.includes(perm.id);
                                return (
                                  <td key={role.id} className="p-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={hasPerm}
                                      onChange={(e) => handleCheckboxToggle(role, perm.id, e.target.checked)}
                                      className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-500"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EFFECTIVE PERMISSIONS INSPECTOR */}
      {activeTab === 'effective' && (
        <div className="space-y-6">
          <form onSubmit={handleInspectUser} className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 max-w-xl">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">🔍 Audit User Effective Access</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter any employee email to resolve their active aggregated capabilities across all assigned roles.
            </p>

            <div className="flex gap-3">
              <input
                type="email"
                placeholder="e.g. admin@tenant.com"
                value={inspectEmail}
                onChange={(e) => setInspectEmail(e.target.value)}
                className="flex-1 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)]"
                required
              />
              <button
                type="submit"
                disabled={inspectLoading}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                {inspectLoading ? 'Evaluating...' : 'Inspect Permissions'}
              </button>
            </div>
          </form>

          {effectiveData && (
            <div className="bg-[var(--bg-surface-l1)] p-6 rounded-2xl border border-[var(--border-subtle)] space-y-6">
              <div>
                <h4 className="text-sm font-bold text-indigo-400">Assigned Roles for {effectiveData.email}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {effectiveData.assignedRoles.map(r => (
                    <span key={r.id} className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      🛡️ {r.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">
                  Aggregated Granted Capabilities ({effectiveData.effectivePermissions.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {effectiveData.effectivePermissions.map(p => (
                    <div key={p.id} className="p-3 rounded-xl bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{p.ui_label}</div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">{p.name}</div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400">
                        Granted by {p.granted_by_role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Role */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-indigo-400">Create Custom Enterprise Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. REGIONAL_COMPLIANCE_OFFICER"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Manages Regional OSHA and Labor compliance audits"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--bg-surface-l2)] text-[var(--text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
                >
                  {isPending ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Clone Role */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-indigo-400">Clone Existing Role</h3>
            <form onSubmit={handleCloneRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Source Role</label>
                <select
                  value={cloneSourceRoleId}
                  onChange={(e) => setCloneSourceRoleId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
                  required
                >
                  <option value="">Select Role to Copy...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.permissions.length} perms)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1">New Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. DEPUTY_HR_MANAGER"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Copy of HR Manager with custom limits"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--bg-surface-l2)] text-[var(--text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
                >
                  {isPending ? 'Cloning...' : 'Clone & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
