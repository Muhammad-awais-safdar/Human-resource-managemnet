'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as recruitmentService from '../../../services/recruitmentService';
import styles from '../../../modules/auth/styles/register.module.css';

const PIPELINE_STAGES = [
  { id: 'APPLIED', name: 'Applied' },
  { id: 'SCREEN', name: 'Screening' },
  { id: 'INTERVIEW', name: 'Interviewing' },
  { id: 'OFFER', name: 'Offer Extended' },
];

export default function RecruitmentATSPage() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  // Mock Career Portal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applyFirstName, setApplyFirstName] = useState('');
  const [applyLastName, setApplyLastName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyResumeUrl, setApplyResumeUrl] = useState('');
  const [applyResumeText, setApplyResumeText] = useState('Extracted skills: Java, Spring Boot, React. Phone: +923001234567');

  // Create Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobOpenings, setNewJobOpenings] = useState(1);
  const [newJobSalaryRange, setNewJobSalaryRange] = useState('$80k - $110k');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    recruitmentService.getJobs()
      .then(res => {
        setJobs(res);
        if (res.length > 0 && !selectedJobId) {
          setSelectedJobId(res[0].id);
        }
      })
      .catch(err => console.error(err));

    recruitmentService.getCandidates()
      .then(res => setCandidates(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJobSubmit = (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobDescription) {
      setError('Job title and description are required.');
      return;
    }

    startTransition(async () => {
      try {
        await recruitmentService.createJob({
          title: newJobTitle,
          description: newJobDescription,
          openings: parseInt(newJobOpenings, 10) || 1,
          salaryRange: newJobSalaryRange
        });
        setMessage(`Job position '${newJobTitle}' registered successfully!`);
        setNewJobTitle('');
        setNewJobDescription('');
        setNewJobOpenings(1);
        setShowCreateJobModal(false);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to create job opening.');
      }
    });
  };

  const handleMoveStage = (candidateId, nextStage) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await recruitmentService.updateCandidateStage(candidateId, {
          stage: nextStage,
        });
        setMessage('Candidate application pipeline stage updated.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to update candidate pipeline stage.');
      }
    });
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyFirstName || !applyLastName || !applyEmail || !selectedJobId) {
      setError('Please fill in all required fields.');
      return;
    }

    startTransition(async () => {
      try {
        await recruitmentService.applyToJob({
          jobId: selectedJobId,
          firstName: applyFirstName,
          lastName: applyLastName,
          email: applyEmail,
          resumeUrl: applyResumeUrl || 'candidate_resume.pdf',
          resumeText: applyResumeText
        });
        setMessage('Application submitted and CV metadata parsed successfully!');
        setApplyFirstName('');
        setApplyLastName('');
        setApplyEmail('');
        setApplyResumeUrl('');
        setShowApplyModal(false);
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to submit job application.');
      }
    });
  };

  const handleDeleteCandidate = (candidateId) => {
    if (!window.confirm('Are you sure you want to dismiss this candidate application?')) return;
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        await recruitmentService.deleteCandidate(candidateId);
        setMessage('Candidate application dismissed.');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to delete candidate application.');
      }
    });
  };

  const getCandidatesInStage = (stageId) => {
    return candidates.filter(c => (c.statusStage || c.status_stage) === stageId);
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Applicant Tracking System (ATS)</h1>
          <p className="page-subtitle">Track job openings and move candidates through the hiring pipeline stages</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setShowCreateJobModal(true); setError(''); setMessage(''); }}
            className={styles.btn}
            style={{ padding: '10px 18px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
          >
            ➕ Post Job Opening
          </button>
          <button 
            onClick={() => { setShowApplyModal(true); setError(''); setMessage(''); }}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ padding: '10px 18px' }}
          >
            🚀 Public Careers Portal Simulator
          </button>
        </div>
      </header>

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`} style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {message && (
        <div className={`${styles.alert}`} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', marginBottom: '24px' }}>
          {message}
        </div>
      )}

      {/* Active Job Requisitions List */}
      <div className="form-card" style={{ maxWidth: '100%', marginBottom: '32px' }}>
        <h3>Active Job Requisitions</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
          {jobs.map(job => (
            <div 
              key={job.id} 
              style={{ 
                flex: '1 1 280px', 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-light)', 
                borderRadius: 'var(--radius-md)', 
                padding: '16px' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{job.title}</strong>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', fontWeight: '700' }}>
                  {job.status}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 12px 0', minHeight: '36px' }}>{job.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Openings: {job.openings}</span>
                <span>Range: {job.salaryRange || job.salary_range}</span>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No active job requisitions seeded.</p>
          )}
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="kanban-board">
        {PIPELINE_STAGES.map(stage => {
          const stageCandidates = getCandidatesInStage(stage.id);
          return (
            <div key={stage.id} className="kanban-column">
              <div className="kanban-column-title">
                <span>{stage.name}</span>
                <span className="kanban-column-count">{stageCandidates.length}</span>
              </div>
              
              <div className="kanban-cards-container">
                {stageCandidates.map(candidate => {
                  const firstName = candidate.firstName || candidate.first_name || '';
                  const lastName = candidate.lastName || candidate.last_name || '';
                  const jobTitle = candidate.jobTitle || candidate.job_title || 'General Applicant';
                  const skills = candidate.extractedSkills || candidate.extracted_skills || '';
                  const phone = candidate.phone || '';

                  return (
                    <div key={candidate.id} className="kanban-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="kanban-card-name">{firstName} {lastName}</div>
                        <button 
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          title="Dismiss Candidate"
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: '0 2px' }}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="kanban-card-email">{candidate.email} {phone ? `• ${phone}` : ''}</div>
                      
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Position: <strong style={{ color: '#fff' }}>{jobTitle}</strong>
                      </div>

                      {skills && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', background: 'rgba(99,102,241,0.1)', padding: '4px 8px', borderRadius: '4px', marginBottom: '10px' }}>
                          💡 <strong>AI Parsed Skills:</strong> {skills}
                        </div>
                      )}

                      {/* Stage transition controls */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {stage.id !== 'APPLIED' && (
                          <button 
                            onClick={() => {
                              const prev = PIPELINE_STAGES[PIPELINE_STAGES.findIndex(s => s.id === stage.id) - 1].id;
                              handleMoveStage(candidate.id, prev);
                            }}
                            style={{ flex: 1, fontSize: '0.65rem', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-light)', cursor: 'pointer', background: 'none', color: 'var(--text-secondary)' }}
                            disabled={isPending}
                          >
                            ◀ Back
                          </button>
                        )}
                        
                        {stage.id !== 'OFFER' ? (
                          <button 
                            onClick={() => {
                              const next = PIPELINE_STAGES[PIPELINE_STAGES.findIndex(s => s.id === stage.id) + 1].id;
                              handleMoveStage(candidate.id, next);
                            }}
                            style={{ flex: 1, fontSize: '0.65rem', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-primary)', cursor: 'pointer', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', fontWeight: '600' }}
                            disabled={isPending}
                          >
                            Next ▶
                          </button>
                        ) : (
                          <button 
                            style={{ flex: 1, fontSize: '0.65rem', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-success)', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', fontWeight: '600', cursor: 'default' }}
                            disabled
                          >
                            Offer Sent!
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {stageCandidates.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                    Empty Column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Career Portal Modal Simulation */}
      {showApplyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="form-card" style={{ width: '100%', maxWidth: '520px', position: 'relative' }}>
            <button 
              onClick={() => setShowApplyModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3>Public Careers Portal Application</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Apply to active positions and trigger the automatic AI CV extraction engine.</p>
            
            <form onSubmit={handleApplySubmit} noValidate>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Select Job Opening</label>
                <select 
                  className={styles.input}
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title} ({job.salaryRange})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>First Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={applyFirstName} 
                    onChange={(e) => setApplyFirstName(e.target.value)} 
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Last Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={applyLastName} 
                    onChange={(e) => setApplyLastName(e.target.value)} 
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  className={styles.input} 
                  value={applyEmail} 
                  onChange={(e) => setApplyEmail(e.target.value)} 
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Resume Filename</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. John_Resume_SDE.pdf"
                  value={applyResumeUrl} 
                  onChange={(e) => setApplyResumeUrl(e.target.value)} 
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                <label className={styles.label}>CV Raw Text Content (For AI Parser extraction)</label>
                <textarea 
                  className={styles.input} 
                  rows={3}
                  value={applyResumeText} 
                  onChange={(e) => setApplyResumeText(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)}
                  className={styles.btn} 
                  style={{ border: '1px solid var(--border-light)', background: 'none', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
                  Submit Candidate Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Job Opening Modal */}
      {showCreateJobModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="form-card" style={{ width: '100%', maxWidth: '520px', position: 'relative' }}>
            <button 
              onClick={() => setShowCreateJobModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3>➕ Post New Job Opening Requisition</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Create a new active vacancy that will immediately appear on the Public Careers Portal.
            </p>
            
            <form onSubmit={handleCreateJobSubmit} noValidate>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Job Title *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newJobTitle} 
                  onChange={(e) => setNewJobTitle(e.target.value)} 
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.label}>Job Description *</label>
                <textarea 
                  className={styles.input} 
                  rows={3}
                  placeholder="e.g. Lead dynamic UI design systems and state management."
                  value={newJobDescription} 
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Openings Count</label>
                  <input 
                    type="number" 
                    min="1"
                    className={styles.input} 
                    value={newJobOpenings} 
                    onChange={(e) => setNewJobOpenings(e.target.value)} 
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Salary Budget Range</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. $100k - $140k"
                    value={newJobSalaryRange} 
                    onChange={(e) => setNewJobSalaryRange(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateJobModal(false)}
                  className={styles.btn} 
                  style={{ border: '1px solid var(--border-light)', background: 'none', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
                  Publish Job Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
