import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Spinner, EmptyState } from './index.jsx'
import { cn } from '../../utils'

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  rowKey = 'id',
  onRowClick,
}) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const handleSort = (key) => {
    if (!key) return
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const sorted = sort.key
    ? [...(data || [])].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
        return sort.dir === 'asc' ? cmp : -cmp
      })
    : data || []

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={cn(
                  'text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap',
                  col.sortable && 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none',
                  col.className
                )}
                style={{ width: col.width }}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sort.key === col.key && (
                    sort.dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex justify-center"><Spinner /></div>
              </td>
            </tr>
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={row[rowKey] ?? i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-slate-100 dark:border-slate-800/60 last:border-0',
                  'hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3 text-slate-700 dark:text-slate-300', col.tdClassName)}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
