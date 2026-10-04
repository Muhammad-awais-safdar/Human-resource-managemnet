'use client';

import React, { useEffect, useState, useTransition } from 'react';
import apiClient from '../../../services/api';
import { Button } from '@/components/primitives/Button';
import { Input, Select } from '@/components/primitives/Input';
import { Badge } from '@/components/primitives/Badge';
import { Dialog } from '@/components/primitives/Dialog';
import { ContextualHelpPopover } from '@/components/help/ContextualHelpPopover';

export default function RolesDashboardPage() {
  const [activeTab, setActiveTab] = useState('matrix');
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showDevKeys, setShowDevKeys] = useState(false);

  // Modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSourceRoleId, setCloneSourceRoleId] = useState('');

  // Effective Permissions State
  const [inspectEmail, setInspectEmail] = useState('');
  const [effectiveData, setEffectiveData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    apiClient.get('/roles')
      .then((res) => {
        if (res.success) {
          setRoles(res.roles);
          setAllPermissions(res.allPermissions);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load enterprise RBAC roles & permissions.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedPermissions = React.useMemo(() => {
    const groups = {};
    allPermissions.forEach(perm => {
      const mod = perm.module_key || 'CORE_HR';
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(perm);
    });
    return groups;
  }, [allPermissions]);

  const humanizePermission = (permKey) => {
    if (!permKey) return 'Action Permission';
    const parts = permKey.split('.');
    if (parts.length >= 3) {
      const moduleName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const featureName = parts[1].replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const actionName = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
      return `${moduleName} → ${featureName} → ${actionName}`;
    }
    return permKey.replace(/[._]/g, ' ').toUpperCase();
  };

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
    <div data-tour="roles-permissions" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Enterprise Role & Permission Management</h1>
            <ContextualHelpPopover
              title="Feature-Based RBAC Matrix"
              content="Permissions are organized hierarchically: Module -> Feature -> Action. Custom roles inherit permissions cleanly without breaking system administrative boundaries."
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fine-grained access control, system role guards, and real-time effective permissions inspector.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowCloneModal(true); setError(''); setMessage(''); }}
          >
            📋 Clone Role
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setShowRoleModal(true); setError(''); setMessage(''); }}
          >
            + Create Custom Role
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${activeTab === 'matrix' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          🔐 Role Builder & Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('effective')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${activeTab === 'effective' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          🔍 Effective Permissions Inspector
        </button>
      </div>

      {/* Banners */}
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">⚠️ {error}</div>}
      {message && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">✅ {message}</div>}

      {/* TAB 1: ROLE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                placeholder="Search roles or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { label: `All Roles (${roles.length})`, value: 'ALL' },
                  { label: 'System Roles Only', value: 'SYSTEM' },
                  { label: 'Custom Roles Only', value: 'CUSTOM' },
                ]}
              />
            </div>

            <div data-tour="rbac-developer-toggle">
              <Button
                variant={showDevKeys ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowDevKeys(!showDevKeys)}
              >
                {showDevKeys ? '🔑 Developer Key View (ON)' : '👤 Human-Readable Labels'}
              </Button>
            </div>
          </div>

          {/* Roles List & Matrix */}
          <div data-tour="rbac-roles-list" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles Sidebar Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                Enterprise Workspace Roles
              </h3>

              <div className="space-y-2">
                {filteredRoles.map(role => (
                  <div key={role.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{role.name}</span>
                        {role.is_system_role ? (
                          <Badge variant="warning" size="sm">System Guarded</Badge>
                        ) : (
                          <Badge variant="info" size="sm">Custom</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{role.description || 'No description provided.'}</p>
                    </div>

                    {!role.is_system_role && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Permission Matrix */}
            <div data-tour="rbac-permission-matrix" className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                Hierarchical Permission Matrix ({allPermissions.length} Actions)
              </h3>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {Object.entries(groupedPermissions).map(([modKey, perms]) => (
                  <div key={modKey} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                      Module: {modKey}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map(p => (
                        <div key={p.id} className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between text-xs">
                          <span className="text-slate-800">
                            {showDevKeys ? p.permission_key : humanizePermission(p.permission_key)}
                          </span>
                          <Badge variant="success" size="sm">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EFFECTIVE INSPECTOR */}
      {activeTab === 'effective' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Effective User Permission Inspector</h3>
          <p className="text-xs text-slate-500">Inspect inherited, direct, and system permissions for any employee email session.</p>

          <form onSubmit={handleInspectUser} className="flex gap-3 max-w-md">
            <Input
              placeholder="Enter employee email..."
              value={inspectEmail}
              onChange={(e) => setInspectEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" isLoading={inspectLoading}>
              Inspect
            </Button>
          </form>
        </div>
      )}

      {/* Create Role Modal */}
      <Dialog
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Create Custom Workspace Role"
        description="Define a new role and grant granular module action permissions."
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <Input
            label="Role Name"
            isRequired
            placeholder="e.g. Payroll Specialist"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Input
            label="Role Description"
            placeholder="Responsibilities and permission scopes..."
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Create Role</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
