'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, ShieldAlert, Plane, PlusCircle, Send } from 'lucide-react';
import * as leaveService from '../../../services/leaveService';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/primitives/Card';
import usePermissions from '@/hooks/usePermissions';

export default function LeavesPage() {
  const { hasRole, hasPermission, email } = usePermissions();
  const [policies, setPolicies] = useState([]);
  const [requests, setRequests] = useState([]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Apply for Leave Form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canApprove = hasRole('ADMIN') || 
                     hasRole('SYSTEM_ADMIN') || 
                     hasRole('TENANT_ADMIN') || 
                     hasRole('HR_MANAGER') || 
                     hasRole('LINE_MANAGER') || 
                     hasPermission('leave:request:approve');

  const displayedRequests = canApprove 
    ? requests 
    : requests.filter(req => email && req.email === email);

  const loadData = () => {
    leaveService.getPolicies()
      .then(res => setPolicies(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error(err));

    leaveService.getRequests()
      .then(res => setRequests(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (requestId, approved) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await leaveService.updateRequestStatus(requestId, {
          status: approved ? 'APPROVED' : 'REJECTED',
        });
        if (res.success || res) {
          setMessage(`Leave application status successfully updated.`);
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to update leave status.');
      }
    });
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!selectedPolicyId || !startDate || !endDate) {
      setError('Please fill in all required leave application fields.');
      return;
    }
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await leaveService.submitRequest({
        policyId: selectedPolicyId,
        startDate,
        endDate,
        reason
      });
      setMessage('Leave application submitted successfully for manager approval!');
      setShowApplyModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[var(--border-subtle)] pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Leaves & Vacation Control</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {canApprove 
              ? 'Administer annual vacation allocations, approve employee leave applications, and view team calendar blocks.' 
              : 'View your vacation allowances, track leave application status, and apply for time off.'}
          </p>
        </div>

        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setShowApplyModal(true)} 
          icon={PlusCircle}
        >
          Apply for Leave
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vacation policies allowance card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Vacation Allowances</CardTitle>
              <CardDescription>Configured annual leave policy limits.</CardDescription>
            </div>
          </CardHeader>
          
          <div className="space-y-3">
            {policies.map(p => (
              <div 
                key={p.id} 
                className="p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl flex justify-between items-center"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">{p.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{p.description}</div>
                </div>
                <div className="text-sm font-extrabold text-[var(--accent-primary)] font-mono">
                  {p.allowance} Days
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Requests & Approvals checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{canApprove ? 'Leave Applications & Approvals' : 'My Leave Applications'}</CardTitle>
              <CardDescription>
                {canApprove ? 'Review pending employee leave requests.' : 'Track the status of your submitted leave applications.'}
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3">
            {displayedRequests.map(req => (
              <div 
                key={req.id} 
                className="p-4 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-xs text-[var(--text-primary)]">
                    {req.firstName} {req.lastName} {req.email === email ? '(You)' : ''}
                  </div>
                  <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'danger'}>
                    {req.status}
                  </Badge>
                </div>

                <div className="text-xs text-[var(--text-secondary)]">
                  Policy: <span className="text-[var(--text-primary)] font-semibold">{req.policyName}</span> | Range: <span className="font-mono text-indigo-400">{req.startDate}</span> to <span className="font-mono text-indigo-400">{req.endDate}</span>
                </div>

                {req.reason && (
                  <div className="text-[11px] text-[var(--text-muted)] italic">
                    &quot;{req.reason}&quot;
                  </div>
                )}

                {/* Approvals action panel: Only visible to authorized Managers/Admins, and self-approval is blocked */}
                {canApprove && req.status === 'PENDING' && req.email !== email && (
                  <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={() => handleApprove(req.id, true)} 
                      isLoading={isPending}
                      icon={CheckCircle2}
                    >
                      Approve Request
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleApprove(req.id, false)} 
                      isLoading={isPending}
                      icon={XCircle}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {displayedRequests.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] text-center py-8">No active leave requests found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Visual Team Leave Calendar */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Team Vacation Calendar Mappings</CardTitle>
            <CardDescription>Active overlapping timeline schedules across departments.</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-7 gap-2 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] p-4 rounded-xl">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center font-bold text-[10px] text-[var(--text-muted)] pb-2 uppercase tracking-wider border-b border-[var(--border-subtle)]">
              {day}
            </div>
          ))}
          {Array.from({ length: 14 }).map((_, idx) => {
            const dayNum = idx + 1;
            const currentDayDate = new Date(2026, 9, dayNum);
            const activeLeavesOnDay = requests.filter(r => {
              if (r.status !== 'APPROVED') return false;
              if (!r.startDate || !r.endDate) return true;
              const start = new Date(r.startDate);
              const end = new Date(r.endDate);
              return currentDayDate >= start && currentDayDate <= end;
            });

            return (
              <div key={idx} className="min-h-20 border border-[var(--border-subtle)] rounded-lg p-2 bg-[var(--bg-surface-l1)]/50">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">October {dayNum}</span>
                {activeLeavesOnDay.map(l => (
                  <div key={l.id} className="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-1.5 py-1 rounded mt-1 font-semibold truncate flex items-center gap-1">
                    <Plane className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{l.firstName}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leave Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Submit Leave Application</h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Select Leave Type</label>
                <select 
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                  required
                >
                  <option value="">-- Select Leave Policy --</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.allowance} Days Total)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start Date</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">End Date</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Reason / Notes</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide reason for time-off request..."
                  className="w-full bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500 h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <Button 
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  icon={Send}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

