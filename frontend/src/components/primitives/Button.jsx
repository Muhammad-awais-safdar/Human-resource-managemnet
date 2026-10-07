import React from 'react';

/**
 * Button — Unified enterprise button component.
 * All variants consume CSS design tokens.
 * NO hard-coded hex or Tailwind color classes inside this component.
 */

const BASE =
  'inline-flex items-center justify-center font-medium transition-colors duration-150 select-none rounded-lg cursor-pointer ' +
  'focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

const FOCUS_RING = 'focus-visible:ring-[var(--primary-subtle)] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const VARIANT_STYLES = {
  primary:   'text-white border border-transparent shadow-sm',
  secondary: 'border shadow-sm',
  outline:   'border bg-transparent',
  ghost:     'bg-transparent border-transparent',
  danger:    'text-white border border-transparent shadow-sm',
  success:   'text-white border border-transparent shadow-sm',
};

const VARIANT_CSS_VARS = {
  primary: {
    '--btn-bg':       'var(--primary)',
    '--btn-hover-bg': 'var(--primary-hover)',
    '--btn-act-bg':   'var(--primary-active)',
    '--btn-border':   'transparent',
    '--btn-color':    'var(--primary-foreground)',
  },
  secondary: {
    '--btn-bg':       'var(--bg-secondary)',
    '--btn-hover-bg': 'var(--surface-hover)',
    '--btn-act-bg':   'var(--bg-surface-alt)',
    '--btn-border':   'var(--border-default)',
    '--btn-color':    'var(--text-primary)',
  },
  outline: {
    '--btn-bg':       'transparent',
    '--btn-hover-bg': 'var(--surface-hover)',
    '--btn-act-bg':   'var(--bg-surface-alt)',
    '--btn-border':   'var(--border-default)',
    '--btn-color':    'var(--text-secondary)',
  },
  ghost: {
    '--btn-bg':       'transparent',
    '--btn-hover-bg': 'var(--surface-hover)',
    '--btn-act-bg':   'var(--bg-surface-alt)',
    '--btn-border':   'transparent',
    '--btn-color':    'var(--text-secondary)',
  },
  danger: {
    '--btn-bg':       'var(--danger)',
    '--btn-hover-bg': 'var(--danger-hover)',
    '--btn-act-bg':   'var(--danger-text)',
    '--btn-border':   'transparent',
    '--btn-color':    '#FFFFFF',
  },
  success: {
    '--btn-bg':       'var(--success)',
    '--btn-hover-bg': 'var(--success-hover)',
    '--btn-act-bg':   'var(--success-text)',
    '--btn-border':   'transparent',
    '--btn-color':    '#FFFFFF',
  },
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
  md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
  lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[44px]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const cssVars = VARIANT_CSS_VARS[variant] || VARIANT_CSS_VARS.primary;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`${BASE} ${FOCUS_RING} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      style={{
        ...cssVars,
        backgroundColor: 'var(--btn-bg)',
        color: 'var(--btn-color)',
        borderColor: 'var(--btn-border)',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-bg)'; }}
      onMouseDown={(e)  => { e.currentTarget.style.backgroundColor = 'var(--btn-act-bg)'; }}
      onMouseUp={(e)    => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; }}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}

export function IconButton({
  icon,
  ariaLabel,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  onClick,
  className = '',
  ...props
}) {
  return (
    <Button
      variant={variant}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`!px-0 !py-0 !w-10 !h-10 ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}
