import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardHeader, CardBody, Avatar } from '../../components/ui/index.jsx'
import { Select } from '../../components/forms'
import { useFetch } from '../../hooks'
import { analyticsService, sectionService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400">{label}</p>
      <p className="text-white font-semibold">{payload[0].value}{payload[0].name === 'avg' ? '%' : ''}</p>
    </div>
  )
}

export default function PerformancePage() {
  const [selectedSection, setSelectedSection] = useState('')

  // GET /sections?page=0&size=100 → Page<SectionDTO> { id, name, batchId, teacherId, studentCount }
  const { data: sectionsPage } = useFetch(() =>
    sectionService.getAll({ page: 0, size: 100 }).then(r => r.data)
  )
  const sections = sectionsPage?.content ?? []

  // GET /analytics/teacher?sectionId=
  // Response: { assignmentCount, submissionCount, pendingGrade, avgScore, scoreDistribution[] }
  const { data: teacherStats, loading: statsLoading } = useFetch(
    () => analyticsService.teacherStats(selectedSection ? { sectionId: selectedSection } : {}).then(r => r.data),
    [selectedSection]
  )

  // GET /analytics/sections/:sectionId → { sectionId, completionRate, topStudentIds[], scoreHistogram[], languageUsage[] }
  const { data: sectionStats, loading: sectionLoading } = useFetch(
    () => selectedSection
      ? analyticsService.sectionPerformance(selectedSection).then(r => r.data)
      : Promise.resolve(null),
    [selectedSection]
  )

  // scoreHistogram: array of { bucket, count } from the API
  const histogramData = sectionStats?.scoreHistogram ?? []
  // languageUsage: array of { languageId, count }
  const languageData  = sectionStats?.languageUsage  ?? []
  const topStudents   = sectionStats?.topStudentIds  ?? []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Section Filter */}
      <div className="flex items-center gap-3">
        <Select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-56">
          <option value="">All Sections</option>
          {/* SectionDTO: { id, name } */}
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      {/* Teacher Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Assignments', 'Submissions', 'Pending Grade', 'Avg Score'].map((label, i) => {
          const vals = [teacherStats?.assignmentCount, teacherStats?.submissionCount, teacherStats?.pendingGrade, teacherStats?.avgScore ? `${Math.round(teacherStats.avgScore)}%` : '—']
          return (
            <div key={label} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              {statsLoading ? <Skeleton className="h-7 w-16 rounded" /> :
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{vals[i] ?? '—'}</p>
              }
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Score Histogram */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Score Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">{selectedSection ? 'Selected section' : 'All sections'}</p>
          </CardHeader>
          <CardBody>
            {sectionLoading ? <Skeleton className="h-48 rounded-xl" /> :
              histogramData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                  {selectedSection ? 'No histogram data yet' : 'Select a section to see distribution'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="submissions" fill="#0e76fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </CardBody>
        </Card>

        {/* Language Usage */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Language Usage</h3>
          </CardHeader>
          <CardBody>
            {sectionLoading ? <Skeleton className="h-48 rounded-xl" /> :
              languageData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                  {selectedSection ? 'No data yet' : 'Select a section to see language breakdown'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={languageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="languageId" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={60}
                      tickFormatter={id => `Lang #${id}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="submissions" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </CardBody>
        </Card>
      </div>

      {/* Top Students */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Top Performing Students</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedSection ? `Section analytics — ${topStudents.length} top student IDs` : 'Select a section to see top students'}
          </p>
        </CardHeader>
        {sectionLoading ? (
          <div className="p-4 space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
        ) : topStudents.length === 0 ? (
          <p className="px-5 py-8 text-sm text-center text-slate-400">
            {selectedSection ? 'No student data yet' : 'Select a section above'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* topStudentIds: number[] — display IDs since backend gives IDs only */}
            {topStudents.map((studentId, i) => (
              <div key={studentId} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm font-mono ${
                  i === 0 ? 'bg-amber-400 text-white' :
                  i === 1 ? 'bg-slate-300 dark:bg-slate-600 text-white' :
                  i === 2 ? 'bg-amber-700 text-white' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>{i + 1}</div>
                <Avatar name={`Student ${studentId}`} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Student #{studentId}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
