import { cn } from '../../utils'

// Animated loading skeleton — used as placeholder while data is loading
export default function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md', className)} />
  )
}
