'use client';

import React, { useEffect, useState, useTransition, useRef } from 'react';
import { CheckCircle2, Laptop, ShieldCheck, PenTool, Sparkles, AlertCircle } from 'lucide-react';
import * as onboardingService from '../../../services/onboardingService';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/primitives/Card';

export default function OnboardingPage() {
  const [tasks, setTasks] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [signerName, setSignerName] = useState('');
  const [signedDoc, setSignedDoc] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    onboardingService.getTasks()
      .then(res => setTasks(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error(err));

    onboardingService.getAssets()
      .then(res => setAssets(Array.isArray(res) ? res : res.data || []))
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
        if (res.success || res) {
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

        if (res.success || res) {
          setMessage(res.message || 'Digital signature logged successfully.');
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Onboarding Welcome Center</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Complete welcome task checklists, review allocated hardware assets, and digitally sign workspace policies.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding Tasks Progress Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Welcome Checklist</CardTitle>
              <CardDescription>Track your active onboarding tasks and document verifications.</CardDescription>
            </div>
            <Badge variant="primary">
              {progressPercent}% Complete ({completedCount}/{tasks.length})
            </Badge>
          </CardHeader>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[var(--bg-surface-l2)] rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center gap-3 p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl transition-all"
              >
                <input 
                  type="checkbox" 
                  checked={task.statusCompleted} 
                  onChange={() => !task.statusCompleted && handleCompleteTask(task.id)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  disabled={task.statusCompleted || isPending}
                />
                <div className="flex-1">
                  <div className={`text-xs font-semibold ${task.statusCompleted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                    {task.taskName}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{task.description}</div>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">Due: {task.dueDate}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Assigned IT Assets Card */}
        <Card>
          <CardHeader>
            <CardTitle>Allocated IT Assets</CardTitle>
          </CardHeader>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Hardware equipment provisioned for your workspace.
          </p>

          <div className="space-y-3">
            {assets.map(asset => (
              <div 
                key={asset.id} 
                className="p-3 bg-[var(--bg-surface-l2)] border border-[var(--border-subtle)] rounded-xl"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Hardware Asset</span>
                  <Laptop className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)]">{asset.assetName}</div>
                <div className="text-[11px] font-mono text-[var(--text-muted)] mt-1">Serial: {asset.assetCode}</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-2">Assigned: {asset.allocatedAt}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance Policy Digital Sign Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Company Policy Sign-Off</CardTitle>
        </CardHeader>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
          I hereby declare that I have read and agree to all compliance guidelines set forth in the Employee Handbook and Code of Conduct policies.
        </p>

        {signedDoc ? (
          <div className="p-6 border border-dashed border-[var(--accent-primary)]/40 rounded-xl bg-indigo-500/5 text-center">
            <div className="text-xl font-serif text-[var(--accent-primary)] italic">
              {signedDoc}
            </div>
            <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Digitally signed and logged compliance record.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignDocument} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">Draw Visual Signature</label>
              <div className="border border-dashed border-[var(--border-strong)] rounded-xl bg-[var(--bg-surface-l2)] overflow-hidden">
                <canvas 
                  ref={canvasRef}
                  width={560}
                  height={100}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-24 cursor-crosshair block"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button type="button" variant="ghost" size="sm" onClick={clearSignature}>
                  Clear Canvas
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Type Full Legal Name to Affirm</label>
              <Input 
                placeholder="e.g. John Doe" 
                value={signerName} 
                onChange={(e) => setSignerName(e.target.value)}
                disabled={isPending}
              />
            </div>

            <Button type="submit" variant="primary" isLoading={isPending} icon={PenTool}>
              Submit Digital Signature Log
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
