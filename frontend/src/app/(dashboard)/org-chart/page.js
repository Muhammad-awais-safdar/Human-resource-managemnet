'use client';

import React, { useEffect, useState, useTransition } from 'react';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

// Recursive React component to render visual tree nodes and interactive employee department inspector
function OrgTreeNode({ node, onAddChild, onDeleteNode, onViewEmployees, employeeCounts }) {
  const isLeaf = !node.children || node.children.length === 0;
  const count = employeeCounts[node.name?.toLowerCase()] || employeeCounts[node.id] || 0;

  return (
    <div className={`org-node-wrapper ${isLeaf ? 'leaf' : ''}`}>
      <div 
        className="org-node hover:border-indigo-500 transition-all cursor-pointer group"
        onClick={() => onViewEmployees(node)}
      >
        <div className={`org-node-badge badge-${node.type.toLowerCase()}`}>
          {node.type.replace('_', ' ')}
        </div>
        <div className="org-node-title text-indigo-400 group-hover:text-indigo-300 font-bold">
          {node.name}
        </div>
        {node.costCode && <div className="org-node-meta">Code: {node.costCode}</div>}
        
        <div className="my-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            👥 {count} Employee{count !== 1 ? 's' : ''}
          </span>
        </div>

        <div 
          style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => onViewEmployees(node)}
            style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.4)', cursor: 'pointer', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}
          >
            👥 View Staff
          </button>
          <button 
            onClick={() => onAddChild(node)}
            style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', color: 'var(--accent-primary)' }}
          >
            + Add Child
          </button>
          <button 
            onClick={() => onDeleteNode(node.id)}
            style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', color: 'var(--accent-danger)' }}
          >
            Delete
          </button>
        </div>
      </div>

      {!isLeaf && (
        <div className="org-children">
          {node.children.map((child) => (
            <OrgTreeNode 
              key={child.id} 
              node={child} 
              onAddChild={onAddChild} 
              onDeleteNode={onDeleteNode} 
              onViewEmployees={onViewEmployees}
              employeeCounts={employeeCounts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [treeData, setTreeData] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState({});
  
  const [showForm, setShowForm] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitEmployees, setUnitEmployees] = useState([]);
  
  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('DEPARTMENT');
  const [parentId, setParentId] = useState('');
  const [costCode, setCostCode] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    apiClient.get('/org/tree')
      .then(res => setTreeData(Array.isArray(res) ? res : res?.data || []))
      .catch(err => setError(err.message || 'Failed to load organization tree hierarchy'));

    apiClient.get('/org')
      .then(res => setAllUnits(Array.isArray(res) ? res : res?.data || []))
      .catch(err => console.error(err));

    apiClient.get('/employees')
      .then(res => {
        const list = Array.isArray(res) ? res : res?.data || res?.employees || [];
        setAllEmployees(list);
        
        // Calculate counts per department name
        const counts = {};
        list.forEach(emp => {
          const dept = (emp.department || emp.departmentName || 'Unassigned').toLowerCase();
          counts[dept] = (counts[dept] || 0) + 1;
        });
        setEmployeeCounts(counts);
      })
      .catch(err => console.error('Failed to load employee list:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewEmployees = (node) => {
    setSelectedUnit(node);
    const matched = allEmployees.filter(emp => {
      const dept = (emp.department || emp.departmentName || '').toLowerCase();
      const nodeName = (node.name || '').toLowerCase();
      return dept === nodeName || dept.includes(nodeName) || nodeName.includes(dept);
    });
    setUnitEmployees(matched);
  };

  const handleCreateNode = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name) return setError('Unit name is required');

    startTransition(async () => {
      try {
        await apiClient.post('/org', {
          name,
          type,
          parentId: parentId || null,
          costCode: costCode || null,
        });

        setMessage('Organization unit created successfully!');
        setName('');
        setCostCode('');
        setParentId('');
        setShowForm(false);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create organization unit');
      }
    });
  };

  const handleAddChildClick = (parentNode) => {
    setParentId(parentNode.id);
    setType('TEAM');
    setShowForm(true);
    setError('');
    setMessage('');
  };

  const handleDeleteNode = async (nodeId) => {
    if (!window.confirm('Are you sure you want to delete this organizational unit? Children nodes will have their parent links unlinked.')) return;
    try {
      await apiClient.delete(`/org/${nodeId}`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete node');
    }
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Organization Chart</h1>
          <p className="page-subtitle">Interactive visual hierarchy - Click any department to view assigned workforce</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setError(''); setMessage(''); }} 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          style={{ width: 'auto', height: '40px', padding: '0 20px' }}
        >
          {showForm ? 'Cancel' : '+ Create Unit'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleCreateNode} className="form-card" style={{ maxWidth: '600px', marginBottom: '32px' }} noValidate>
          <h3>Create Org Unit</h3>
          
          {error && (
            <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 2 }} className={styles.formGroup}>
              <label className={styles.label}>Unit Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div style={{ flex: 1 }} className={styles.formGroup}>
              <label className={styles.label}>Type</label>
              <select
                className={styles.input}
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isPending}
                style={{ appearance: 'none', background: 'var(--bg-tertiary)' }}
              >
                <option value="LEGAL_ENTITY">Legal Entity</option>
                <option value="COST_CENTER">Cost Center</option>
                <option value="DEPARTMENT">Department</option>
                <option value="TEAM">Team</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }} className={styles.formGroup}>
              <label className={styles.label}>Parent Unit (Optional)</label>
              <select
                className={styles.input}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={isPending}
                style={{ appearance: 'none', background: 'var(--bg-tertiary)' }}
              >
                <option value="">-- No Parent (Root Node) --</option>
                {allUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.type.replace('_', ' ')})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }} className={styles.formGroup}>
              <label className={styles.label}>Cost Code (Optional)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. CC-100"
                value={costCode}
                onChange={(e) => setCostCode(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
            {isPending ? 'Saving...' : 'Add Node to Tree'}
          </button>
        </form>
      )}

      {message && (
        <div className={`${styles.alert}`} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', marginBottom: '24px' }}>
          {message}
        </div>
      )}

      <div className="org-chart-container">
        {treeData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)' }}>
            <p>No organizational units found.</p>
            <button 
              onClick={() => setShowForm(true)} 
              className={`${styles.btn} ${styles.btnPrimary}`} 
              style={{ width: 'auto', display: 'inline-flex', marginTop: '16px' }}
            >
              Add First Org Node
            </button>
          </div>
        ) : (
          <div className="org-tree">
            {treeData.map((root) => (
              <OrgTreeNode 
                key={root.id} 
                node={root} 
                onAddChild={handleAddChildClick} 
                onDeleteNode={handleDeleteNode} 
                onViewEmployees={handleViewEmployees}
                employeeCounts={employeeCounts}
              />
            ))}
          </div>
        )}
      </div>

      {/* DEPARTMENT EMPLOYEES LIST MODAL */}
      {selectedUnit && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setSelectedUnit(null)}
        >
          <div 
            className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {selectedUnit.type.replace('_', ' ')}
                  </span>
                  <h2 className="text-xl font-bold text-white">{selectedUnit.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Department workforce roster ({unitEmployees.length} registered member{unitEmployees.length !== 1 ? 's' : ''})
                </p>
              </div>
              <button 
                onClick={() => setSelectedUnit(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {unitEmployees.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="text-3xl">👥</div>
                <p className="text-sm font-medium">No employees assigned to {selectedUnit.name} yet.</p>
                <p className="text-xs text-slate-500">Go to Employee Directory to assign team members to this unit.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 uppercase text-[10px] tracking-wider text-slate-400 font-semibold sticky top-0">
                    <tr>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {unitEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-medium text-white flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                            {(emp.firstName?.[0] || emp.name?.[0] || 'E').toUpperCase()}
                          </div>
                          <div>
                            <div>{emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : emp.name || emp.email}</div>
                            <div className="text-[10px] text-slate-500">{emp.employeeCode || emp.id}</div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{emp.email}</td>
                        <td className="p-3 font-medium text-slate-300">{emp.role || emp.jobTitle || 'Team Member'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (emp.status || 'ACTIVE') === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {emp.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
