import { useState } from 'react'
import { Star, CheckCircle2, Clock } from 'lucide-react'
import Button from '../../components/ui/Button'
import { Card, Avatar } from '../../components/ui/index.jsx'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SearchInput, Input, Textarea } from '../../components/forms'
import { useToast } from '../../components/ui/Toast'
import { statusColor, formatDateTime } from '../../utils'
import { useFetch, useMutation, useDebounce } from '../../hooks'
import { submissionService, assignmentService } from '../../services'
import { getSubmissionWithName } from '../../utils/dataHelpers'
import Skeleton from '../../components/ui/Skeleton'

export default function SubmissionsPage() {
  const toast = useToast()
  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState('ALL')
  const [filterAssignment, setFilterAssignment] = useState('')
  const [page, setPage]                   = useState(0)
  const [gradeModal, setGradeModal]       = useState({ open: false, submission: null })
  const [gradeForm, setGradeForm]         = useState({ score: '', feedback: '' })
  const debouncedSearch = useDebounce(search, 400)

  // GET /assignments?page=0&size=100 — for the filter dropdown
  const { data: assnPage } = useFetch(() =>
    assignmentService.getAll({ page: 0, size: 100 }).then(r => r.data)
  )
  const assignments = assnPage?.content ?? []
  const assignmentTitle = (id) => assignments.find(a => a.id === Number(id))?.title ?? `Assignment #${id}`

  // GET /submissions?status=&assignmentId=&page=&size=
  const params = {
    page, size: 30, sort: 'submitAt,desc',
    ...(filterStatus !== 'ALL' && { status: filterStatus }),
    ...(filterAssignment && { assignmentId: filterAssignment }),
  }
  const { data: subsPage, loading, refetch } = useFetch(
    () => submissionService.getAll(params).then(r => r.data),
    [page, filterStatus, filterAssignment]
  )

  // Enrich submissions with student names
  const rawSubs = subsPage?.content ?? []
  const allSubs = rawSubs.map(s => {
    try { return getSubmissionWithName(s) } catch { return s }
  })

  // Client-side search by student name or assignment title
  const filtered = allSubs.filter(s => {
    const term = debouncedSearch.toLowerCase()
    if (!term) return true
    const name  = (s.studentName ?? `Student #${s.studentId}`).toLowerCase()
    const title = assignmentTitle(s.assignmentId).toLowerCase()
    return name.includes(term) || title.includes(term) || String(s.studentId).includes(term)
  })

  const openGrade = (sub) => {
    setGradeForm({ score: sub.marks ?? '', feedback: sub.feedback ?? '' })
    setGradeModal({ open: true, submission: sub })
  }

  const { mutate: gradeSubmission, loading: grading } = useMutation(
    ({ id, data }) => submissionService.grade(id, data)
  )

  const handleGrade = async () => {
    if (!gradeForm.score) { toast('Enter a score', 'error'); return }
    try {
      await gradeSubmission({
        id: gradeModal.submission.id,
        data: { score: Number(gradeForm.score), feedback: gradeForm.feedback || undefined }
      })
      toast('Submission graded!', 'success')
      setGradeModal({ open: false, submission: null })
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const columns = [
    { key: 'studentId', label: 'Student', sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.studentName ?? `Student ${val}`} size="sm" />
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {row.studentName ?? `Student #${val}`}
            </p>
            {row.studentEmail && (
              <p className="text-xs text-slate-400 font-mono">{row.studentEmail}</p>
            )}
          </div>
        </div>
      )
    },
    { key: 'assignmentId', label: 'Assignment', sortable: true,
      render: (val) => {
        const title = assignmentTitle(val)
        return <span className="text-sm text-slate-700 dark:text-slate-300">{title}</span>
      }
    },
    { key: 'submitAt', label: 'Submitted', sortable: true,
      render: val => <span className="text-xs text-slate-500">{formatDateTime(val)}</span>
    },
    { key: 'executionMs', label: 'Time',
      render: val => val != null
        ? <span className="code-chip">{val}ms</span>
        : <span className="text-slate-400">—</span>
    },
    { key: 'status', label: 'Status',
      render: val => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[val]}`}>
          {val === 'GRADED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {val}
        </span>
      )
    },
    { key: 'marks', label: 'Score',
      render: val => val != null
        ? <span className={`font-mono font-semibold text-sm ${val >= 80 ? 'text-emerald-500' : val >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{val}</span>
        : <span className="text-slate-400 text-sm">—</span>
    },
    { key: 'actions', label: '',
      render: (_, row) => (
        <Button size="xs" variant="outline" icon={Star} onClick={e => { e.stopPropagation(); openGrade(row) }}>
          {row.status === 'GRADED' ? 'Re-grade' : 'Grade'}
        </Button>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by student name or assignment..." className="flex-1 min-w-48" />
          {/* Filter by assignment */}
          <select value={filterAssignment} onChange={e => { setFilterAssignment(e.target.value); setPage(0) }}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-lab-500/20">
            <option value="">All Assignments</option>
            {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
          <div className="flex gap-2">
            {['ALL', 'SUBMITTED', 'GRADED'].map(s => (
              <button key={s} onClick={() => { setFilterStatus(s); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s ? 'bg-lab-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>{s}</button>
            ))}
          </div>
        </div>
        {loading
          ? <div className="p-4 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          : <DataTable columns={columns} data={filtered} emptyTitle="No submissions found" />
        }
      </Card>

      <Modal open={gradeModal.open} onClose={() => setGradeModal({ open: false, submission: null })}
        title="Grade Submission"
        footer={<>
          <Button variant="outline" onClick={() => setGradeModal({ open: false, submission: null })}>Cancel</Button>
          <Button loading={grading} onClick={handleGrade} icon={Star}>Submit Grade</Button>
        </>}
      >
        {gradeModal.submission && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={gradeModal.submission.studentName ?? `Student ${gradeModal.submission.studentId}`} size="md" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {gradeModal.submission.studentName ?? `Student #${gradeModal.submission.studentId}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {assignmentTitle(gradeModal.submission.assignmentId)}
                    {gradeModal.submission.executionMs != null && ` · ${gradeModal.submission.executionMs}ms`}
                  </p>
                </div>
              </div>
              {gradeModal.submission.stdout && (
                <pre className="mt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded p-2 max-h-20 overflow-auto">
                  {gradeModal.submission.stdout}
                </pre>
              )}
              {gradeModal.submission.stderr && (
                <pre className="mt-2 text-xs font-mono text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded p-2 max-h-20 overflow-auto">
                  {gradeModal.submission.stderr}
                </pre>
              )}
            </div>
            <Input label="Score" type="number" min="0" max="10000" placeholder="85"
              value={gradeForm.score} onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))} />
            <Textarea label="Feedback (optional)" rows={4} placeholder="Write feedback for the student..."
              value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} />
          </div>
        )}
      </Modal>
    </div>
  )
}
