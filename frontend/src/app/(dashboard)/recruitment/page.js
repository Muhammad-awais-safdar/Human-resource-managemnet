'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { Briefcase, Plus, Send, ChevronRight, ChevronLeft, Trash2, Sparkles, UserCheck, X } from 'lucide-react';
import * as recruitmentService from '../../../services/recruitmentService';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/primitives/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/primitives/Dialog';

const PIPELINE_STAGES = [
  { id: 'APPLIED', name: 'Applied' },
  { id: 'SCREEN', name: 'Screening' },
  { id: 'INTERVIEW', name: 'Interviewing' },
  { id: 'OFFER', name: 'Offer Extended' },
];

export default function RecruitmentATSPage() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applyFirstName, setApplyFirstName] = useState('');
  const [applyLastName, setApplyLastName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyResumeUrl, setApplyResumeUrl] = useState('');
  const [applyResumeText, setApplyResumeText] = useState('');

  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobOpenings, setNewJobOpenings] = useState(1);
  const [newJobSalaryRange, setNewJobSalaryRange] = useState('$80k - $110k');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(() => {
    recruitmentService.getJobs()
      .then(res => {
        const data = Array.isArray(res) ? res : res.data || [];
        setJobs(data);
        if (data.length > 0 && !selectedJobId) {
          setSelectedJobId(data[0].id);
        }
      })
      .catch(err => console.error(err));

    recruitmentService.getCandidates()
      .then(res => setCandidates(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error(err));
  }, [selectedJobId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        await recruitmentService.updateCandidateStage(candidateId, {
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Recruitment & ATS Kanban</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track job requisitions, evaluate CV parsings, and manage applicant pipeline stages.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setShowCreateJobModal(true); setError(''); setMessage(''); }} icon={Plus} size="sm">
            Post Job Requisition
          </Button>
          <Button variant="primary" onClick={() => { setShowApplyModal(true); setError(''); setMessage(''); }} icon={Send} size="sm">
            Public Careers Portal
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">
          {message}
        </div>
      )}

      {/* Active Job Requisitions List */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Job Requisitions</CardTitle>
            <CardDescription>Open corporate vacancies accepting candidate submissions.</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {jobs.map(job => (
            <div 
              key={job.id} 
              className="p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-[var(--text-primary)]">{job.title}</span>
                <Badge variant="primary">{job.status}</Badge>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{job.description}</p>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                <span>Openings: {job.openings}</span>
                <span className="font-mono text-indigo-400">{job.salaryRange || job.salary_range}</span>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] col-span-3 text-center py-6">No active job requisitions found.</p>
          )}
        </div>
      </Card>

      {/* Interactive ATS Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map(stage => {
          const stageCandidates = getCandidatesInStage(stage.id);
          return (
            <div key={stage.id} className="bg-[var(--bg-surface-l1)] border border-[var(--border-subtle)] rounded-xl p-3 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center pb-3 mb-3 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{stage.name}</span>
                <Badge variant="default" className="text-[10px] px-2 py-0.5">
                  {stageCandidates.length}
                </Badge>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageCandidates.map(candidate => {
                  const firstName = candidate.firstName || candidate.first_name || '';
                  const lastName = candidate.lastName || candidate.last_name || '';
                  const jobTitle = candidate.jobTitle || candidate.job_title || 'General Applicant';
                  const skills = candidate.extractedSkills || candidate.extracted_skills || '';

                  return (
                    <div key={candidate.id} className="p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl space-y-2 shadow-md hover:border-[var(--accent-primary)] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-xs text-[var(--text-primary)]">{firstName} {lastName}</div>
                        <button 
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-[var(--text-muted)] hover:text-rose-400 p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)] truncate">{candidate.email}</div>
                      
                      <div className="text-[10px] text-[var(--text-muted)]">
                        Position: <strong className="text-[var(--text-primary)]">{jobTitle}</strong>
                      </div>

                      {skills && (
                        <div className="text-[10px] text-indigo-400 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20">
                          ⚡ AI Skills: {skills}
                        </div>
                      )}

                      {/* Stage Transitions */}
                      <div className="flex gap-1 pt-2 border-t border-[var(--border-subtle)]">
                        {stage.id !== 'APPLIED' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 text-[10px] h-7 px-1"
                            onClick={() => {
                              const prev = PIPELINE_STAGES[PIPELINE_STAGES.findIndex(s => s.id === stage.id) - 1].id;
                              handleMoveStage(candidate.id, prev);
                            }}
                            icon={ChevronLeft}
                          >
                            Back
                          </Button>
                        )}
                        
                        {stage.id !== 'OFFER' ? (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="flex-1 text-[10px] h-7 px-1"
                            onClick={() => {
                              const next = PIPELINE_STAGES[PIPELINE_STAGES.findIndex(s => s.id === stage.id) + 1].id;
                              handleMoveStage(candidate.id, next);
                            }}
                          >
                            Advance <ChevronRight className="w-3 h-3 ml-0.5" />
                          </Button>
                        ) : (
                          <Badge variant="success" className="w-full justify-center text-[10px]">
                            Offer Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageCandidates.length === 0 && (
                  <div className="text-center py-10 text-[11px] text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                    No candidates in this stage.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE JOB REQUISITION DIALOG */}
      <Dialog open={showCreateJobModal} onOpenChange={setShowCreateJobModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post New Job Requisition</DialogTitle>
            <DialogDescription>Create an open position to accept career applicants.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateJobSubmit} className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Job Position Title</label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Job Description</label>
              <textarea
                className="w-full h-20 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 focus:outline-none focus:border-[var(--accent-primary)]"
                placeholder="Responsibilities, scope, and technical requirements..."
                value={newJobDescription}
                onChange={(e) => setNewJobDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Openings</label>
                <Input
                  type="number"
                  min="1"
                  value={newJobOpenings}
                  onChange={(e) => setNewJobOpenings(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Salary Range</label>
                <Input
                  placeholder="e.g. $90k - $120k"
                  value={newJobSalaryRange}
                  onChange={(e) => setNewJobSalaryRange(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowCreateJobModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isPending}>Publish Vacancy</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PUBLIC CAREERS SIMULATION DIALOG */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Public Careers Portal Simulator</DialogTitle>
            <DialogDescription>Simulate a job candidate application with automated AI CV parsing.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplySubmit} className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Target Job Vacancy</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full h-9 bg-[var(--bg-surface-l2)] text-xs text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-3 focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title} ({job.salaryRange})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">First Name</label>
                <Input value={applyFirstName} onChange={(e) => setApplyFirstName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Last Name</label>
                <Input value={applyLastName} onChange={(e) => setApplyLastName(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Email Address</label>
              <Input type="email" value={applyEmail} onChange={(e) => setApplyEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">CV Raw Text Content (For AI Skill Extraction)</label>
              <textarea
                className="w-full h-20 bg-[var(--bg-surface-l2)] text-xs font-mono text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 focus:outline-none focus:border-[var(--accent-primary)]"
                placeholder="Paste resume skills, experience, or bio..."
                value={applyResumeText}
                onChange={(e) => setApplyResumeText(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowApplyModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isPending}>Submit Application</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
