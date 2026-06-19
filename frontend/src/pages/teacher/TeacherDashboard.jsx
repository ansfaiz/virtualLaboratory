import { BookOpen, ClipboardList, Clock, TrendingUp } from 'lucide-react'
import { StatCard, Card, CardHeader, CardBody, Avatar } from '../../components/ui/index.jsx'
import { statusColor, formatDate, formatDateTime } from '../../utils'
import { useFetch } from '../../hooks'
import { analyticsService, submissionService, assignmentService } from '../../services'
import { getSubmissionWithName, getLanguageName } from '../../utils/dataHelpers'
import Skeleton from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'

export default function TeacherDashboard() {
  // GET /analytics/teacher
  const { data: stats, loading: statsLoading } = useFetch(() =>
    analyticsService.teacherStats().then(r => r.data)
  )

  // GET /submissions?page=0&size=5&sort=submitAt,desc
  const { data: subsPage, loading: subsLoading } = useFetch(() =>
    submissionService.getAll({ page: 0, size: 5, sort: 'submitAt,desc' }).then(r => r.data)
  )

  // Enrich submissions with student names
  const recentSubmissions = (subsPage?.content ?? []).map(s => {
    try { return getSubmissionWithName(s) } catch { return s }
  })

  // GET /assignments?status=PUBLISHED&page=0&size=5
  const { data: assnPage, loading: assnLoading } = useFetch(() =>
    assignmentService.getAll({ status: 'PUBLISHED', page: 0, size: 5 }).then(r => r.data)
  )
  const activeAssignments = assnPage?.content ?? []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : <>
          <StatCard label="Assignments" value={stats?.assignmentCount ?? 0} icon={BookOpen}     color="blue"   />
          <StatCard label="Submissions" value={stats?.submissionCount ?? 0} icon={ClipboardList} color="violet" />
          <StatCard label="Pending"     value={stats?.pendingGrade    ?? 0} icon={Clock}         color="amber"  />
          <StatCard label="Avg. Score"  value={stats?.avgScore != null ? `${Math.round(stats.avgScore)}%` : '—'} icon={TrendingUp} color="green" />
        </>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Submissions */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Submissions</h3>
                <Link to="/teacher/submissions" className="text-xs text-lab-500 hover:text-lab-600 font-medium">View all →</Link>
              </div>
            </CardHeader>
            {subsLoading
              ? <div className="p-4 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
              : <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentSubmissions.length === 0
                    ? <p className="px-5 py-8 text-sm text-center text-slate-400">No submissions yet</p>
                    : recentSubmissions.map(s => (
                      <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <Avatar name={s.studentName ?? `Student ${s.studentId}`} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {s.studentName ?? `Student #${s.studentId}`}
                          </p>
                          <p className="text-xs text-slate-500 truncate">Assignment #{s.assignmentId}</p>
                        </div>
                        {s.marks !== null && s.marks !== undefined
                          ? <span className="text-sm font-semibold text-emerald-500">{s.marks}/100</span>
                          : <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[s.status]}`}>{s.status}</span>
                        }
                        <span className="text-xs text-slate-400 whitespace-nowrap">{formatDateTime(s.submitAt)}</span>
                      </div>
                    ))
                  }
                </div>
            }
          </Card>
        </div>

        {/* Active Assignments */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Active Assignments</h3>
                <Link to="/teacher/assignments" className="text-xs text-lab-500 hover:text-lab-600 font-medium">Manage →</Link>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {assnLoading
                ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
                : activeAssignments.length === 0
                  ? <p className="text-sm text-slate-400 text-center py-4">No published assignments</p>
                  : activeAssignments.map(a => (
                    <div key={a.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.title}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap font-mono">
                          {a.sectionIds?.length ?? 0} section{a.sectionIds?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{getLanguageName(a.languageId)}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">Due {formatDate(a.dueDate)}</span>
                      </div>
                    </div>
                  ))
              }
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
