'use client';

import React, { useEffect, useState, useTransition } from 'react';
import * as onboardingService from '../../../services/onboardingService';
import styles from '../../../modules/auth/styles/register.module.css';

export default function OnboardingPage() {
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  
  // Signature States
  const [signerName, setSignerName] = useState('');
  const [signedDoc, setSignedDoc] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    onboardingService.getTasks()
      .then(res => setTasks(res))
      .catch(err => console.error(err));

    onboardingService.getAssets()
      .then(res => setAssets(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
    }
  }, [signedDoc]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleCompleteTask = (taskId) => {
    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const res = await onboardingService.completeTask(taskId);
        if (res.success) {
          setMessage('Checklist task completed.');
          loadData();
        }
      } catch (err) {
        setError(err.message || 'Failed to complete task.');
      }
    });
  };

  const handleSignDocument = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!signerName) return setError('Please type your name to sign the document.');

    startTransition(async () => {
      try {
        const res = await onboardingService.logSignature({
          name: signerName,
          document: 'Compliance Employee Handbook & Code of Conduct',
        });

        if (res.success) {
          setMessage(res.message);
          setSignedDoc(signerName);
        }
      } catch (err) {
        setError(err.message || 'Failed to log signature.');
      }
    });
  };

  const completedCount = tasks.filter(t => t.statusCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Onboarding Welcome Center</h1>
        <p className="page-subtitle">Complete welcome task checklists, check allocated hardware assets, and sign workspace policies</p>
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

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        
        {/* Onboarding Tasks Progress Card */}
        <div className="form-card" style={{ flex: 2, minWidth: '400px', margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Welcome Checklist</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
              {progressPercent}% Complete ({completedCount}/{tasks.length})
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', transition: 'var(--transition-smooth)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.map(task => (
              <div 
                key={task.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <input 
                  type="checkbox" 
                  checked={task.statusCompleted} 
                  onChange={() => !task.statusCompleted && handleCompleteTask(task.id)}
                  style={{ width: '20px', height: '20px', cursor: task.statusCompleted ? 'default' : 'pointer', accentColor: 'var(--accent-success)' }}
                  disabled={task.statusCompleted || isPending}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: task.statusCompleted ? 'var(--text-muted)' : '#fff', textDecoration: task.statusCompleted ? 'line-through' : 'none' }}>
                    {task.taskName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {task.description}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due: {task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned IT Assets Card */}
        <div className="form-card" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
          <h3>Allocated IT Assets</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            IT hardware resources registered under your profile profile.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assets.map(asset => (
              <div 
                key={asset.id} 
                style={{ 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                  Hardware Asset
                </div>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{asset.assetName}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '4px', fontFamily: 'monospace' }}>
                  Serial: {asset.assetCode}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Assigned: {asset.allocatedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Policy Digital Sign Card */}
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <h3>Company Policy Sign-Off</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
          I hereby declare that I have read and agree to all compliance guidelines set forth in the Employee Handbook and Code of Conduct policies.
        </p>

        {signedDoc ? (
          <div>
            <div className="signature-box" style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--accent-primary)', border: '1px dashed var(--border-light)', padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', fontSize: '1.5rem', fontFamily: '"Outfit", cursive' }}>
              {signedDoc}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '10px', fontWeight: '600' }}>
              ✓ Digitally signed and logged compliance record.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignDocument} noValidate>
            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <label className={styles.label}>Draw Your Visual Signature Below</label>
              <div style={{ border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-tertiary)', marginBottom: '12px' }}>
                <canvas 
                  ref={canvasRef}
                  width={560}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{ width: '100%', height: '120px', cursor: 'crosshair', display: 'block' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button type="button" onClick={clearSignature} className={styles.btn} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '6px 14px', fontSize: '0.75rem' }}>
                  Clear Canvas
                </button>
              </div>
              
              <label className={styles.label}>Type Full Legal Name to Affirm</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="e.g. John Doe" 
                value={signerName} 
                onChange={(e) => setSignerName(e.target.value)}
                disabled={isPending}
                style={{ fontSize: '1.1rem', textAlign: 'center' }}
              />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isPending}>
              Submit Signature Log
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
