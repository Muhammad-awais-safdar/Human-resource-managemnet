'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { 
  CheckCircle2, Clock, Calendar, DollarSign, Plane, AlertCircle, 
  UserCheck, RefreshCw, ArrowRight, Shield, Check, X, Users
} from 'lucide-react';
import * as approvalService from '../../../services/unifiedApprovalService';

export default function ApprovalsPage() {
  const [counts, setCounts] = useState({ totalPending: 0, leaveCount: 0, expenseCount: 0, travelCount: 0, timesheetCount: 0 });
  const [delegations, setDelegations] = useState([]);
  const [delegator, setDelegator] = useState('manager@workforceos.com');
  const [delegatee, setDelegatee] = useState('deputy@workforceos.com');
  const [reason, setReason] = useState('Out on vacation leave handover');
  const [loading, setLoading] = useState(true);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [countsRes, delegationsRes] = await Promise.all([
        approvalService.getPendingCounts().catch(() => ({})),
        approvalService.getDelegations().catch(() => ([]))
      ]);
      setCounts(countsRes || {});
      setDelegations(Array.isArray(delegationsRes) ? delegationsRes : []);
    } catch (err) {
      console.error("Failed to load approval data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelegate = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!delegator.trim() || !delegatee.trim()) {
      return setError('Please enter both your manager email and substitute manager email.');
    }

    startTransition(async () => {
      try {
        await approvalService.delegateApproval({ 
          delegatorEmail: delegator.trim(), 
          delegateeEmail: delegatee.trim(), 
          reason: reason.trim() 
        });
        setMessage('Approval duties successfully assigned to your substitute!');
        loadData();
      } catch (err) {
        setError(err.message || 'Could not pass approval duties. Please try again.');
      }
    });
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        borderRadius: '16px',
        padding: '2rem 2.5rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
              <UserCheck size={26} color="#38bdf8" />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Team Approvals
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.5 }}>
            Review and approve leave requests, expense claims, travel plans, and timesheets submitted by your team.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
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
          Refresh Requests
        </button>
      </div>

      {/* Notifications */}
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

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Time Off */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.85rem', background: '#e0e7ff', borderRadius: '12px', color: '#4338ca' }}>
            <Calendar size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Time Off Requests</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{counts.leaveCount || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>Pending review</div>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.85rem', background: '#dcfce7', borderRadius: '12px', color: '#15803d' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Expense Claims</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{counts.expenseCount || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>Needs approval</div>
          </div>
        </div>

        {/* Travel */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.85rem', background: '#e0f2fe', borderRadius: '12px', color: '#0369a1' }}>
            <Plane size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Travel Requests</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{counts.travelCount || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>Pending sign-off</div>
          </div>
        </div>

        {/* Timesheets */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.85rem', background: '#fef3c7', borderRadius: '12px', color: '#b45309' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Timesheet Reviews</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{counts.timesheetCount || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>Awaiting verification</div>
          </div>
        </div>

      </div>

      {/* Main Two Column Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
        
        {/* Delegation Form */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', color: '#0f172a' }}>
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Delegate Your Approvals
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Assign a substitute manager to handle your approvals when you're away.
              </p>
            </div>
          </div>

          <form onSubmit={handleDelegate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Your Manager Email
              </label>
              <input 
                type="email" 
                value={delegator} 
                onChange={e => setDelegator(e.target.value)} 
                disabled={isPending}
                placeholder="e.g. manager@workforceos.com"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Substitute Manager Email
              </label>
              <input 
                type="email" 
                value={delegatee} 
                onChange={e => setDelegatee(e.target.value)} 
                disabled={isPending}
                placeholder="e.g. deputy@workforceos.com"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Reason or Note
              </label>
              <input 
                type="text" 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                disabled={isPending}
                placeholder="e.g. On annual leave until Friday"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)',
                marginTop: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {isPending ? 'Assigning Substitute...' : 'Pass Approval Duties'}
            </button>
          </form>
        </div>

        {/* Active Substitutes List */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', color: '#0f172a' }}>
              <Shield size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Current Approval Substitutes
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Active rules delegating team approvals to other managers.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.isArray(delegations) && delegations.length > 0 ? (
              delegations.map((d, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '1.25rem', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                      <span>{d.delegator_email || d.delegatorEmail}</span>
                      <ArrowRight size={16} color="#64748b" />
                      <span style={{ color: '#4338ca' }}>{d.delegatee_email || d.delegateeEmail}</span>
                    </div>

                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {d.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    <strong>Note:</strong> {d.reason || 'Temporary handover'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <UserCheck size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>No Substitutes Assigned</div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Your team approvals will stay with you until you assign a substitute.</div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
