import { Users, Layers, UsersRound, Code2, BookOpen, ClipboardList, Activity } from 'lucide-react'
import { StatCard, Card, CardHeader, Avatar } from '../../components/ui/index.jsx'
import { formatDate, roleColor } from '../../utils'
import { useFetch } from '../../hooks'
import { analyticsService, userService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'

const recentActivity = [
  { text: 'New student enrolled in Batch 2025-A', time: '2 minutes ago', type: 'success' },
  { text: 'Assignment "Binary Search Tree" published', time: '14 minutes ago', type: 'info' },
  { text: 'Python runtime updated to 3.12', time: '1 hour ago', type: 'info' },
  { text: 'Section CS301-B created by Dr. Priya Singh', time: '3 hours ago', type: 'default' },
  { text: 'Teacher account created: Dr. Kapoor', time: '1 day ago', type: 'default' },
  { text: 'Submission graded: Merge Sort — 82/100', time: '1 day ago', type: 'success' },
]

export default function AdminDashboard() {
  // GET /analytics/admin → { totalUsers, totalTeachers, totalStudents, totalBatches, totalSections, totalLanguages, totalSubmissions }
  const { data: stats, loading: statsLoading } = useFetch(
    () => analyticsService.adminStats().then(r => r.data)
  )

  // GET /users?page=0&size=5&sort=id,desc → Page<UserDTO>
  const { data: usersPage, loading: usersLoading } = useFetch(
    () => userService.getAll({ page: 0, size: 5, sort: 'id,desc' }).then(r => r.data)
  )

  const recentUsers = usersPage?.content ?? []

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : <>
          <StatCard label="Total Users"   value={stats?.totalUsers       ?? 0} icon={Users}       color="blue"   />
          <StatCard label="Teachers"      value={stats?.totalTeachers    ?? 0} icon={BookOpen}    color="amber"  />
          <StatCard label="Students"      value={stats?.totalStudents    ?? 0} icon={Users}       color="green"  />
          <StatCard label="Batches"       value={stats?.totalBatches     ?? 0} icon={Layers}      color="violet" />
          <StatCard label="Sections"      value={stats?.totalSections    ?? 0} icon={UsersRound}  color="rose"   />
          <StatCard label="Submissions"   value={stats?.totalSubmissions ?? 0} icon={ClipboardList} color="blue" />
        </>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Users</h3>
                <a href="/admin/users" className="text-xs text-lab-500 hover:text-lab-600 font-medium">View all →</a>
              </div>
            </CardHeader>
            {usersLoading
              ? <div className="p-4 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
              : <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentUsers.length === 0
                    ? <p className="px-5 py-8 text-sm text-center text-slate-400">No users yet</p>
                    : recentUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <Avatar name={u.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]}`}>
                          {u.role}
                        </span>
                        <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
                          {u.createdAt ? formatDate(u.createdAt) : '—'}
                        </span>
                      </div>
                    ))
                  }
                </div>
            }
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Activity Feed</h3>
            </div>
          </CardHeader>
          <div className="px-5 py-4 space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  a.type === 'success' ? 'bg-emerald-500' :
                  a.type === 'info'    ? 'bg-lab-500' : 'bg-slate-300 dark:bg-slate-600'
                }`} />
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
