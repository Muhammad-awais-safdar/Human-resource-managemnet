'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Network, Plus, Trash2, Building, Shield, ChevronRight, Layers, Tag } from 'lucide-react';
import apiClient from '../../../services/api';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle } from '@/components/primitives/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/primitives/Dialog';

function OrgTreeNode({ node, onAddChild, onDeleteNode }) {
  const isLeaf = !node.children || node.children.length === 0;

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'LEGAL_ENTITY': return 'warning';
      case 'COST_CENTER': return 'purple';
      case 'DEPARTMENT': return 'primary';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Card className="w-64 bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] shadow-xl relative group hover:border-[var(--accent-primary)] transition-all p-4">
        <div className="flex justify-between items-center mb-2">
          <Badge variant={getBadgeVariant(node.type)}>
            {node.type.replace('_', ' ')}
          </Badge>
          {node.costCode && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-l2)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
              {node.costCode}
            </span>
          )}
        </div>

        <h4 className="font-bold text-xs text-[var(--text-primary)] truncate">{node.name}</h4>

        <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <Button variant="secondary" size="sm" className="flex-1 text-[10px] h-7" onClick={() => onAddChild(node)} icon={Plus}>
            Add Child
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2" onClick={() => onDeleteNode(node.id)} icon={Trash2} />
        </div>
      </Card>

      {!isLeaf && (
        <div className="flex flex-col items-center w-full">
          <div className="w-[1px] h-6 bg-[var(--border-strong)]" />
          <div className="flex gap-6 items-start pt-2 border-t border-[var(--border-strong)]">
            {node.children.map((child) => (
              <OrgTreeNode 
                key={child.id} 
                node={child} 
                onAddChild={onAddChild} 
                onDeleteNode={onDeleteNode} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [treeData, setTreeData] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState('');
  const [type, setType] = useState('DEPARTMENT');
  const [parentId, setParentId] = useState('');
  const [costCode, setCostCode] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    apiClient.get('/org')
      .then(res => {
        if (Array.isArray(res)) setTreeData(res);
        else setTreeData(res.data || []);
      })
      .catch(err => console.error(err));

    apiClient.get('/org')
      .then(res => {
        if (Array.isArray(res)) setAllUnits(res);
        else setAllUnits(res.data || []);
      })
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
    if (!window.confirm('Are you sure you want to delete this organizational unit?')) return;
    try {
      await apiClient.delete(`/org/${nodeId}`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete node');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Organization Chart</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Define legal entities, cost centers, departments, and team hierarchies.
          </p>
        </div>

        <Button variant="primary" onClick={() => { setShowForm(true); setError(''); setMessage(''); }} icon={Plus} size="sm">
          Create Org Unit
        </Button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
          {message}
        </div>
      )}

      {/* CREATE NODE MODAL DIALOG */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Organizational Unit</DialogTitle>
            <DialogDescription>
              Create a new department, team, cost center, or legal entity node in the corporate hierarchy tree.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateNode} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Unit Name</label>
              <Input
                placeholder="e.g. Engineering Department"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Unit Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="LEGAL_ENTITY">Legal Entity</option>
                  <option value="COST_CENTER">Cost Center</option>
                  <option value="DEPARTMENT">Department</option>
                  <option value="TEAM">Team</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Cost Code</label>
                <Input
                  placeholder="e.g. CC-100"
                  value={costCode}
                  onChange={(e) => setCostCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Parent Unit</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="">-- Root Level (No Parent) --</option>
                {allUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.type.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isPending}>
                Create Unit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VISUAL HIERARCHY TREE CANVAS */}
      <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-8 overflow-x-auto min-h-[400px] flex justify-center items-start">
        {treeData.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No Hierarchy Units Found</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">Start by adding your root organizational legal entity or main department.</p>
            <Button variant="primary" onClick={() => setShowForm(true)} icon={Plus} size="sm">
              Add Root Node
            </Button>
          </div>
        ) : (
          <div className="flex gap-8 items-start">
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
