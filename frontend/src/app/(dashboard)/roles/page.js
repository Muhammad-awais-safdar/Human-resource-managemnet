'use client';

import React, { useEffect, useState, useTransition, useMemo } from 'react';
import { 
  ShieldCheck, Lock, Key, Plus, CheckCircle2, 
  AlertCircle, Search, RefreshCw, Layers, Check, X, Shield, Filter, Sparkles, Trash2, Archive, Edit3, Eye, FilePlus, Zap
} from 'lucide-react';
import apiClient from '../../../services/api';

export default function RolesMatrixPage() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');

  // Role Form State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [savingRoleId, setSavingRoleId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/roles');
      if (res && res.success !== false) {
        setRoles(res.roles || []);
        setAllPermissions(res.allPermissions || []);
      }
    } catch (err) {
      console.error("Failed to load roles matrix:", err);
      setError(err.message || 'Failed to load roles matrix configurations from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Classify permission action lifecycle
  const getActionBadge = (permName) => {
    const lower = permName.toLowerCase();
    if (lower.includes('force_delete') || lower.includes('permanent_delete')) {
      return { label: 'FORCE DELETE', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', icon: Zap };
    }
    if (lower.includes('archive')) {
      return { label: 'ARCHIVE', bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe', icon: Archive };
    }
    if (lower.includes('delete') || lower.includes('remove')) {
      return { label: 'TEMP DELETE', bg: '#fff1f2', color: '#be123c', border: '#fecdd3', icon: Trash2 };
    }
    if (lower.includes('edit') || lower.includes('write') || lower.includes('update')) {
      return { label: 'EDIT', bg: '#fef3c7', color: '#92400e', border: '#fde68a', icon: Edit3 };
    }
    if (lower.includes('create') || lower.includes('add')) {
      return { label: 'CREATE', bg: '#dcfce7', color: '#166534', border: '#86efac', icon: FilePlus };
    }
    if (lower.includes('read') || lower.includes('view')) {
      return { label: 'READ', bg: '#e0f2fe', color: '#075985', border: '#7dd3fc', icon: Eye };
    }
    return { label: 'ACCESS', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', icon: Key };
  };

  // Categorize permissions logically based on module prefix
  const categories = useMemo(() => {
    const set = new Set(['ALL']);
    allPermissions.forEach(p => {
      if (p.name.includes(':')) {
        set.add(p.name.split(':')[0].toUpperCase());
      } else if (p.name.includes('_')) {
        set.add(p.name.split('_')[0].toUpperCase());
      } else {
        set.add('CORE');
      }
    });
    return Array.from(set);
  }, [allPermissions]);

  const filteredPermissions = useMemo(() => {
    return allPermissions.filter(perm => {
      const matchesSearch = 
        perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (perm.description && perm.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter by Category
      let matchesCat = true;
      if (selectedCategory !== 'ALL') {
        if (perm.name.includes(':')) {
          matchesCat = perm.name.split(':')[0].toUpperCase() === selectedCategory;
        } else if (perm.name.includes('_')) {
          matchesCat = perm.name.split('_')[0].toUpperCase() === selectedCategory;
        } else {
          matchesCat = selectedCategory === 'CORE';
        }
      }
      if (!matchesCat) return false;

      // Filter by Action Type
      if (selectedActionFilter !== 'ALL') {
        const badge = getActionBadge(perm.name);
        if (selectedActionFilter === 'CREATE' && badge.label !== 'CREATE') return false;
        if (selectedActionFilter === 'READ' && badge.label !== 'READ') return false;
        if (selectedActionFilter === 'EDIT' && badge.label !== 'EDIT') return false;
        if (selectedActionFilter === 'DELETE' && badge.label !== 'TEMP DELETE') return false;
        if (selectedActionFilter === 'ARCHIVE' && badge.label !== 'ARCHIVE') return false;
        if (selectedActionFilter === 'FORCE_DELETE' && badge.label !== 'FORCE DELETE') return false;
      }

      return true;
    });
  }, [allPermissions, searchQuery, selectedCategory, selectedActionFilter]);

  const handleCreateRole = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newRoleName.trim()) {
      return setError('Role code name is required.');
    }

    startTransition(async () => {
      try {
        const res = await apiClient.post('/roles', {
          name: newRoleName.trim().toUpperCase(),
          description: newRoleDesc.trim(),
        });

        if (res && res.success !== false) {
          setMessage(`Role "${newRoleName.toUpperCase()}" successfully created!`);
          setNewRoleName('');
          setNewRoleDesc('');
          setShowRoleModal(false);
          loadData();
        } else {
          setError(res.message || 'Failed to create role.');
        }
      } catch (err) {
        setError(err.message || 'Failed to register role.');
      }
    });
  };

  const handleCheckboxToggle = (role, permissionId, isChecked) => {
    setError('');
    setMessage('');
    setSavingRoleId(role.id);

    let updatedPermissionIds = [...(role.permissions || [])];
    if (isChecked) {
      if (!updatedPermissionIds.includes(permissionId)) {
        updatedPermissionIds.push(permissionId);
      }
    } else {
      updatedPermissionIds = updatedPermissionIds.filter(id => id !== permissionId);
    }

    // Optimistically update state
    setRoles(prevRoles => prevRoles.map(r => {
      if (r.id === role.id) {
        return { ...r, permissions: updatedPermissionIds };
      }
      return r;
    }));

    startTransition(async () => {
      try {
        await apiClient.put(`/roles/${role.id}/permissions`, {
          permissionIds: updatedPermissionIds,
        });
        setMessage(`Updated capabilities for role: ${role.name}`);
      } catch (err) {
        setError(err.message || 'Failed to update role permissions.');
        loadData(); // Revert on failure
      } finally {
        setSavingRoleId(null);
      }
    });
  };

  const handleBulkToggleRole = (role, actionType) => {
    let targetPermIds = [];

    if (actionType === 'ALL') {
      targetPermIds = allPermissions.map(p => p.id);
    } else if (actionType === 'READ_ONLY') {
      targetPermIds = allPermissions.filter(p => getActionBadge(p.name).label === 'READ').map(p => p.id);
    } else if (actionType === 'NONE') {
      targetPermIds = [];
    }

    setSavingRoleId(role.id);

    setRoles(prevRoles => prevRoles.map(r => {
      if (r.id === role.id) {
        return { ...r, permissions: targetPermIds };
      }
      return r;
    }));

    startTransition(async () => {
      try {
        await apiClient.put(`/roles/${role.id}/permissions`, {
          permissionIds: targetPermIds,
        });
        setMessage(`Updated bulk security profile for ${role.name}`);
      } catch (err) {
        setError(err.message || 'Failed to update role permissions.');
        loadData();
      } finally {
        setSavingRoleId(null);
      }
    });
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1650px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)',
        borderRadius: '16px',
        padding: '2rem 2.5rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
              <ShieldCheck size={28} color="#a5b4fc" />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Full Lifecycle Roles & Permissions Matrix
            </h1>
          </div>
          <p style={{ margin: 0, color: '#c7d2fe', fontSize: '0.95rem', maxWidth: '750px', lineHeight: 1.5 }}>
            Granular access controls across all modules: Create, Read, Edit, Temporary Delete, Archive, and Force Delete privileges.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Matrix
          </button>
          <button
            onClick={() => setShowRoleModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} />
            Create Role
          </button>
        </div>
      </div>

      {/* Action Lifecycle Badge Legend Bar */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="#4338ca" /> Lifecycle Action Types:
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'ALL ACTIONS' },
            { id: 'CREATE', label: 'CREATE', bg: '#dcfce7', color: '#166534' },
            { id: 'READ', label: 'READ', bg: '#e0f2fe', color: '#075985' },
            { id: 'EDIT', label: 'EDIT', bg: '#fef3c7', color: '#92400e' },
            { id: 'DELETE', label: 'TEMP DELETE', bg: '#fff1f2', color: '#be123c' },
            { id: 'ARCHIVE', label: 'ARCHIVE', bg: '#f3e8ff', color: '#6b21a8' },
            { id: 'FORCE_DELETE', label: 'FORCE DELETE', bg: '#fee2e2', color: '#991b1b' },
          ].map(act => (
            <button
              key={act.id}
              onClick={() => setSelectedActionFilter(act.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: selectedActionFilter === act.id ? '2px solid #4338ca' : '1px solid #cbd5e1',
                background: selectedActionFilter === act.id ? '#4338ca' : (act.bg || '#f8fafc'),
                color: selectedActionFilter === act.id ? '#ffffff' : (act.color || '#475569'),
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert / Feedback Notification */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{message}</span>
        </div>
      )}

      {/* Search & Module Category Bar */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px', maxWidth: '500px', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search capability by key (e.g. corehr:create, payroll:archive)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
          />
          {searchQuery && (
            <X size={16} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
          )}
        </div>

        {/* Module Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedCategory === cat ? '#1e1b4b' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : '#64748b'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table Card */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#4338ca' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Security Matrix...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '750px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', minWidth: '340px', background: '#f8fafc' }}>
                    Module & Lifecycle Capability ({filteredPermissions.length})
                  </th>
                  {roles.map(role => {
                    const assignedCount = (role.permissions || []).length;

                    return (
                      <th key={role.id} style={{ padding: '1.25rem 1rem', textTransform: 'uppercase', minWidth: '180px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                          {role.name.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, textTransform: 'none', marginTop: '0.2rem', minHeight: '28px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {role.description || 'Custom organizational role'}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px', background: assignedCount > 0 ? '#e0e7ff' : '#f1f5f9', color: assignedCount > 0 ? '#3730a3' : '#64748b' }}>
                            {assignedCount} / {allPermissions.length} Enabled
                          </span>
                        </div>

                        {/* Bulk Action Controls */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                          <button
                            title="Grant ALL privileges"
                            onClick={() => handleBulkToggleRole(role, 'ALL')}
                            style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', cursor: 'pointer' }}
                          >
                            ALL
                          </button>
                          <button
                            title="Grant READ-ONLY privileges"
                            onClick={() => handleBulkToggleRole(role, 'READ_ONLY')}
                            style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #bae6fd', background: '#f0f9ff', color: '#075985', cursor: 'pointer' }}
                          >
                            READ
                          </button>
                          <button
                            title="Clear ALL privileges"
                            onClick={() => handleBulkToggleRole(role, 'NONE')}
                            style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', cursor: 'pointer' }}
                          >
                            CLEAR
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={roles.length + 1} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      No permissions match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((perm, idx) => {
                    const badge = getActionBadge(perm.name);
                    const ActionIcon = badge.icon;

                    return (
                      <tr 
                        key={perm.id} 
                        style={{ 
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa', 
                          transition: 'background 0.15s ease-in-out'
                        }}
                      >
                        <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <code style={{ background: '#0f172a', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>
                              {perm.name}
                            </code>

                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.25rem', 
                              padding: '0.15rem 0.55rem', 
                              borderRadius: '6px', 
                              fontSize: '0.7rem', 
                              fontWeight: 800, 
                              background: badge.bg, 
                              color: badge.color, 
                              border: `1px solid ${badge.border}` 
                            }}>
                              <ActionIcon size={12} />
                              {badge.label}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
                            {perm.description || 'Module security capability node'}
                          </div>
                        </td>

                        {roles.map(role => {
                          const hasPerm = (role.permissions || []).includes(perm.id);

                          return (
                            <td key={role.id} style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                <input
                                  type="checkbox"
                                  checked={hasPerm}
                                  onChange={(e) => handleCheckboxToggle(role, perm.id, e.target.checked)}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: '#4338ca',
                                    borderRadius: '4px'
                                  }}
                                />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Creation Modal */}
      {showRoleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Shield color="#4338ca" size={24} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Register New Role</h3>
              </div>
              <button 
                onClick={() => setShowRoleModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Role Code Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. REGIONAL_MANAGER"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', color: '#0f172a', textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Description
                </label>
                <textarea
                  placeholder="Describe operational scope and responsibilities..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', color: '#0f172a', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#4338ca', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isPending ? 'Saving...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
