'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Mail, Shield, Building, Filter, CheckCircle2, User, ChevronRight, RefreshCw } from 'lucide-react';
import * as employeeService from '../../../services/employeeService';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Badge } from '@/components/primitives/Badge';
import { Card } from '@/components/primitives/Card';
import { TableSkeleton } from '@/components/primitives/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/primitives/Dialog';

export default function EmployeeDirectoryPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    employeeService.listEmployees()
      .then(res => {
        if (res.success) {
          setEmployees(res.data || []);
        } else {
          setError(res.message || 'Failed to fetch employee records.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to connect to employee endpoint.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteLoading(true);
    employeeService.inviteEmployee({ email: inviteEmail, role: inviteRole })
      .then(res => {
        if (res.success) {
          setInviteSuccess(`Invitation successfully sent to ${inviteEmail}!`);
          setInviteEmail('');
          fetchEmployees();
        } else {
          setError(res.message || 'Failed to dispatch employee invitation.');
        }
        setInviteLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Invitation request failed.');
        setInviteLoading(false);
      });
  };

  const filteredEmployees = employees.filter(emp => {
    const name = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.email || ''} ${emp.employeeCode || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Employee Directory</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage corporate employee directory records, role permissions, and profile 360 views.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchEmployees} icon={RefreshCw} size="sm">
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setIsInviteOpen(true)} icon={UserPlus} size="sm">
            Invite Employee
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span>Showing <strong className="text-[var(--text-primary)]">{filteredEmployees.length}</strong> employees</span>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="underline text-xs">Dismiss</button>
        </div>
      )}

      {/* EMPLOYEE DATA TABLE */}
      {loading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : filteredEmployees.length === 0 ? (
        <Card className="text-center py-12">
          <User className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No Employees Found</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Try clearing your search filters or invite new team members.</p>
        </Card>
      ) : (
        <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-surface-l2)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Work Email</th>
                  <th className="py-3 px-4">Corporate Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id || emp.email} className="hover:bg-[var(--bg-surface-l2)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30 text-xs shrink-0">
                          {(emp.firstName || emp.name || emp.email || 'E').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">
                            {emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : emp.name || emp.email}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">ID: {emp.employeeCode || emp.id || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{emp.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant="primary">
                        {emp.roleName || emp.role || 'EMPLOYEE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {emp.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/employees/${emp.id || 1}`}>
                        <Button variant="ghost" size="sm" icon={ChevronRight}>
                          Profile 360
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITE EMPLOYEE MODAL DIALOG */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Employee to Workspace</DialogTitle>
            <DialogDescription>
              Send an email invitation link to join this corporate multi-tenant workspace.
            </DialogDescription>
          </DialogHeader>

          {inviteSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{inviteSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendInvite} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Work Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                icon={Mail}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Assigned System Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="EMPLOYEE">Employee (ESS)</option>
                <option value="HR_MANAGER">HR Department Manager</option>
                <option value="TENANT_ADMIN">Tenant Administrator</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={inviteLoading}>
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
