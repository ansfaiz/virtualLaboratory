import { cn, getInitials } from '../../utils'

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800',
        hover ? 'shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : 'shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-100 dark:border-slate-800', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4 border-t border-slate-100 dark:border-slate-800', className)} {...props}>
      {children}
    </div>
  )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, delta, color = 'blue', className }) {
  const colorMap = {
    blue:   { bg: 'bg-lab-50 dark:bg-lab-900/20', icon: 'text-lab-500', border: 'border-lab-100 dark:border-lab-800/30' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500', border: 'border-emerald-100 dark:border-emerald-800/30' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500', border: 'border-amber-100 dark:border-amber-800/30' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-500', border: 'border-violet-100 dark:border-violet-800/30' },
    rose:   { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-500', border: 'border-rose-100 dark:border-rose-800/30' },
  }
  const c = colorMap[color]

  return (
    <Card className={cn('animate-slide-up', className)}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1.5 font-mono">{value ?? '—'}</p>
            {delta !== undefined && (
              <p className={cn('text-xs mt-1.5 font-medium', delta >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% from last week
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn('p-2.5 rounded-xl', c.bg, `border`, c.border)}>
              <Icon className={cn('h-5 w-5', c.icon)} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    blue:     'bg-lab-50 text-lab-700 dark:bg-lab-900/30 dark:text-lab-400',
    green:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber:    'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    rose:     'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    violet:   'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, src, size = 'md', className }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-14 h-14 text-lg' }
  const colors = ['bg-lab-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]

  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0 overflow-hidden', sizes[size], src ? '' : color, className)}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : getInitials(name)}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }
  return (
    <svg className={cn('animate-spin text-lab-500', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      )}
      <p className="text-base font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {description && <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md', className)} />
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label, className }) {
  return (
    <div className={cn('flex items-center gap-3 my-4', className)}>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}
