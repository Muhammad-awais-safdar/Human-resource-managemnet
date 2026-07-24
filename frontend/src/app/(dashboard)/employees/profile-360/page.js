'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as emp360Service from '../../../../services/employee360Service';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function Employee360ProfilePage() {
  const [profile, setProfile] = useState({ skills: [], notes: [], careerTimeline: [], compensationHistory: [] });
  const [noteContent, setNoteContent] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    emp360Service.get360Profile('emp-demo-101')
      .then(res => setProfile(res || {}))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddNote = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!noteContent) return setError('Note content is required.');

    startTransition(async () => {
      try {
        await emp360Service.addManagerNote({ employeeId: 'emp-demo-101', noteContent, authorEmail: 'hr.manager@workforceos.com' });
        setMessage('Manager private note appended to employee profile.');
        setNoteContent('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to record manager note.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Employee 360 Comprehensive Profile</h1>
        <p className="page-subtitle">Unified career history, skills radar, compensation progression, manager private notes, and goal tracking</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="form-card">
          <h3>Skills & Proficiency Matrix</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.skills.map((s, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--accent-primary)' }}>{s.skill_name || s.skillName}</strong>
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{s.proficiency}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-card">
          <h3>Career & Promotion Timeline</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.careerTimeline.map((t, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <strong>{t.title}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Effective Date: {t.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-card">
          <h3>Compensation Progression</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.compensationHistory.map((c, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--accent-success)' }}>${c.salary.toLocaleString()} USD / yr</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From: {c.effectiveDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Manager Private Notes (HR & Direct Supervisor Only)</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.notes.map((n, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>Author: {n.author_email || n.authorEmail}</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>PRIVATE NOTE</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{n.note_content || n.noteContent}</p>
              </div>
            ))}
            {profile.notes.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No private manager notes recorded for this employee.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Add Private Manager Note</h3>
          <form onSubmit={handleAddNote} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Note Content</label>
              <textarea className={styles.input} rows="4" placeholder="High potential for tech lead track in Q3 review" value={noteContent} onChange={e => setNoteContent(e.target.value)} disabled={isPending}></textarea>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Private Note</button>
          </form>
        </div>
      </div>
    </div>
  );
}
