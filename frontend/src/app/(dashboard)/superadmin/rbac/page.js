'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Users, Key, Plus, Trash2, CheckCircle2, 
  AlertCircle, Search, RefreshCw, Layers, Edit, Save, Building2, Check, X
} from 'lucide-react';
import apiClient from '@/services/api';

export default function SuperAdminRbacManagementPage() {
  const [activeTab, setActiveTab] = useState('ROLES'); // 'ROLES', 'PERMISSIONS', 'USERS', 'TENANTS'
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Role Creation Modal
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');

  // Permission Creation Modal
  const [newPermModal, setNewPermModal] = useState(false);
  const [permName, setPermName] = useState('');
  const [permDescription, setPermDescription] = useState('');

  // Editing Role Matrix
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRolePerms, setSelectedRolePerms] = useState([]);

  useEffect(() => {
    fetchRbacData();
  }, []);

  const fetchRbacData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, usersRes] = await Promise.all([
        apiClient.get('/superadmin/rbac/roles'),
        apiClient.get('/superadmin/rbac/permissions'),
        apiClient.get('/superadmin/rbac/users')
      ]);

      if (rolesRes && rolesRes.success !== false) {
        setRoles(Array.isArray(rolesRes) ? rolesRes : (rolesRes.data || []));
      }
      if (permsRes && permsRes.success !== false) {
        setPermissions(Array.isArray(permsRes) ? permsRes : (permsRes.data || []));
      }
      if (usersRes && usersRes.success !== false) {
        setUsers(Array.isArray(usersRes) ? usersRes : (usersRes.data || []));
      }
    } catch (err) {
      console.error("Failed to load RBAC data from database", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleName) return;
    try {
      const data = await apiClient.post('/superadmin/rbac/roles', { name: roleName, description: roleDescription });
      if (data && data.success !== false) {
        setNewRoleModal(false);
        setRoleName('');
        setRoleDescription('');
        fetchRbacData();
      }
    } catch (err) {
      alert("Failed to create platform role");
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    if (!permName) return;
    try {
      const data = await apiClient.post('/superadmin/rbac/permissions', { name: permName, description: permDescription });
      if (data && data.success !== false) {
        setNewPermModal(false);
        setPermName('');
        setPermDescription('');
        fetchRbacData();
      }
    } catch (err) {
      alert("Failed to create platform permission");
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setSelectedRolePerms(role.permissions || []);
  };

  const togglePermissionForSelectedRole = (permId) => {
    if (selectedRolePerms.includes(permId)) {
      setSelectedRolePerms(prev => prev.filter(p => p !== permId));
    } else {
      setSelectedRolePerms(prev => [...prev, permId]);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      const data = await apiClient.put(`/superadmin/rbac/roles/${selectedRole.id}/permissions`, { permissionIds: selectedRolePerms });
      if (data && data.success !== false) {
        setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: selectedRolePerms } : r));
        alert("Platform role permissions saved successfully!");
      }
    } catch (err) {
      alert("Failed to update role permissions");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
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
            <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(129, 140, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} /> DUAL-SCOPE SECURITY MATRIX
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Dynamic RBAC & Security Control
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px' }}>
            Manage SaaS Product Owner platform roles, granular permission definitions, and operator assignments.
          </p>
        </div>

        <button 
          onClick={fetchRbacData}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Sync RBAC Matrix
        </button>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', pb: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('ROLES')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'ROLES' ? '#4338ca' : '#64748b',
            borderBottom: activeTab === 'ROLES' ? '3px solid #4338ca' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ShieldCheck size={18} /> Platform Roles ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'PERMISSIONS' ? '#4338ca' : '#64748b',
            borderBottom: activeTab === 'PERMISSIONS' ? '3px solid #4338ca' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Key size={18} /> Platform Permissions ({permissions.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'USERS' ? '#4338ca' : '#64748b',
            borderBottom: activeTab === 'USERS' ? '3px solid #4338ca' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={18} /> Operator Assignments
        </button>
      </div>

      {/* TAB 1: PLATFORM ROLES & MATRIX */}
      {activeTab === 'ROLES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          
          {/* Roles Column */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Platform Roles</h3>
              <button 
                onClick={() => setNewRoleModal(true)}
                style={{ background: '#4338ca', color: '#ffffff', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} /> New Role
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roles.map(role => {
                const isSelected = selectedRole?.id === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: isSelected ? '#edf2fe' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{role.name}</span>
                      <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#475569' }}>
                        {(role.permissions || []).length} perms
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.4 }}>
                      {role.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permission Assignment Matrix for Selected Role */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            {selectedRole ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#4338ca' }}>
                      Permission Matrix: {selectedRole.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                      Check granular platform capabilities to grant to this role.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveRolePermissions}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
                  {permissions.map(perm => {
                    const isChecked = selectedRolePerms.includes(perm.id);

                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermissionForSelectedRole(perm.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.85rem',
                          borderRadius: '8px',
                          border: isChecked ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                          background: isChecked ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          style={{ marginTop: '0.25rem', width: '16px', height: '16px', accentColor: '#16a34a' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                            <code>{perm.name}</code>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                            {perm.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                <ShieldCheck size={48} style={{ strokeWidth: 1.5, marginBottom: '1rem', color: '#cbd5e1' }} />
                <h4 style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Select a Platform Role</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>Click any role on the left panel to inspect and configure its granular permission matrix.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PLATFORM PERMISSIONS CATALOG */}
      {activeTab === 'PERMISSIONS' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Platform Permission Definitions</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Catalog of all fine-grained security authorities recognized across the SaaS platform.</p>
            </div>

            <button 
              onClick={() => setNewPermModal(true)}
              style={{ background: '#4338ca', color: '#ffffff', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Create New Permission
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Permission Key</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.85rem 1rem' }}>System ID</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(perm => (
                  <tr key={perm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#4338ca' }}>
                      <code>{perm.name}</code>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{perm.description}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>{perm.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM OPERATORS */}
      {activeTab === 'USERS' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Platform Operator Accounts</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Assign global platform roles to product owner staff and SRE engineers.</p>
          </div>

          {users.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Operator Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Email Address</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Assigned Platform Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>{u.first_name} {u.last_name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {(u.roles || ['SUPER_ADMIN']).map(r => (
                            <span key={r} style={{ background: '#edf2fe', color: '#4338ca', border: '1px solid #c7d2fe', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Users size={36} style={{ strokeWidth: 1.5, marginBottom: '0.75rem', color: '#cbd5e1' }} />
              <div>No additional platform operators configured beyond master Super Admin account.</div>
            </div>
          )}
        </div>
      )}

      {/* New Role Modal */}
      {newRoleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateRole} style={{ background: '#ffffff', borderRadius: '12px', width: '450px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Create Platform Role</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Role Name</label>
              <input 
                type="text" 
                placeholder="e.g. PLATFORM_SECURITY_LEAD" 
                value={roleName} 
                onChange={e => setRoleName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Description</label>
              <textarea 
                placeholder="Role responsibility summary..." 
                value={roleDescription} 
                onChange={e => setRoleDescription(e.target.value)} 
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', height: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setNewRoleModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#4338ca', color: '#ffffff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Create Role</button>
            </div>
          </form>
        </div>
      )}

      {/* New Permission Modal */}
      {newPermModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreatePermission} style={{ background: '#ffffff', borderRadius: '12px', width: '450px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Create Platform Permission</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Permission Key</label>
              <input 
                type="text" 
                placeholder="e.g. security:audit:write" 
                value={permName} 
                onChange={e => setPermName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Description</label>
              <textarea 
                placeholder="Explain what capability this authority grants..." 
                value={permDescription} 
                onChange={e => setPermDescription(e.target.value)} 
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', height: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setNewPermModal(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#4338ca', color: '#ffffff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Create Permission</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
