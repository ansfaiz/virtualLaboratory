import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Clock, CheckCircle2, BookMarked } from 'lucide-react'
import { Card, EmptyState } from '../../components/ui/index.jsx'
import { SearchInput } from '../../components/forms'
import { statusColor, formatDate } from '../../utils'
import Button from '../../components/ui/Button'
import { useFetch, useDebounce } from '../../hooks'
import { assignmentService } from '../../services'
import { getLanguageName } from '../../utils/dataHelpers'
import Skeleton from '../../components/ui/Skeleton'

export default function StudentAssignmentsPage() {
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const debouncedSearch = useDebounce(search, 300)

  // GET /assignments/student
  // Response: List<AssignmentWithStatusDTO>
  // { id, title, description, starterCode, languageId, sectionIds[], dueDate, maxScore, status, teacherId, submissionStatus }
  const { data: assignments = [], loading } = useFetch(() =>
    assignmentService.getForStudent().then(r => r.data)
  )

  const filtered = assignments.filter(a => {
    const ms  = a.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    const mst = filterStatus === 'ALL' || a.submissionStatus === filterStatus
    return ms && mst
  })

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search assignments..." className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'SUBMITTED', 'GRADED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterStatus === s ? 'bg-lab-500 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookMarked} title="No assignments found" description="Try changing your filters" />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <Card key={a.id} className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
              <div className="flex items-center gap-4 p-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  a.submissionStatus === 'GRADED'    ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                  a.submissionStatus === 'SUBMITTED' ? 'bg-lab-50 dark:bg-lab-900/20' :
                  'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {a.submissionStatus === 'GRADED'    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                   a.submissionStatus === 'SUBMITTED' ? <Clock className="h-5 w-5 text-lab-500" /> :
                   <BookMarked className="h-5 w-5 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{a.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.description?.split('\n')[0]}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {/* Language name resolved from service */}
                    <span className="code-chip">{getLanguageName(a.languageId)}</span>
                    <span className="text-xs text-slate-400">Max {a.maxScore} pts</span>
                    <span className="text-xs text-slate-400">Due {formatDate(a.dueDate)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[a.submissionStatus]}`}>
                    {a.submissionStatus}
                  </span>
                </div>

                <div className="shrink-0">
                  {a.submissionStatus === 'PENDING' ? (
                    <Link to={`/student/assignments/${a.id}/code`}>
                      <Button size="sm">Start</Button>
                    </Link>
                  ) : (
                    <Link to={`/student/assignments/${a.id}/code`}>
                      <Button size="sm" variant="outline">
                        {a.submissionStatus === 'SUBMITTED' ? 'View' : 'Review'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
