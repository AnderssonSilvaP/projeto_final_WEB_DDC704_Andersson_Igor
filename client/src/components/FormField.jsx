import React from 'react';

const baseInputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100';

export default function FormField({
  label,
  hint,
  as = 'input',
  children,
  className = '',
  ...props
}) {
  const Component = as;
  return (
    <label className={`block ${className}`}>
      {(label || hint) && (
        <span className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>{label}</span>
          {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
        </span>
      )}
      <Component className={baseInputClasses} {...props}>
        {children}
      </Component>
    </label>
  );
}
