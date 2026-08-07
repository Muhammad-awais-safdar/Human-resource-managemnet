'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, ShieldAlert, Plane } from 'lucide-react';
import * as leaveService from '../../../services/leaveService';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/primitives/Card';

export default function LeavesPage() {
  const [policies, setPolicies] = useState([]);
  const [requests, setRequests] = useState([]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Leaves & Vacation Control</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Administer annual vacation allocations, approve leave applications, and view team calendar blocks.
        </p>
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
              <CardTitle>Leave Applications & Approvals</CardTitle>
              <CardDescription>Review pending employee leave requests.</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3">
            {requests.map(req => (
              <div 
                key={req.id} 
                className="p-4 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-xs text-[var(--text-primary)]">
                    {req.firstName} {req.lastName}
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

                {req.status === 'PENDING' && (
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

            {requests.length === 0 && (
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
            const currentDayDate = new Date(2026, 6, dayNum);
            const activeLeavesOnDay = requests.filter(r => {
              if (r.status !== 'APPROVED') return false;
              if (!r.startDate || !r.endDate) return true;
              const start = new Date(r.startDate);
              const end = new Date(r.endDate);
              return currentDayDate >= start && currentDayDate <= end;
            });

            return (
              <div key={idx} className="min-h-20 border border-[var(--border-subtle)] rounded-lg p-2 bg-[var(--bg-surface-l1)]/50">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">July {dayNum}</span>
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
    </div>
  );
}
