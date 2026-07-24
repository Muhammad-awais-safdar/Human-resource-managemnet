'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as recruitmentService from '../../services/recruitmentService';
import styles from '../../modules/auth/styles/register.module.css';

export default function PublicCareersPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Application Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeText, setResumeText] = useState('Extracted skills: Java, Spring Boot, React, Node.js. Phone: +923001234567');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    recruitmentService.getJobs()
      .then(res => {
        setJobs(res || []);
        if (res && res.length > 0) {
          setSelectedJob(res[0]);
        }
      })
      .catch(err => console.error('Failed to load active jobs:', err));
  }, []);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !selectedJob) {
      setError('Please fill in all required candidate fields.');
      return;
    }

    setError('');
    setSuccessMsg('');

    startTransition(async () => {
      try {
        await recruitmentService.applyToJob({
          jobId: selectedJob.id,
          firstName,
          lastName,
          email,
          resumeUrl: resumeUrl || 'candidate_cv.pdf',
          resumeText
        });
        setSuccessMsg(`🎉 Application submitted for ${selectedJob.title}! Automatic AI CV extraction engine has parsed your application.`);
        setFirstName('');
        setLastName('');
        setEmail('');
        setResumeUrl('');
      } catch (err) {
        setError(err.message || 'Failed to submit candidate application.');
      }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 70%)',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '40px 24px'
    }}>
      {/* Header Branding */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 40px auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '6px 16px', borderRadius: '20px', color: '#818cf8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>
          ✨ Public Applicant Careers Portal
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>
          Explore Open Career Opportunities
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Apply to our active vacancies. Your resume will be processed automatically by our dynamic AI CV Extraction Engine.
        </p>
      </div>

      {/* Main Content Layout */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
        
        {/* Left Column: Available Vacancies List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💼 Active Positions ({jobs.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {jobs.map(job => {
              const isSelected = selectedJob && selectedJob.id === job.id;
              return (
                <div 
                  key={job.id}
                  onClick={() => { setSelectedJob(job); setError(''); setSuccessMsg(''); }}
                  style={{
                    background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(30,41,59,0.7)',
                    border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 8px 24px rgba(99,102,241,0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>{job.title}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                      {job.status || 'OPEN'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: '1.5' }}>{job.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span>👥 Openings: <strong>{job.openings}</strong></span>
                    <span>💰 Range: <strong>{job.salaryRange}</strong></span>
                  </div>
                </div>
              );
            })}

            {jobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(30,41,59,0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                No open job requisitions currently listed.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Application Form */}
        <div>
          <div style={{
            background: 'rgba(30,41,59,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '28px',
            position: 'sticky',
            top: '24px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              📝 Submit Candidate Application
            </h2>
            {selectedJob ? (
              <p style={{ fontSize: '0.85rem', color: '#818cf8', marginBottom: '20px', fontWeight: '600' }}>
                Applying for position: {selectedJob.title}
              </p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
                Select a position from the left to begin.
              </p>
            )}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleApplySubmit} noValidate>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>First Name *</label>
                  <input 
                    type="text" 
                    required
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>Last Name *</label>
                  <input 
                    type="text" 
                    required
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="candidate@example.com"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>Resume Filename</label>
                <input 
                  type="text" 
                  placeholder="e.g. My_CV_Senior_Engineer.pdf"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  value={resumeUrl} 
                  onChange={(e) => setResumeUrl(e.target.value)} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>CV Content / Raw Text (AI Skills Extractor Engine)</label>
                <textarea 
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontFamily: 'monospace', outline: 'none', resize: 'vertical' }}
                  value={resumeText} 
                  onChange={(e) => setResumeText(e.target.value)} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending || !selectedJob}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: isPending ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                  opacity: (!selectedJob || isPending) ? 0.6 : 1
                }}
              >
                {isPending ? 'Processing Application...' : '🚀 Submit Candidate Application'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
