'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as copilotService from '../../../services/aiCopilotService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function AiCopilotPage() {
  const [sessions, setSessions] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('HR_ASSISTANT');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    copilotService.getSessions()
      .then(res => setSessions(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAskCopilot = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!prompt) return setError('Prompt is required.');

    startTransition(async () => {
      try {
        await copilotService.askCopilot({ prompt, category });
        setMessage('AI Copilot generated recommendations.');
        setPrompt('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to query AI Copilot.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">AI Copilot & HR Intelligence Assistant</h1>
        <p className="page-subtitle">AI policy Q&A assistant, workflow generators, natural language report queries, and workforce insights</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
          <h3>Recent Copilot Interactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {sessions.map((s, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>Q: {s.prompt}</strong>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{s.category}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{s.response}</p>
              </div>
            ))}
            {sessions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No AI Copilot queries recorded.</p>}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
          <h3>Query AI Copilot</h3>
          <form onSubmit={handleAskCopilot} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>AI Assistant Category</label>
              <select className={styles.input} value={category} onChange={e => setCategory(e.target.value)} disabled={isPending}>
                <option value="HR_ASSISTANT">HR Assistant (General)</option>
                <option value="POLICY_QA">Policy & Compliance Q&A</option>
                <option value="WORKFLOW_BUILDER">Workflow Automation Generator</option>
                <option value="REPORT_GEN">Natural Language Report Query</option>
              </select>
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Prompt / Question</label>
              <textarea className={styles.input} rows="3" placeholder="Draft a remote work policy for software engineers in Europe" value={prompt} onChange={e => setPrompt(e.target.value)} disabled={isPending}></textarea>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Ask AI Copilot</button>
          </form>
        </div>
      </div>
    </div>
  );
}
