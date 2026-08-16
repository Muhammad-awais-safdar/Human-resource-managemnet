import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'md', className = '', ...props }) {
  const variants = {
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    secondary: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status = 'ACTIVE', label, className = '' }) {
  const statusMap = {
    ACTIVE: { variant: 'success', text: label || 'Active' },
    COMPLETED: { variant: 'success', text: label || 'Completed' },
    APPROVED: { variant: 'success', text: label || 'Approved' },
    PENDING: { variant: 'warning', text: label || 'Pending' },
    IN_PROGRESS: { variant: 'info', text: label || 'In Progress' },
    SUSPENDED: { variant: 'danger', text: label || 'Suspended' },
    REJECTED: { variant: 'danger', text: label || 'Rejected' },
    DISABLED: { variant: 'neutral', text: label || 'Disabled' },
  };

  const current = statusMap[status.toUpperCase()] || { variant: 'neutral', text: label || status };

  return <Badge variant={current.variant} size="sm" className={className}>{current.text}</Badge>;
}
