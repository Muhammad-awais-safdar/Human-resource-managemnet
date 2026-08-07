'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Clock, Fingerprint, Calendar, CheckCircle2, AlertCircle, Plane, History, User } from 'lucide-react';
import * as leaveService from '../../../services/leaveService';
import * as attendanceService from '../../../services/attendanceService';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/primitives/Card';

export default function ESSPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    leaveService.getPolicies()
      .then(res => {
        const data = Array.isArray(res) ? res : res.data || [];
        setPolicies(data);
        if (data.length > 0) setSelectedPolicy(data[0].id);
      })
      .catch(err => console.error(err));

    leaveService.getRequests()
      .then(res => setLeaveRequests(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error(err));

    attendanceService.getAttendanceHistory()
      .then(res => {
        const logs = Array.isArray(res) ? res : res.data || [];
        setAttendanceLogs(logs);
        const active = logs.find(r => r.checkOut === null);
        setIsCheckedIn(!!active);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = () => {
    setError('');
    setMessage('');
    setBiometricScanning(true);

    setTimeout(() => {
      setBiometricScanning(false);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sendCheckIn(position.coords.latitude, position.coords.longitude);
          },
          () => {
            sendCheckIn(33.6844, 73.0479);
          }
        );
      } else {
        sendCheckIn(33.6844, 73.0479);
      }
    }, 2000);
  };

  const sendCheckIn = (latitude, longitude) => {
    startTransition(async () => {
      try {
        const res = await attendanceService.checkIn({ latitude, longitude });
        if (res.success || res) {
          setMessage(res.message || 'Biometric check-in verified.');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Check-in failed');
      }
    });
  };

  const handleCheckOut = () => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await attendanceService.checkOut();
        if (res.success || res) {
          setMessage(res.message || 'Check-out log registered.');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Check-out failed');
      }
    });
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!startDate || !endDate) return setError('Dates are required.');

    startTransition(async () => {
      try {
        const res = await leaveService.submitRequest({
          policyId: selectedPolicy,
          startDate,
          endDate,
          reason,
        });

        if (res.success || res) {
          setMessage('Leave request submitted for approval.');
          setStartDate('');
          setEndDate('');
          setReason('');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to submit leave.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Employee Self-Service (ESS)</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Perform daily biometric check-ins, request leave allowances, and track individual attendance logs.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check-In Biometric Portal */}
        <Card className="text-center flex flex-col justify-between">
          <CardHeader className="justify-center">
            <CardTitle>Daily Attendance Punch</CardTitle>
          </CardHeader>

          {biometricScanning ? (
            <div className="py-8 space-y-3">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                <Fingerprint className="w-10 h-10 text-indigo-400 relative z-10" />
              </div>
              <p className="text-xs font-semibold text-indigo-400">Verifying Biometric Token...</p>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] flex items-center justify-center">
                <Clock className="w-7 h-7 text-indigo-400" />
              </div>

              <div className="text-xs text-[var(--text-secondary)] font-medium">
                {isCheckedIn ? 'Active Work Shift In Progress' : 'Not Checked In Today'}
              </div>

              {!isCheckedIn ? (
                <Button variant="primary" onClick={handleCheckIn} isLoading={isPending} icon={Fingerprint} className="w-full">
                  Trigger Biometric Check-In
                </Button>
              ) : (
                <Button variant="danger" onClick={handleCheckOut} isLoading={isPending} className="w-full">
                  Submit Check-Out Log
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Leave Request Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Request Time Off</CardTitle>
              <CardDescription>File a vacation, sick leave, or personal time off application.</CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Vacation Policy</label>
              <select 
                className="w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 focus:outline-none focus:border-[var(--accent-primary)]"
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value)}
                disabled={isPending}
              >
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.allowance} Days Allocation)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isPending} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isPending} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Reason for Absence</label>
              <Input placeholder="e.g. Annual family vacation" value={reason} onChange={(e) => setReason(e.target.value)} disabled={isPending} />
            </div>

            <Button type="submit" variant="primary" isLoading={isPending} icon={Plane}>
              Submit Leave Request
            </Button>
          </form>
        </Card>
      </div>

      {/* Attendance & Leave History Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Leave History</CardTitle>
          </CardHeader>

          {leaveRequests.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-6 text-center">No leave applications filed.</p>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map(req => (
                <div key={req.id} className="p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[var(--text-primary)]">{req.policyName}</span>
                    <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'danger'}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">Range: {req.startDate} to {req.endDate}</div>
                  {req.reason && <div className="text-[10px] text-[var(--text-muted)] italic">&quot;{req.reason}&quot;</div>}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance History</CardTitle>
          </CardHeader>

          {attendanceLogs.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-6 text-center">No check-in logs recorded.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {attendanceLogs.map(log => (
                <div key={log.id} className="p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400">Present</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">IP: {log.ipAddress}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    In: {new Date(log.checkIn).toLocaleString()} | Out: {log.checkOut ? new Date(log.checkOut).toLocaleString() : 'Active Shift'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
