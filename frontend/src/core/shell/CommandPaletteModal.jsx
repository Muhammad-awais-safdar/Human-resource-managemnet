import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command, ArrowRight } from 'lucide-react';

export function CommandPaletteModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    { label: 'Go to Dashboard', path: '/dashboard', category: 'Navigation' },
    { label: 'Manage Employees', path: '/employees', category: 'HR Operations' },
    { label: 'View Organizational Chart', path: '/org-chart', category: 'HR Operations' },
    { label: 'Configure Roles & RBAC', path: '/roles', category: 'Security' },
    { label: 'Process Payroll Runs', path: '/payroll', category: 'Finance' },
    { label: 'Review Approvals Queue', path: '/approvals', category: 'Workflows' },
    { label: 'Recruitment & Job Openings', path: '/recruitment', category: 'Talent' },
    { label: 'Employee Self Service', path: '/ess', category: 'Self Service' },
    { label: 'Leave Requests & Time-Off', path: '/leaves', category: 'Time Management' },
    { label: 'Submit Expense Claims', path: '/expenses', category: 'Finance' },
    { label: 'Performance Reviews', path: '/performance', category: 'Talent' },
    { label: 'Tenant Management', path: '/tenants', category: 'Administration' },
    { label: 'Platform Analytics', path: '/superadmin/analytics', category: 'SuperAdmin' },
    { label: 'Workspace Settings', path: '/settings', category: 'Settings' },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search route..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((cmd) => (
              <div
                key={cmd.path}
                onClick={() => {
                  navigate(cmd.path);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-blue-50/60 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white text-slate-600 group-hover:text-blue-600 transition-colors">
                    <Command className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {cmd.label}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">{cmd.category}</span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
