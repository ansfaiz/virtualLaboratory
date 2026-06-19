import { Trophy, TrendingUp, Target, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import { StatCard, Card, CardHeader, CardBody } from '../../components/ui/index.jsx'
import { useFetch } from '../../hooks'
import { analyticsService, submissionService, assignmentService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value}</p>
    </div>
  )
}

export default function ResultsPage() {
  // GET /analytics/student
  // Response: { pending, submitted, graded, avgScore, streak, rank }
  const { data: stats, loading: statsLoading } = useFetch(() =>
    analyticsService.studentStats().then(r => r.data)
  )

  // GET /submissions/my → List<SubmissionDTO>
  // SubmissionDTO: { id, assignmentId, studentId, code, submitAt, marks, feedback, status, stdout, stderr, exitCode, executionMs }
  const { data: mySubmissions = [], loading: subsLoading } = useFetch(() =>
    submissionService.getMine().then(r => r.data)
  )

  // GET /assignments/student → to get titles
  const { data: assignments = [] } = useFetch(() =>
    assignmentService.getForStudent().then(r => r.data)
  )
  const titleFor = (assignmentId) => {
    const a = assignments.find(x => x.id === assignmentId)
    return a?.title?.split(' ').slice(0, 3).join(' ') ?? `#${assignmentId}`
  }

  // Graded submissions where marks is not null
  const gradedSubs = mySubmissions.filter(s => s.status === 'GRADED' && s.marks != null)
  const topScore   = gradedSubs.length ? Math.max(...gradedSubs.map(s => s.marks)) : 0

  // Score history chart data — uses SubmissionDTO.marks
  const scoreHistory = gradedSubs.map(s => ({
    name:  titleFor(s.assignmentId),
    score: s.marks,
  }))

  // Radar is static percentile-based skills — we keep placeholder since backend doesn't return this
  const radarData = [
    { subject: 'Arrays',  A: 88 },
    { subject: 'Trees',   A: 82 },
    { subject: 'Graphs',  A: 75 },
    { subject: 'DP',      A: 70 },
    { subject: 'Sorting', A: 90 },
    { subject: 'Hashing', A: 78 },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : <>
          <StatCard label="Avg. Score"  value={`${Math.round(stats?.avgScore ?? 0)}%`}          icon={TrendingUp} color="blue"   />
          <StatCard label="Completed"   value={`${stats?.graded ?? 0}/${(stats?.graded ?? 0) + (stats?.submitted ?? 0) + (stats?.pending ?? 0)}`}
                                                                                                 icon={Target}     color="green"  />
          <StatCard label="Class Rank"  value={stats?.rank ? `#${stats.rank}` : '—'}            icon={Trophy}     color="amber"  />
          <StatCard label="Top Score"   value={topScore > 0 ? topScore : '—'}                   icon={Star}       color="violet" />
        </>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader><h3 className="font-semibold text-slate-900 dark:text-slate-100">Score History</h3></CardHeader>
            <CardBody>
              {subsLoading ? <Skeleton className="h-48 rounded-xl" /> :
                scoreHistory.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No graded submissions yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={scoreHistory} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#0e76fd" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900 dark:text-slate-100">Skill Radar</h3></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar name="Score" dataKey="A" stroke="#0e76fd" fill="#0e76fd" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold text-slate-900 dark:text-slate-100">All Graded Submissions</h3></CardHeader>
        {subsLoading ? (
          <div className="p-4 space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : gradedSubs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">No graded submissions yet</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {gradedSubs.map(s => {
              // maxScore not in SubmissionDTO — use 100 as fallback
              const max = 100
              const pct = s.marks / max
              return (
                <div key={s.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-sm ${
                    pct >= 0.9 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                    pct >= 0.7 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                    'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                  }`}>{s.marks}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{titleFor(s.assignmentId)}</p>
                    {s.feedback && <p className="text-xs text-slate-500 mt-0.5 italic">"{s.feedback}"</p>}
                    {s.executionMs != null && <p className="text-xs text-slate-400 mt-0.5">{s.executionMs}ms · exit {s.exitCode}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 0.9 ? 'bg-emerald-500' : pct >= 0.7 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{s.marks}/{max}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
