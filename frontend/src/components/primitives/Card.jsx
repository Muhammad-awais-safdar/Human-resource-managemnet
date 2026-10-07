import React from 'react';

/**
 * Card — Unified enterprise card component.
 * ALL cards across the application use the same tokens.
 * No module should define its own card color scheme.
 *
 * Token: bg-secondary (#FFFFFF), border-default (#E2E8F0)
 */
export function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`rounded-xl p-5 md:p-6 transition-colors duration-150 ${className}`}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
      {...props}
    >
      {header && (
        <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-default)' }}>
          {header}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={`mb-4 pb-3 ${className}`}
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3
      className={`text-base font-semibold ${className}`}
      style={{ color: 'var(--text-primary)' }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p
      className={`text-xs mt-1 ${className}`}
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`mt-4 pt-3 flex items-center justify-between ${className}`}
      style={{ borderTop: '1px solid var(--border-default)' }}
    >
      {children}
    </div>
  );
}

/**
 * StatCard — KPI / Metric card.
 *
 * Icon container always uses --primary-light / --primary.
 * Semantic colors (success/warning/danger) only used when the
 * metric communicates a genuine status meaning — NOT for decoration.
 */
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
  const isClickable = Boolean(onClick);

  /* Left accent bar for optional status emphasis */
  const accentColor = {
    default: 'transparent',
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger:  'var(--danger)',
  }[status] || 'transparent';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 transition-colors duration-150 ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
        borderLeft: accentColor !== 'transparent' ? `3px solid ${accentColor}` : '1px solid var(--border-default)',
      }}
      onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={(e) => { if (isClickable) e.currentTarget.style.borderColor = accentColor !== 'transparent' ? accentColor : 'var(--border-default)'; }}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          {title}
        </span>
        {icon && (
          <div
            className="p-2 rounded-lg"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-2xl md:text-3xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>

        {trend && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={
              trendDirection === 'up'
                ? { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' }
                : { background: 'var(--danger-bg)',  color: 'var(--danger-text)',  border: '1px solid var(--danger-border)'  }
            }
          >
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
