import { forwardRef } from 'react'
import { cn } from '../../utils'

export const Input = forwardRef(function Input({ label, error, hint, icon: Icon, className, wrapperClassName, ...props }, ref) {
  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2',
            'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
            error
              ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
              : 'border-slate-200 dark:border-slate-700 focus:ring-lab-500/20 focus:border-lab-500 dark:focus:border-lab-400',
            Icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, hint, className, wrapperClassName, ...props }, ref) {
  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <textarea
        ref={ref}
        rows={4}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 resize-y',
          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
          error
            ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
            : 'border-slate-200 dark:border-slate-700 focus:ring-lab-500/20 focus:border-lab-500 dark:focus:border-lab-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
})

export function Select({ label, error, hint, children, className, wrapperClassName, ...props }) {
  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select
        className={cn(
          'w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 appearance-none cursor-pointer',
          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          error
            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
            : 'border-slate-200 dark:border-slate-700 focus:ring-lab-500/20 focus:border-lab-500 dark:focus:border-lab-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lab-500/20 focus:border-lab-500 dark:focus:border-lab-400 transition-colors"
      />
    </div>
  )
}
