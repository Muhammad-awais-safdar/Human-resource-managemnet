'use client';

import React, { useEffect, useState, useTransition } from 'react';
import apiClient from '../../../services/api';
import styles from '../../../modules/auth/styles/register.module.css';

// Recursive React component to render the visual tree nodes and connection lines
function OrgTreeNode({ node, onAddChild, onDeleteNode }) {
  const isLeaf = !node.children || node.children.length === 0;

  return (
    <div className="org-node-wrapper">
      <div className="org-node">
        <div className={`org-node-badge badge-${node.type.toLowerCase()}`}>
          {node.type.replace('_', ' ')}
        </div>
        <div className="org-node-title">{node.name}</div>
        {node.costCode && <div className="org-node-meta">Code: {node.costCode}</div>}
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
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
  const [showForm, setShowForm] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('DEPARTMENT');
  const [parentId, setParentId] = useState('');
  const [costCode, setCostCode] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    // Fetch hierarchical tree
    apiClient.get('/org/tree')
      .then(res => setTreeData(res))
      .catch(err => console.error(err));

    // Fetch flat list for parent dropdown selectors
    apiClient.get('/org')
      .then(res => setAllUnits(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

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
        // Displays circular loop dependency warnings from backend
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
          <p className="page-subtitle">Define legal entities, cost centers, departments, and team hierarchies</p>
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
                placeholder="e.g. Finance Department"
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
