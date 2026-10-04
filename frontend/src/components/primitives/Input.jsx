import React from 'react';

export function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  isRequired = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1">
          {label}
          {isRequired && <span className="text-red-600 font-bold" aria-hidden="true">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isDisabled}
          required={isRequired}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full h-10 px-3.5 ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:ring-red-100 focus:border-red-600' : 'border-slate-200 hover:border-slate-300'
          }`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  error,
  helperText,
  isRequired = false,
  isDisabled = false,
  className = '',
  placeholder = 'Select an option...',
  ...props
}) {
  const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1">
          {label}
          {isRequired && <span className="text-red-600 font-bold" aria-hidden="true">*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={isDisabled}
        required={isRequired}
        aria-invalid={error ? 'true' : 'false'}
        className={`w-full h-10 px-3.5 bg-white text-slate-900 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
          error ? 'border-red-500 focus:ring-red-100 focus:border-red-600' : 'border-slate-200 hover:border-slate-300'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
