import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, User, CreditCard, Calendar, Briefcase, Settings, BarChart2, ShieldCheck, Layers, HelpCircle, Laptop } from 'lucide-react';

export function CommandPaletteModal({ isOpen, onClose }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigate = (path) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <Command className="w-full max-w-xl bg-[var(--bg-surface-l1)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-[var(--border-subtle)]">
          <Search className="w-4 h-4 text-[var(--text-muted)] mr-2 shrink-0" />
          <Command.Input
            placeholder="Type a command or jump to page... (Cmd+K)"
            className="w-full h-12 bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            autoFocus
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
          <Command.Empty className="py-6 text-center text-xs text-[var(--text-muted)]">
            No matching results found.
          </Command.Empty>
          
          <Command.Group heading="MODULES & NAVIGATION" className="text-[10px] font-bold text-[var(--text-muted)] px-2 py-1 uppercase tracking-wider">
            <Command.Item
              onSelect={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-indigo-400" /> Dashboard Overview
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/employees')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <User className="w-4 h-4 text-blue-400" /> Employee Directory
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/payroll')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" /> Payroll Engine
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/leaves')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-400" /> Leave Management
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/recruitment')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <Briefcase className="w-4 h-4 text-purple-400" /> ATS Recruitment Kanban
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/performance')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <Layers className="w-4 h-4 text-pink-400" /> Performance & OKRs
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/assets')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <Laptop className="w-4 h-4 text-cyan-400" /> IT Asset Registry
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/settings')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-l2)] cursor-pointer text-[var(--text-primary)] transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" /> Tenant Settings
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="flex justify-between items-center px-4 py-2 bg-[var(--bg-surface-l2)] border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
          <span>Navigate with <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface-l3)] rounded border border-[var(--border-subtle)] text-[9px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface-l3)] rounded border border-[var(--border-subtle)] text-[9px]">↓</kbd></span>
          <span>Select with <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface-l3)] rounded border border-[var(--border-subtle)] text-[9px]">Enter</kbd></span>
          <span>Close with <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface-l3)] rounded border border-[var(--border-subtle)] text-[9px]">Esc</kbd></span>
        </div>
      </Command>
    </div>
  );
}
