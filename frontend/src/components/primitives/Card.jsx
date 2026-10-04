import React from 'react';

export function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs transition-colors duration-150 hover:border-slate-300 ${className}`}
      {...props}
    >
      {header && <div className="mb-4 pb-3 border-b border-slate-100">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-3 border-t border-slate-100">{footer}</div>}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 pb-3 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-base font-semibold text-slate-900 ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-xs text-slate-500 mt-1 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-4 pt-3 border-t border-slate-100 flex items-center justify-between ${className}`}>{children}</div>;
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
    default: 'border-slate-200 hover:border-slate-300',
    primary: 'border-blue-200 bg-blue-50/30 hover:border-blue-300',
    success: 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300',
    warning: 'border-amber-200 bg-amber-50/30 hover:border-amber-300',
    danger: 'border-red-200 bg-red-50/30 hover:border-red-300',
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-xl p-5 shadow-xs transition-colors duration-150 ${
        statusBorders[status] || statusBorders.default
      } ${isClickable ? 'cursor-pointer hover:border-slate-300' : ''} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-slate-100 text-blue-600">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendDirection === 'up'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
}
