import { FileCode, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '../../components/ui/index.jsx'
import DataTable from '../../components/ui/DataTable'
import { statusColor, formatDateTime } from '../../utils'
import { useFetch } from '../../hooks'
import { submissionService, assignmentService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'

export default function StudentSubmissionsPage() {
  // GET /submissions/my → List<SubmissionDTO>
  // SubmissionDTO: { id, assignmentId, studentId, code, submitAt, marks, feedback, status, stdout, stderr, exitCode, executionMs }
  const { data: submissions = [], loading: subsLoading } = useFetch(() =>
    submissionService.getMine().then(r => r.data)
  )

  // GET /assignments/student → List<AssignmentWithStatusDTO> — to resolve assignment titles
  const { data: assignments = [] } = useFetch(() =>
    assignmentService.getForStudent().then(r => r.data)
  )
  const titleFor = (assignmentId) =>
    assignments.find(a => a.id === assignmentId)?.title ?? `Assignment #${assignmentId}`

  const columns = [
    { key: 'assignmentId', label: 'Assignment', sortable: true,
      render: val => <span className="font-medium text-slate-800 dark:text-slate-200">{titleFor(val)}</span>
    },
    { key: 'submitAt', label: 'Submitted', sortable: true,
      render: val => formatDateTime(val)
    },
    { key: 'executionMs', label: 'Exec Time',
      render: val => val != null
        ? <span className="code-chip">{val}ms</span>
        : <span className="text-slate-400 text-xs">—</span>
    },
    { key: 'exitCode', label: 'Exit',
      render: val => val != null
        ? <span className={`code-chip ${val === 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{val}</span>
        : <span className="text-slate-400 text-xs">—</span>
    },
    { key: 'status', label: 'Status',
      render: val => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[val]}`}>
          {val === 'GRADED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {val}
        </span>
      )
    },
    // SubmissionDTO uses `marks` for the score
    { key: 'marks', label: 'Score',
      render: val => val != null
        ? <span className={`font-mono font-bold text-sm ${val >= 90 ? 'text-emerald-500' : val >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>{val}</span>
        : <span className="text-slate-400 text-sm">Pending</span>
    },
    { key: 'feedback', label: 'Feedback',
      render: val => val
        ? <span className="text-xs text-slate-500 italic truncate max-w-xs block">"{val}"</span>
        : <span className="text-xs text-slate-400">—</span>
    },
  ]

  return (
    <div className="animate-slide-up">
      <Card>
        {subsLoading
          ? <div className="p-4 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          : <DataTable
              columns={columns}
              data={submissions}
              emptyIcon={FileCode}
              emptyTitle="No submissions yet"
              emptyDescription="Submit your first assignment to see it here"
            />
        }
      </Card>
    </div>
  )
}
