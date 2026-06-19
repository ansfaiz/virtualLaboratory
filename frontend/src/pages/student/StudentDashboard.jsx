import { Link } from 'react-router-dom'
import { BookMarked, CheckCircle2, Clock, Trophy, TrendingUp, Flame } from 'lucide-react'
import { StatCard, Card, CardHeader, CardBody } from '../../components/ui/index.jsx'
import { statusColor, formatDate } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import { useFetch } from '../../hooks'
import { analyticsService, assignmentService, submissionService } from '../../services'
import { getLanguageName } from '../../utils/dataHelpers'
import Skeleton from '../../components/ui/Skeleton'

const difficultyLabel = {
  EASY:   'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  MEDIUM: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  HARD:   'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
}

export default function StudentDashboard() {
  const { user } = useAuth()

  // GET /analytics/student
  // Response: { pending, submitted, graded, avgScore, streak, rank }
  const { data: stats, loading: statsLoading } = useFetch(() =>
    analyticsService.studentStats().then(r => r.data)
  )

  // GET /assignments/student
  // Response: List<AssignmentWithStatusDTO> — includes submissionStatus: PENDING|SUBMITTED|GRADED
  // AssignmentWithStatusDTO: { id, title, description, starterCode, languageId, sectionIds[], dueDate, maxScore, status, teacherId, submissionStatus }
  const { data: assignments = [], loading: assnLoading } = useFetch(() =>
    assignmentService.getForStudent().then(r => r.data)
  )

  // GET /submissions/my
  // Response: List<SubmissionDTO> { id, assignmentId, studentId, code, submitAt, marks, feedback, status, stdout, stderr, exitCode, executionMs }
  const { data: mySubmissions = [], loading: subsLoading } = useFetch(() =>
    submissionService.getMine().then(r => r.data)
  )

  const upcomingAssignments = assignments.filter(a => a.submissionStatus !== 'GRADED').slice(0, 3)
  const recentGrades = mySubmissions.filter(s => s.status === 'GRADED' && s.marks != null).slice(0, 3)

  // Find assignment title for a submission
  const titleFor = (assignmentId) => assignments.find(a => a.id === assignmentId)?.title ?? `Assignment #${assignmentId}`

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Student'} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            You have <span className="text-amber-500 font-semibold">{stats?.pending ?? 0} pending</span> assignment{stats?.pending !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
          <Flame className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{stats?.streak ?? 0} day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : <>
          <StatCard label="Pending"    value={stats?.pending   ?? 0}                      icon={Clock}        color="amber"  />
          <StatCard label="Submitted"  value={stats?.submitted ?? 0}                      icon={CheckCircle2} color="blue"   />
          <StatCard label="Graded"     value={stats?.graded    ?? 0}                      icon={Trophy}       color="green"  />
          <StatCard label="Avg. Score" value={`${Math.round(stats?.avgScore ?? 0)}%`}     icon={TrendingUp}   color="violet" />
        </>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">My Assignments</h3>
                <Link to="/student/assignments" className="text-xs text-lab-500 hover:text-lab-600 font-medium">
                  View all ({assignments.length}) →
                </Link>
              </div>
            </CardHeader>
            {assnLoading ? (
              <div className="p-4 space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            ) : upcomingAssignments.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">🎉 All caught up! No pending assignments.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingAssignments.map(a => (
                  <div key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                      <BookMarked className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="code-chip">{getLanguageName(a.languageId)}</span>
                        <span className="text-xs text-slate-400">Due {formatDate(a.dueDate)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColor[a.submissionStatus]}`}>
                      {a.submissionStatus}
                    </span>
                    {a.submissionStatus === 'PENDING' && (
                      <Link to={`/student/assignments/${a.id}/code`} className="shrink-0">
                        <Button size="xs">Start</Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Grades</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {subsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : recentGrades.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No grades yet</p>
            ) : recentGrades.map((s) => {
              // SubmissionDTO: marks is the score field
              const pct = s.marks / (s.maxScore ?? 100)
              return (
                <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug truncate pr-2">
                      {titleFor(s.assignmentId)}
                    </p>
                    <span className={`font-mono text-sm font-bold shrink-0 ${
                      pct >= 0.9 ? 'text-emerald-500' : pct >= 0.7 ? 'text-amber-500' : 'text-rose-500'
                    }`}>{s.marks}/{s.maxScore ?? 100}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${pct >= 0.9 ? 'bg-emerald-500' : pct >= 0.7 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${pct * 100}%` }} />
                  </div>
                  {s.feedback && <p className="text-xs text-slate-500 italic truncate">"{s.feedback}"</p>}
                </div>
              )
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
