import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import Button from '../../components/ui/Button'
import { Card, Badge } from '../../components/ui/index.jsx'
import DataTable from '../../components/ui/DataTable'
import { SearchInput } from '../../components/forms'
import { useToast } from '../../components/ui/Toast'
import { statusColor, formatDate } from '../../utils'
import Modal from '../../components/ui/Modal'
import { useFetch, useMutation, useDebounce } from '../../hooks'
import { assignmentService } from '../../services'
import { getLanguageName } from '../../utils/dataHelpers'
import Skeleton from '../../components/ui/Skeleton'

const difficultyColor = {
  EASY:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  HARD:   'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
}

export default function AssignmentsListPage() {
  const toast = useToast()
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [deleteModal, setDeleteModal]   = useState({ open: false, item: null })
  const debouncedSearch = useDebounce(search, 400)

  // GET /assignments?status=&page=0&size=50
  // Response: Page<AssignmentDTO> { id, title, description, starterCode, languageId, sectionIds[], dueDate, maxScore, status, teacherId }
  const params = { page: 0, size: 50, ...(filterStatus !== 'ALL' && { status: filterStatus }) }
  const { data: page, loading, refetch } = useFetch(
    () => assignmentService.getAll(params).then(r => r.data),
    [filterStatus]
  )
  const assignments = page?.content ?? []

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const { mutate: deleteAssignment, loading: deleting } = useMutation(
    (id) => assignmentService.delete(id)
  )
  const { mutate: publishAssignment } = useMutation(
    (id) => assignmentService.publish(id)
  )

  const handleDelete = async () => {
    try {
      // DELETE /assignments/:id → 204 (fails if PUBLISHED with submissions)
      await deleteAssignment(deleteModal.item.id)
      toast('Assignment deleted', 'info')
      setDeleteModal({ open: false, item: null })
      refetch()
    } catch (e) {
      toast(e.message || 'Cannot delete a published assignment with submissions', 'error')
    }
  }

  const handlePublish = async (id) => {
    try {
      // PUT /assignments/:id/publish → AssignmentDTO { status: "PUBLISHED" }
      await publishAssignment(id)
      toast('Assignment published!', 'success')
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const columns = [
    {
      key: 'title', label: 'Assignment', sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{val}</p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{row.description?.split('\n')[0]}</p>
        </div>
      )
    },
    { key: 'languageId', label: 'Language', render: val => <span className="code-chip">{getLanguageName(val)}</span> },
    { key: 'maxScore',   label: 'Max Score', render: val => <span className="font-mono text-sm">{val}</span> },
    { key: 'status', label: 'Status',
      render: val => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[val]}`}>{val}</span>
      )
    },
    { key: 'sectionIds', label: 'Sections',
      render: val => val?.length
        ? val.map(s => <span key={s} className="code-chip mr-1">#{s}</span>)
        : <span className="text-slate-400 text-xs">—</span>
    },
    { key: 'dueDate', label: 'Due', sortable: true, render: val => formatDate(val) },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex gap-1 justify-end items-center">
          {row.status === 'DRAFT' && (
            <Button size="xs" variant="outline" onClick={e => { e.stopPropagation(); handlePublish(row.id) }}>
              Publish
            </Button>
          )}
          <Link to={`/teacher/assignments/${row.id}/edit`} onClick={e => e.stopPropagation()}>
            <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-lab-500 transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </Link>
          {row.status === 'DRAFT' && (
            <button
              onClick={e => { e.stopPropagation(); setDeleteModal({ open: true, item: row }) }}
              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Search assignments..." className="max-w-xs" />
          <div className="flex gap-2">
            {['ALL', 'DRAFT', 'PUBLISHED'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s ? 'bg-lab-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>{s}</button>
            ))}
          </div>
        </div>
        <Link to="/teacher/assignments/new">
          <Button icon={Plus}>New Assignment</Button>
        </Link>
      </div>

      <Card>
        {loading
          ? <div className="p-4 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          : <DataTable columns={columns} data={filtered} emptyIcon={BookOpen}
              emptyTitle="No assignments yet"
              emptyDescription="Create your first coding assignment to get started" />
        }
      </Card>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Assignment" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, item: null })}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Delete <strong className="text-slate-900 dark:text-slate-100">{deleteModal.item?.title}</strong>? Only DRAFT assignments can be deleted.
        </p>
      </Modal>
    </div>
  )
}
