import React from 'react';

/**
 * StatusBadge — Unified status badge component.
 * Maps all workflow states to the global semantic color system.
 * 
 * NEVER use ad-hoc Tailwind colors for status indicators.
 * Always use StatusBadge or Badge with a semantic variant.
 */

const VARIANT_STYLES = {
  /* Semantic variants — mapped to CSS tokens via inline vars */
  neutral: {
    background: 'var(--neutral-bg)',
    color: 'var(--neutral-text)',
    border: '1px solid var(--neutral-border)',
  },
  primary: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid var(--primary-subtle)',
  },
  success: {
    background: 'var(--success-bg)',
    color: 'var(--success-text)',
    border: '1px solid var(--success-border)',
  },
  warning: {
    background: 'var(--warning-bg)',
    color: 'var(--warning-text)',
    border: '1px solid var(--warning-border)',
  },
  danger: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    border: '1px solid var(--danger-border)',
  },
  info: {
    background: 'var(--info-bg)',
    color: 'var(--info-text)',
    border: '1px solid var(--info-border)',
  },
};

const SIZE_STYLES = {
  sm: { padding: '1px 8px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' },
  md: { padding: '2px 10px', fontSize: '12px', fontWeight: 500 },
  lg: { padding: '4px 12px', fontSize: '13px', fontWeight: 500 },
};

export function Badge({ children, variant = 'neutral', size = 'md', className = '', style = {}, ...props }) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md ${className}`}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Workflow State → Semantic Color Mapping (Global Standard)
 * 
 * NEUTRAL:  DRAFT, TODO, APPLIED, INACTIVE, ARCHIVED
 * PRIMARY:  IN_PROGRESS, SCREENING, CALCULATED, SUBMITTED, UNDER_REVIEW
 * WARNING:  PENDING, PROBATION, IN_REVIEW, LOCKED, OFFER_EXTENDED, NOTICE_PERIOD
 * SUCCESS:  APPROVED, COMPLETED, ACTIVE, HIRED, DISBURSED, FINALIZED
 * DANGER:   REJECTED, TERMINATED, FAILED, CRITICAL, SUSPENDED
 * INFO:     DRAFT_REVIEW, SYSTEM_NOTICE, INFORMATIONAL
 */
const STATUS_VARIANT_MAP = {
  /* Neutral */
  DRAFT:          'neutral',
  TODO:           'neutral',
  APPLIED:        'neutral',
  INACTIVE:       'neutral',
  ARCHIVED:       'neutral',
  UNASSIGNED:     'neutral',

  /* Primary — In motion */
  IN_PROGRESS:    'primary',
  SCREENING:      'primary',
  CALCULATED:     'primary',
  SUBMITTED:      'primary',
  UNDER_REVIEW:   'primary',

  /* Warning — Needs attention */
  PENDING:        'warning',
  PROBATION:      'warning',
  IN_REVIEW:      'warning',
  LOCKED:         'warning',
  OFFER_EXTENDED: 'warning',
  NOTICE_PERIOD:  'warning',
  OFFER:          'warning',

  /* Success — Positive outcome */
  APPROVED:       'success',
  COMPLETED:      'success',
  ACTIVE:         'success',
  HIRED:          'success',
  DISBURSED:      'success',
  FINALIZED:      'success',
  SIGNED:         'success',
  OPERATIONAL:    'success',

  /* Danger — Negative outcome */
  REJECTED:       'danger',
  TERMINATED:     'danger',
  FAILED:         'danger',
  CRITICAL:       'danger',
  SUSPENDED:      'danger',

  /* Info */
  DRAFT_REVIEW:   'info',
  SYSTEM_NOTICE:  'info',
  INFORMATIONAL:  'info',
};

export function StatusBadge({ status = '', label, size = 'sm', className = '' }) {
  const key = typeof status === 'string' ? status.toUpperCase().replace(/\s+/g, '_') : '';
  const variant = STATUS_VARIANT_MAP[key] || 'neutral';
  const displayLabel = label || (status ? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ') : '');

  return (
    <Badge variant={variant} size={size} className={className}>
      {displayLabel}
    </Badge>
  );
}

/**
 * Legacy alias — kept for backward compatibility.
 * Prefer StatusBadge for new code.
 */
export function StatusPill({ status = 'ACTIVE', label, className = '' }) {
  return <StatusBadge status={status} label={label} size="sm" className={className} />;
}
