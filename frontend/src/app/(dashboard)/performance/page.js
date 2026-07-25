'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as performanceService from '../../../services/performanceService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function PerformancePage() {
  const [goals, setGoals] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [targetValue, setTargetValue] = useState(100);

  // Peer Feedback Form
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    performanceService.getGoals()
      .then(res => setGoals(Array.isArray(res) ? res : []))
      .catch(err => console.error('Failed to fetch goals:', err));

    performanceService.getPeerFeedback()
      .then(res => setFeedbacks(Array.isArray(res) ? res : []))
      .catch(err => console.error('Failed to fetch peer feedback:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!goalTitle.trim()) return setError('Goal title is required.');

    startTransition(async () => {
      try {
        await performanceService.createGoal({
          title: goalTitle,
          targetValue: parseInt(targetValue, 10) || 100
        });
        setMessage(`Performance goal '${goalTitle}' registered.`);
        setGoalTitle('');
        setTargetValue(100);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create goal.');
      }
    });
  };

  const handleSliderChange = (id, newProgress) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentValue: newProgress, current_value: newProgress } : g));
  };

  const handleSaveProgress = (id, progress) => {
    setError('');
    setMessage('');
    startTransition(async () => {
      try {
        await performanceService.updateGoalProgress(id, progress);
        setMessage('Goal completion progress logged.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to update progress.');
      }
    });
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!feedbackText.trim()) return setError('Feedback details are required.');

    startTransition(async () => {
      try {
        await performanceService.submitPeerFeedback({
          targetEmployeeId: targetEmployeeId || 'emp-peer',
          feedback: feedbackText,
          rating: parseInt(rating, 10)
        });
        setMessage('360° Peer Review submitted successfully!');
        setFeedbackText('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to submit peer review.');
      }
    });
  };

  return (
    <div>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Performance & OKR Goal Tracker</h1>
        <p className="page-subtitle">Track quarterly key results, monitor completion metrics, and participate in 360° peer reviews</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {/* Goals Progress List */}
        <div className="form-card" style={{ flex: 2, minWidth: '400px', margin: 0 }}>
          <h3>Quarterly OKR Objectives</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {goals.map(g => {
              const current = g.currentValue ?? g.current_value ?? 0;
              const target = g.targetValue ?? g.target_value ?? 100;
              const pct = Math.min(100, Math.round((current / target) * 100));

              return (
                <div key={g.id} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{g.title}</strong>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: pct >= 100 ? 'var(--accent-success)' : 'var(--accent-primary)' }}>
                      {pct}% Complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '8px', margin: '12px 0 16px 0', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--accent-success)' : 'var(--accent-primary)', height: '100%', transition: 'width 0.3s' }} />
                  </div>

                  {/* Slider Control */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="0"
                      max={target}
                      value={current}
                      onChange={(e) => handleSliderChange(g.id, parseInt(e.target.value, 10))}
                      style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                    />
                    <button
                      onClick={() => handleSaveProgress(g.id, current)}
                      className={styles.btn}
                      style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
                      disabled={isPending}
                    >
                      Save Progress
                    </button>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No quarterly OKR goals set.</p>
            )}
          </div>
        </div>

        {/* Add Goal Form */}
        <div className="form-card" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
          <h3>Set New OKR Target</h3>
          <form onSubmit={handleCreateGoal} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Goal Title / Objective *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Reduce API p99 latency under 50ms"
                value={goalTitle}
                onChange={e => setGoalTitle(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Target Target Value (%)</label>
              <input
                type="number"
                className={styles.input}
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                disabled={isPending}
              />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }} disabled={isPending}>
              Register Goal Objective
            </button>
          </form>
        </div>
      </div>

      {/* 360 Peer Feedback Review Section */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="form-card" style={{ flex: 2, minWidth: '400px', margin: 0 }}>
          <h3>360° Peer Review History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {feedbacks.map((f, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Review for: {f.targetEmployeeName || f.target_employee_id || 'Team Member'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From: {f.reviewerEmail || f.reviewer_email || 'Anonymous Peer'}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--accent-warning)', fontWeight: '800' }}>
                    {'⭐'.repeat(f.rating || 5)} ({f.rating || 5}/5)
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  "{f.feedback}"
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No peer feedback logged yet.</p>
            )}
          </div>
        </div>

        <div className="form-card" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
          <h3>Submit 360° Peer Review</h3>
          <form onSubmit={handleSubmitFeedback} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Performance Rating</label>
              <select className={styles.input} value={rating} onChange={e => setRating(e.target.value)} disabled={isPending}>
                <option value="5">⭐⭐⭐⭐⭐ 5 - Outstanding Performance</option>
                <option value="4">⭐⭐⭐⭐ 4 - Exceeds Expectations</option>
                <option value="3">⭐⭐⭐ 3 - Meets Expectations</option>
                <option value="2">⭐⭐ 2 - Needs Improvement</option>
                <option value="1">⭐ 1 - Unsatisfactory</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Peer Feedback Remarks *</label>
              <textarea
                className={styles.input}
                rows={4}
                placeholder="Great leadership in resolving production platform outages."
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                disabled={isPending}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }} disabled={isPending}>
              Submit Peer Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
