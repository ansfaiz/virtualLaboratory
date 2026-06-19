import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils'

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  error:   <XCircle className="h-4 w-4 text-rose-500" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
  info:    <Info className="h-4 w-4 text-lab-500" />,
}

const borders = {
  success: 'border-l-emerald-500',
  error:   'border-l-rose-500',
  warning: 'border-l-amber-500',
  info:    'border-l-lab-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ toast: add }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card-hover border-l-4 pointer-events-auto',
              'flex items-start gap-3 px-4 py-3 animate-slide-in-right',
              borders[t.type]
            )}
          >
            <div className="mt-0.5 shrink-0">{icons[t.type]}</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
