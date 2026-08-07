'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as engagementService from '../../../services/engagementService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function EngagementPage() {
  const [activeTab, setActiveTab] = useState('surveys'); // surveys, recognitions, suggestions
  const [surveys, setSurveys] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [newSurvey, setNewSurvey] = useState({ title: '', surveyType: 'PULSE' });
  const [newRecognition, setNewRecognition] = useState({ receiverId: '', badgeName: 'STAR_PERFORMER', message: '', points: 50 });
  const [newSuggestion, setNewSuggestion] = useState({ category: 'WORKPLACE_CULTURE', suggestionText: '', isAnonymous: true });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    engagementService.getSurveys()
      .then(res => setSurveys(res || []))
      .catch(err => console.error(err));

    engagementService.getRecognitions()
      .then(res => setRecognitions(res || []))
      .catch(err => console.error(err));

    engagementService.getSuggestions()
      .then(res => setSuggestions(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSurvey = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newSurvey.title) return setError('Title is required.');

    startTransition(async () => {
      try {
        await engagementService.createSurvey(newSurvey);
        setMessage('Survey launched successfully.');
        setNewSurvey({ title: '', surveyType: 'PULSE' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create survey.');
      }
    });
  };

  const handleSendRecognition = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newRecognition.receiverId) return setError('Receiver Employee ID is required.');

    startTransition(async () => {
      try {
        await engagementService.sendRecognition(newRecognition);
        setMessage('Peer recognition badge sent!');
        setNewRecognition({ receiverId: '', badgeName: 'STAR_PERFORMER', message: '', points: 50 });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to send recognition.');
      }
    });
  };

  const handleSubmitSuggestion = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newSuggestion.suggestionText) return setError('Suggestion content is required.');

    startTransition(async () => {
      try {
        await engagementService.submitSuggestion(newSuggestion);
        setMessage('Suggestion submitted to leadership box.');
        setNewSuggestion({ category: 'WORKPLACE_CULTURE', suggestionText: '', isAnonymous: true });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to submit suggestion.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Employee Engagement</h1>
        <p className="page-subtitle">Pulse surveys, peer recognition badges, reward points, and anonymous leadership suggestion boxes</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'surveys' ? 'active' : ''}`} onClick={() => setActiveTab('surveys')} style={{ background: activeTab === 'surveys' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Pulse & Engagement Surveys
        </button>
        <button className={`tab-btn ${activeTab === 'recognitions' ? 'active' : ''}`} onClick={() => setActiveTab('recognitions')} style={{ background: activeTab === 'recognitions' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Peer Recognition & Badges
        </button>
        <button className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`} onClick={() => setActiveTab('suggestions')} style={{ background: activeTab === 'suggestions' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Suggestion Box
        </button>
      </div>

      {activeTab === 'surveys' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Active Engagement Surveys</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {surveys.map((s, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>{s.title}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Type: {s.survey_type || s.surveyType} | Started: {s.start_date || 'Today'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{s.status}</span>
                </div>
              ))}
              {surveys.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No engagement surveys currently active.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Launch Pulse Survey</h3>
            <form onSubmit={handleCreateSurvey} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Survey Title</label>
                <input type="text" className={styles.input} placeholder="Q3 Remote Work Culture Pulse" value={newSurvey.title} onChange={e => setNewSurvey({ ...newSurvey, title: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Survey Type</label>
                <select className={styles.input} value={newSurvey.surveyType} onChange={e => setNewSurvey({ ...newSurvey, surveyType: e.target.value })} disabled={isPending}>
                  <option value="PULSE">Pulse Survey</option>
                  <option value="ANNUAL">Annual Engagement</option>
                  <option value="FEEDBACK">Manager Feedback</option>
                </select>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Launch Survey</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'recognitions' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Peer Recognition Board</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {recognitions.map((r, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>Badge: {r.badge_name || r.badgeName} (+{r.points} pts)</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      &quot;{r.message || 'Great teamwork and dedication!'}&quot;
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Awarded</span>
                </div>
              ))}
              {recognitions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recognition badges awarded yet.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Send Recognition Badge</h3>
            <form onSubmit={handleSendRecognition} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Recipient Employee ID</label>
                <input type="text" className={styles.input} placeholder="emp-uuid-123" value={newRecognition.receiverId} onChange={e => setNewRecognition({ ...newRecognition, receiverId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Badge Category</label>
                <select className={styles.input} value={newRecognition.badgeName} onChange={e => setNewRecognition({ ...newRecognition, badgeName: e.target.value })} disabled={isPending}>
                  <option value="STAR_PERFORMER">Star Performer</option>
                  <option value="TEAM_PLAYER">Team Player</option>

                  <option value="INNOVATOR">Innovation Champion</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Appreciation Message</label>
                <textarea className={styles.input} rows="3" placeholder="Thank you for going above and beyond during the product release!" value={newRecognition.message} onChange={e => setNewRecognition({ ...newRecognition, message: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Send Badge</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Leadership Suggestion Box</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {suggestions.map((sg, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>Category: {sg.category}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      &quot;{sg.suggestion_text || sg.suggestionText}&quot;
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{sg.status}</span>
                </div>
              ))}
              {suggestions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No suggestions submitted yet.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Submit Suggestion</h3>
            <form onSubmit={handleSubmitSuggestion} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Category</label>
                <input type="text" className={styles.input} value={newSuggestion.category} onChange={e => setNewSuggestion({ ...newSuggestion, category: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Your Suggestion</label>
                <textarea className={styles.input} rows="4" placeholder="Introduce flexible Friday wellness hours for all engineering teams" value={newSuggestion.suggestionText} onChange={e => setNewSuggestion({ ...newSuggestion, suggestionText: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Submit Suggestion</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
