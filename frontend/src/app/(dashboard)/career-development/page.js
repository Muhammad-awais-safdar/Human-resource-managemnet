'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as careerService from '../../../services/careerDevelopmentService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function CareerDevelopmentPage() {
  const [activeTab, setActiveTab] = useState('paths'); // paths, mentorship, plans
  const [paths, setPaths] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [devPlans, setDevPlans] = useState([]);

  const [newPath, setNewPath] = useState({ title: '', levelStep: 1, requiredSkills: '', description: '' });
  const [newMentorship, setNewMentorship] = useState({ mentorId: '', menteeId: '', goalDescription: '' });
  const [newPlan, setNewPlan] = useState({ employeeId: '', targetRole: '', skillGaps: '', actionPlan: '' });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    careerService.getCareerPaths()
      .then(res => setPaths(res || []))
      .catch(err => console.error(err));

    careerService.getMentorshipPairs()
      .then(res => setMentorships(res || []))
      .catch(err => console.error(err));

    careerService.getDevelopmentPlans()
      .then(res => setDevPlans(res || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePath = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPath.title) return setError('Title is required.');

    startTransition(async () => {
      try {
        await careerService.createCareerPath(newPath);
        setMessage('Career path created.');
        setNewPath({ title: '', levelStep: 1, requiredSkills: '', description: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create career path.');
      }
    });
  };

  const handleCreateMentorship = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newMentorship.mentorId || !newMentorship.menteeId) return setError('Mentor ID and Mentee ID are required.');

    startTransition(async () => {
      try {
        await careerService.createMentorshipPair(newMentorship);
        setMessage('Mentorship relationship paired.');
        setNewMentorship({ mentorId: '', menteeId: '', goalDescription: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to pair mentorship.');
      }
    });
  };

  const handleCreatePlan = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!newPlan.employeeId || !newPlan.targetRole) return setError('Employee ID and Target Role are required.');

    startTransition(async () => {
      try {
        await careerService.createDevelopmentPlan(newPlan);
        setMessage('Individual growth plan created.');
        setNewPlan({ employeeId: '', targetRole: '', skillGaps: '', actionPlan: '' });
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create growth plan.');
      }
    });
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Career Development</h1>
        <p className="page-subtitle">Career progression steps, skill gap analysis, executive mentorship, and individual growth plans</p>
      </header>

      {error && <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>{error}</div>}
      {message && <div className={styles.alert} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', marginBottom: '24px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '24px', paddingBottom: '8px' }}>
        <button className={`tab-btn ${activeTab === 'paths' ? 'active' : ''}`} onClick={() => setActiveTab('paths')} style={{ background: activeTab === 'paths' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Career Progression Pathways
        </button>
        <button className={`tab-btn ${activeTab === 'mentorship' ? 'active' : ''}`} onClick={() => setActiveTab('mentorship')} style={{ background: activeTab === 'mentorship' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Mentorship Program
        </button>
        <button className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')} style={{ background: activeTab === 'plans' ? 'var(--bg-tertiary)' : 'none', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Individual Growth Plans
        </button>
      </div>

      {activeTab === 'paths' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Role Ladders & Progression Matrix</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {paths.map((p, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>Level {p.level_step || p.levelStep}: {p.title}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Required Competencies: {p.required_skills || p.requiredSkills || 'Core engineering leadership'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Career Step</span>
                </div>
              ))}
              {paths.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No career paths defined.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Add Career Step</h3>
            <form onSubmit={handleCreatePath} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Step Title</label>
                <input type="text" className={styles.input} placeholder="Senior Principal Architect" value={newPath.title} onChange={e => setNewPath({ ...newPath, title: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Level Step (1-10)</label>
                <input type="number" min="1" className={styles.input} value={newPath.levelStep} onChange={e => setNewPath({ ...newPath, levelStep: parseInt(e.target.value) || 1 })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Required Competencies / Skills</label>
                <textarea className={styles.input} rows="3" placeholder="Distributed Systems, Java Spring, Cloud Security Architecture" value={newPath.requiredSkills} onChange={e => setNewPath({ ...newPath, requiredSkills: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Save Career Step</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'mentorship' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Active Mentorship Pairings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {mentorships.map((m, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>Mentor: {m.mentor_id || m.mentorId} & Mentee: {m.mentee_id || m.menteeId}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Goal: "{m.goal_description || m.goalDescription || 'Executive leadership development'}"
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{m.status}</span>
                </div>
              ))}
              {mentorships.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No active mentorship pairings.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Pair Mentor & Mentee</h3>
            <form onSubmit={handleCreateMentorship} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Mentor Employee ID</label>
                <input type="text" className={styles.input} placeholder="mentor-uuid" value={newMentorship.mentorId} onChange={e => setNewMentorship({ ...newMentorship, mentorId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Mentee Employee ID</label>
                <input type="text" className={styles.input} placeholder="mentee-uuid" value={newMentorship.menteeId} onChange={e => setNewMentorship({ ...newMentorship, menteeId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Mentorship Goal</label>
                <textarea className={styles.input} rows="3" placeholder="Prepare for VP of Engineering transition in 12 months" value={newMentorship.goalDescription} onChange={e => setNewMentorship({ ...newMentorship, goalDescription: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Pair Program</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '350px' }} className="form-card">
            <h3>Individual Growth Plans (IDP)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {devPlans.map((dp, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: 'var(--accent-primary)' }}>Target Role: {dp.target_role || dp.targetRole}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Employee ID: {dp.employee_id || dp.employeeId} | Skill Gaps: {dp.skill_gaps || dp.skillGaps || 'None'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>{dp.status}</span>
                </div>
              ))}
              {devPlans.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No development plans created.</p>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }} className="form-card">
            <h3>Create IDP Plan</h3>
            <form onSubmit={handleCreatePlan} style={{ marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Employee ID</label>
                <input type="text" className={styles.input} placeholder="emp-uuid-123" value={newPlan.employeeId} onChange={e => setNewPlan({ ...newPlan, employeeId: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Target Role</label>
                <input type="text" className={styles.input} placeholder="Lead DevOps Engineer" value={newPlan.targetRole} onChange={e => setNewPlan({ ...newPlan, targetRole: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Identified Skill Gaps</label>
                <input type="text" className={styles.input} placeholder="Kubernetes, Terraform, AWS Security" value={newPlan.skillGaps} onChange={e => setNewPlan({ ...newPlan, skillGaps: e.target.value })} disabled={isPending} />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.label}>Action Plan</label>
                <textarea className={styles.input} rows="3" placeholder="Complete AWS Certified Solutions Architect exam by Q4" value={newPlan.actionPlan} onChange={e => setNewPlan({ ...newPlan, actionPlan: e.target.value })} disabled={isPending}></textarea>
              </div>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>Create Growth Plan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
