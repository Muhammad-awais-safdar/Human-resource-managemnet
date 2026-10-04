import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, User, CreditCard, Calendar, Briefcase, Settings, BarChart2, Layers, Laptop } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <Command className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900">
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <Command.Input
            placeholder="Type a command or jump to page... (Cmd+K)"
            className="w-full h-12 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
          <Command.Empty className="py-6 text-center text-xs text-slate-500">
            No matching results found.
          </Command.Empty>
          
          <Command.Group heading="MODULES & NAVIGATION" className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
            <Command.Item
              onSelect={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-blue-600" /> Dashboard Overview
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/employees')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <User className="w-4 h-4 text-blue-600" /> Employee Directory
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/payroll')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" /> Payroll Engine
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/leaves')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-600" /> Leave Management
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/recruitment')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-blue-600" /> ATS Recruitment Kanban
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/performance')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-600" /> Performance & OKRs
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/assets')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <Laptop className="w-4 h-4 text-slate-600" /> IT Asset Registry
            </Command.Item>
            <Command.Item
              onSelect={() => navigate('/settings')}
              className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-100 cursor-pointer text-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-600" /> Tenant Settings
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500">
          <span>Navigate with <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[9px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[9px]">↓</kbd></span>
          <span>Select with <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[9px]">Enter</kbd></span>
          <span>Close with <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[9px]">Esc</kbd></span>
        </div>
      </Command>
    </div>
  );
}
