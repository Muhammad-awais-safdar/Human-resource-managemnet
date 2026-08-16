import React from 'react';

export function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-6 shadow-lg shadow-black/20 transition-all duration-200 hover:border-slate-700/80 ${className}`}
      {...props}
    >
      {header && <div className="mb-4 pb-3 border-b border-slate-800/60">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-3 border-t border-slate-800/60">{footer}</div>}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 pb-3 border-b border-slate-800/60 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-bold text-white ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-xs text-slate-400 mt-1 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between ${className}`}>{children}</div>;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'up',
  status = 'default',
  className = '',
  onClick,
  ...props
}) {
  const statusBorders = {
    default: 'border-slate-800 hover:border-slate-700',
    primary: 'border-indigo-500/40 hover:border-indigo-500/70 bg-indigo-950/10',
    success: 'border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-950/10',
    warning: 'border-amber-500/40 hover:border-amber-500/70 bg-amber-950/10',
    danger: 'border-rose-500/40 hover:border-rose-500/70 bg-rose-950/10',
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border rounded-xl p-5 shadow-lg transition-all duration-200 ${
        statusBorders[status] || statusBorders.default
      } ${isClickable ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0' : ''} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-slate-800/70 text-indigo-400">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendDirection === 'up'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  );
}
