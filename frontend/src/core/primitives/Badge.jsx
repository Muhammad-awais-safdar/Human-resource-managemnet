import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'md', className = '', ...props }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
    md: 'px-2.5 py-0.5 text-xs font-medium',
    lg: 'px-3 py-1 text-sm font-medium',
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
