'use client';

import React, { useEffect, useState } from 'react';
import * as suiteService from '../../../services/suiteService';

export default function PerformancePage() {
  const [goals, setGoals] = useState([]);
  const [peerFeedback, setPeerFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('goals');
  const [loading, setLoading] = useState(true);

  // Goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(100);

  // Progress update
  const [progressGoalId, setProgressGoalId] = useState('');
  const [progress, setProgress] = useState(0);

  // Peer feedback form
  const [targetEmpId, setTargetEmpId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);

  const [message, setMessage] = useState('');

  const loadData = () => {
    Promise.all([
      suiteService.getGoals().catch(() => []),
      suiteService.getPeerFeedback().catch(() => []),
    ]).then(([g, f]) => { setGoals(g); setPeerFeedback(f); }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await suiteService.createGoal({ title: goalTitle, targetValue: Number(goalTarget) });
      setMessage('✅ Goal created!'); setGoalTitle(''); setGoalTarget(100); loadData();
    } catch { setMessage('❌ Failed to create goal.'); }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      await suiteService.updateGoalProgress(progressGoalId, { progress: Number(progress) });
      setMessage('✅ Progress updated!'); setProgressGoalId(''); setProgress(0); loadData();
    } catch { setMessage('❌ Failed to update progress.'); }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await suiteService.submitPeerFeedback({ targetEmployeeId: targetEmpId, feedback: feedbackText, rating: Number(rating) });
      setMessage('✅ Peer feedback submitted!'); setTargetEmpId(''); setFeedbackText(''); setRating(5); loadData();
    } catch { setMessage('❌ Failed to submit feedback.'); }
  };

  const statusColor = { NOT_STARTED: '#64748b', IN_PROGRESS: '#f59e0b', COMPLETED: '#10b981' };
  const progressPct = (g) => Math.min(100, Math.round((g.current_value / g.target_value) * 100));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.icon}>📈</span>
        <h1 style={styles.title}>Performance Management</h1>
        <p style={styles.subtitle}>Track goals, update progress, and submit peer reviews</p>
      </div>

      {message && (
        <div style={{ ...styles.alert, background: message.startsWith('✅') ? '#064e3b' : '#7f1d1d' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'goals', label: '🎯 Goals' },
          { id: 'create', label: '➕ Create Goal' },
          { id: 'progress', label: '📊 Update Progress' },
          { id: 'peer', label: '🤝 Peer Feedback' },
          { id: 'received', label: '💬 Received Feedback' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingBar}><div style={styles.loadingProgress} /></div>
      ) : (
        <div style={styles.card}>
          {/* Goals List */}
          {activeTab === 'goals' && (
            goals.length === 0 ? <p style={styles.empty}>No goals found. Create one!</p> : (
              goals.map((g, i) => (
                <div key={i} style={styles.goalItem}>
                  <div style={{ flex: 1 }}>
                    <p style={styles.goalTitle}>{g.title}</p>
                    <div style={styles.progressTrack}>
                      <div style={{ ...styles.progressFill, width: `${progressPct(g)}%`, background: statusColor[g.status] || '#06b6d4' }} />
                    </div>
                    <p style={styles.goalMeta}>{g.current_value} / {g.target_value} — {progressPct(g)}%</p>
                  </div>
                  <span style={{ ...styles.statusBadge, color: statusColor[g.status], background: `${statusColor[g.status]}20` }}>
                    {g.status}
                  </span>
                </div>
              ))
            )
          )}

          {/* Create Goal */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateGoal} style={styles.form}>
              <label style={styles.label}>Goal Title</label>
              <input style={styles.input} value={goalTitle} onChange={e => setGoalTitle(e.target.value)} required placeholder="e.g., Complete 10 Projects" />
              <label style={styles.label}>Target Value (numeric)</label>
              <input type="number" min="1" style={styles.input} value={goalTarget} onChange={e => setGoalTarget(e.target.value)} required />
              <button type="submit" style={styles.button}>Create Goal</button>
            </form>
          )}

          {/* Update Progress */}
          {activeTab === 'progress' && (
            <form onSubmit={handleUpdateProgress} style={styles.form}>
              <label style={styles.label}>Goal ID</label>
              <select style={styles.input} value={progressGoalId} onChange={e => setProgressGoalId(e.target.value)} required>
                <option value="">Select a goal…</option>
                {goals.map((g, i) => <option key={i} value={g.id}>{g.title}</option>)}
              </select>
              <label style={styles.label}>Current Progress (0–100)</label>
              <input type="number" min="0" max="100" style={styles.input} value={progress} onChange={e => setProgress(e.target.value)} required />
              <button type="submit" style={styles.button}>Update Progress</button>
            </form>
          )}

          {/* Submit Peer Feedback */}
          {activeTab === 'peer' && (
            <form onSubmit={handleSubmitFeedback} style={styles.form}>
              <label style={styles.label}>Target Employee ID</label>
              <input style={styles.input} value={targetEmpId} onChange={e => setTargetEmpId(e.target.value)} required placeholder="Enter employee UUID" />
              <label style={styles.label}>Feedback</label>
              <textarea style={{ ...styles.input, height: '100px', resize: 'none' }} value={feedbackText} onChange={e => setFeedbackText(e.target.value)} required placeholder="Write your peer feedback..." />
              <label style={styles.label}>Rating (1–5)</label>
              <input type="number" min="1" max="5" style={styles.input} value={rating} onChange={e => setRating(e.target.value)} required />
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4,5].map(s => (
                  <button type="button" key={s} onClick={() => setRating(s)}
                    style={{ ...styles.starBtn, background: s <= rating ? 'rgba(251,191,36,0.2)' : 'transparent', color: s <= rating ? '#fbbf24' : '#475569' }}>
                    ★
                  </button>
                ))}
              </div>
              <button type="submit" style={styles.button}>Submit Feedback</button>
            </form>
          )}

          {/* Received Feedback */}
          {activeTab === 'received' && (
            peerFeedback.length === 0 ? <p style={styles.empty}>No peer feedback received yet.</p> : (
              peerFeedback.map((f, i) => (
                <div key={i} style={styles.feedbackCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>{f.reviewer_first} {f.reviewer_last}</p>
                    <span style={styles.ratingBadge}>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                  </div>
                  <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '0.9rem' }}>{f.feedback}</p>
                  <p style={{ color: '#475569', margin: '4px 0 0', fontSize: '0.75rem' }}>{new Date(f.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '32px' },
  icon: { fontSize: '48px' },
  title: { fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px', background: 'linear-gradient(90deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#94a3b8', fontSize: '0.95rem', margin: 0 },
  alert: { borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', color: '#fff', fontWeight: 500 },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(129,140,248,0.2)', border: '1px solid #818cf8', color: '#818cf8' },
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' },
  label: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 },
  input: { width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.9rem', boxSizing: 'border-box' },
  button: { padding: '11px 24px', background: 'linear-gradient(90deg, #818cf8, #06b6d4)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', width: 'fit-content' },
  goalItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  goalTitle: { fontWeight: 600, margin: '0 0 8px', fontSize: '0.95rem' },
  progressTrack: { height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },
  goalMeta: { color: '#64748b', fontSize: '0.75rem', margin: '4px 0 0' },
  statusBadge: { borderRadius: '6px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' },
  feedbackCard: { background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.07)' },
  ratingBadge: { color: '#fbbf24', fontSize: '1rem', letterSpacing: '2px' },
  starBtn: { width: '36px', height: '36px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#475569', textAlign: 'center', padding: '32px 0' },
  loadingBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '20px' },
  loadingProgress: { height: '100%', width: '60%', background: 'linear-gradient(90deg, #818cf8, #06b6d4)', borderRadius: '2px' },
};
