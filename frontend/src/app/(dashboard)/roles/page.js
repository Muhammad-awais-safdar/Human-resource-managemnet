'use client';

import React, { useEffect, useState, useTransition } from 'react';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

export default function RolesMatrixPage() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

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
        setError(err.message || 'Failed to load roles matrix configurations.');
      });
  };

  useEffect(() => {
    loadData();
  }, []);

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
          setMessage('New organizational role registered successfully!');
          setNewRoleName('');
          setNewRoleDesc('');
          setShowRoleForm(false);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to register role.');
      }
    });
  };

  const handleCheckboxToggle = (role, permissionId, isChecked) => {
    setError('');
    setMessage('');

    // Compute updated permission IDs list for this role
    let updatedPermissionIds = [...role.permissions];
    if (isChecked) {
      if (!updatedPermissionIds.includes(permissionId)) {
        updatedPermissionIds.push(permissionId);
      }
    } else {
      updatedPermissionIds = updatedPermissionIds.filter(id => id !== permissionId);
    }

    startTransition(async () => {
      try {
        await apiClient.put(`/roles/${role.id}/permissions`, {
          permissionIds: updatedPermissionIds,
        });
        
        // Optimistically update state
        setRoles(prevRoles => prevRoles.map(r => {
          if (r.id === role.id) {
            return { ...r, permissions: updatedPermissionIds };
          }
          return r;
        }));
        
        setMessage(`Permissions updated for role ${role.name}!`);
      } catch (err) {
        setError(err.message || 'Failed to update role permissions.');
      }
    });
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Roles & Permissions Matrix</h1>
          <p className="page-subtitle">Configure security rules, assign capabilities, and configure dynamic RBAC mappings</p>
        </div>
        <button 
          onClick={() => { setShowRoleForm(!showRoleForm); setError(''); setMessage(''); }} 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          style={{ width: 'auto', height: '40px', padding: '0 20px' }}
        >
          {showRoleForm ? 'Cancel' : '+ Create Role'}
        </button>
      </header>

      {showRoleForm && (
        <form onSubmit={handleCreateRole} className="form-card" style={{ maxWidth: '600px', marginBottom: '32px' }} noValidate>
          <h3>Create New Role</h3>
          
          {error && (
            <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Role Code Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. REGIONAL_MANAGER"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Full write privileges to regional department records"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              disabled={isPending}
            />
          </div>

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
            {isPending ? 'Registering...' : 'Register Role'}
          </button>
        </form>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {message && (
        <div className={`${styles.alert}`} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', marginBottom: '24px' }}>
          {message}
        </div>
      )}

      <div className="form-card" style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Capabilities & Permissions
              </th>
              {roles.map(role => (
                <th key={role.id} style={{ padding: '16px', textTransform: 'uppercase', minWidth: '150px' }}>
                  <div style={{ fontWeight: '700', color: '#ffffff' }}>{role.name.replace('_', ' ')}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400', marginTop: '4px' }}>{role.description}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allPermissions.map(perm => (
              <tr key={perm.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                <td style={{ padding: '16px', textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{perm.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{perm.description}</div>
                </td>
                {roles.map(role => {
                  const hasPerm = role.permissions.includes(perm.id);
                  return (
                    <td key={role.id} style={{ textAlignment: 'center', padding: '16px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={hasPerm}
                        onChange={(e) => handleCheckboxToggle(role, perm.id, e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: 'var(--accent-primary)',
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
