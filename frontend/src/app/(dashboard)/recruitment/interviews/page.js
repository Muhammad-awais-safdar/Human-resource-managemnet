'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as recruitmentService from '../../../../services/interviewOfferService';
import styles from '../../../../modules/auth/styles/register.module.css';

export default function InterviewOfferPage() {
  const [interviews, setInterviews] = useState([]);
  const [offers, setOffers] = useState([]);

  const [candidateName, setCandidateName] = useState('');
  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [roundName, setRoundName] = useState('TECHNICAL_ROUND_1');

  const [candidateEmail, setCandidateEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('Senior Staff Engineer');
  const [offeredSalary, setOfferedSalary] = useState(115000);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    recruitmentService.getInterviews()
      .then(res => setInterviews(res || []))
      .catch(err => console.error(err));

    recruitmentService.getOffers()
      .then(res => setOffers(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleInterview = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!candidateName || !interviewerEmail) return setError('Candidate name and interviewer email are required.');

    startTransition(async () => {
      try {
        await recruitmentService.scheduleInterview({ candidateName, interviewerEmail, roundName });
        setMessage('Interview slot scheduled & calendar invitation dispatched.');
        setCandidateName('');
        setInterviewerEmail('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to schedule interview.');
      }
    });
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!candidateEmail || !jobTitle) return setError('Candidate email and job title are required.');

    startTransition(async () => {
      try {
        await recruitmentService.createOffer({ candidateEmail, jobTitle, offeredSalary: parseFloat(offeredSalary) || 0 });
        setMessage('Digital offer letter generated for candidate e-signature.');
        setCandidateEmail('');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to generate offer.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Interview Scheduling & Offer Management</h1>
        <p className="page-subtitle">Panel interviewer scheduling, video meeting links, scorecard evaluations, offer letter templates, and e-signatures</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>Schedule Candidate Interview</h3>
          <form onSubmit={handleScheduleInterview} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Candidate Full Name</label>
              <input type="text" className={styles.input} placeholder="Alex Morgan" value={candidateName} onChange={e => setCandidateName(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Panel Lead Email</label>
              <input type="email" className={styles.input} placeholder="tech.lead@workforceos.com" value={interviewerEmail} onChange={e => setInterviewerEmail(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Interview Round</label>
              <select className={styles.input} value={roundName} onChange={e => setRoundName(e.target.value)} disabled={isPending}>
                <option value="SCREENING">HR Initial Screening</option>
                <option value="TECHNICAL_ROUND_1">Technical Deep Dive Round 1</option>
                <option value="SYSTEM_DESIGN">System Design Architecture</option>
                <option value="CULTURE_FIT">Executive Leadership & Culture</option>
              </select>
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Schedule Interview</button>
          </form>
        </div>

        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>Generate Candidate Offer Letter</h3>
          <form onSubmit={handleCreateOffer} style={{ marginTop: '16px' }}>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Candidate Email</label>
              <input type="email" className={styles.input} placeholder="alex.morgan@example.com" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Offered Position Title</label>
              <input type="text" className={styles.input} value={jobTitle} onChange={e => setJobTitle(e.target.value)} disabled={isPending} />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.label}>Annual Compensation ($)</label>
              <input type="number" className={styles.input} value={offeredSalary} onChange={e => setOfferedSalary(e.target.value)} disabled={isPending} />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Generate & Send Offer Letter</button>
          </form>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>Upcoming Interview Roster</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {interviews.map((i, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{i.candidate_name || i.candidateName}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Round: {i.round_name || i.roundName} | Interviewer: {i.interviewer_email || i.interviewerEmail}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{i.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '350px' }} className="form-card">
          <h3>Offer Letters Portal</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {offers.map((o, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{o.candidate_email || o.candidateEmail}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role: {o.job_title || o.jobTitle} | Salary: ${o.offered_salary || o.offeredSalary}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
