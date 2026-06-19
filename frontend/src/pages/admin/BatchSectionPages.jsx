import { useState } from 'react'
import { Plus, Pencil, Trash2, Layers, UsersRound } from 'lucide-react'
import Button from '../../components/ui/Button'
import { Card, EmptyState } from '../../components/ui/index.jsx'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/forms'
import { useToast } from '../../components/ui/Toast'
import { formatDate } from '../../utils'
import { useFetch, useMutation } from '../../hooks'
import { batchService, sectionService, userService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'

// ─── Batches Page ─────────────────────────────────────────────────────────────
export function BatchesPage() {
  const toast = useToast()
  const [modal, setModal]   = useState({ open: false, mode: 'create', item: null })
  const [form, setForm]     = useState({ name: '', year: new Date().getFullYear(), startDate: '' })
  const [deleteId, setDeleteId] = useState(null)

  // GET /batches → List<BatchDTO> { id, name, year, startDate, sectionCount, studentCount, sectionIds[] }
  const { data: batches = [], loading, refetch } = useFetch(() => batchService.getAll().then(r => r.data))

  const { mutate: createBatch, loading: creating } = useMutation(batchService.create)
  const { mutate: updateBatch, loading: updating } = useMutation((data) => batchService.update(modal.item?.id, data))
  const { mutate: deleteBatch, loading: deleting } = useMutation((id) => batchService.delete(id))

  const openCreate = () => { setForm({ name: '', year: new Date().getFullYear(), startDate: '' }); setModal({ open: true, mode: 'create', item: null }) }
  const openEdit   = (item) => { setForm({ name: item.name, year: item.year, startDate: item.startDate.split('T')[0] }); setModal({ open: true, mode: 'edit', item }) }

  const handleSubmit = async () => {
    try {
      const payload = { name: form.name, year: Number(form.year), startDate: form.startDate }
      if (modal.mode === 'create') {
        // POST /batches { name, year, startDate } → BatchDTO
        await createBatch(payload)
        toast('Batch created', 'success')
      } else {
        // PUT /batches/:id { name?, year? } → BatchDTO
        await updateBatch({ name: form.name, year: Number(form.year) })
        toast('Batch updated', 'success')
      }
      setModal({ open: false, mode: 'create', item: null })
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const handleDelete = async (id) => {
    try {
      // DELETE /batches/:id → 204 (409 if students exist)
      await deleteBatch(id)
      toast('Batch deleted', 'info')
      setDeleteId(null)
      refetch()
    } catch (e) { toast(e.message || 'Cannot delete: batch still has enrolled students', 'error') }
  }

  const columns = [
    { key: 'name',         label: 'Batch Name', sortable: true, render: val => <span className="font-semibold font-mono text-lab-600 dark:text-lab-400">{val}</span> },
    { key: 'year',         label: 'Year',       sortable: true },
    { key: 'studentCount', label: 'Students',   sortable: true, render: val => <span className="font-mono">{val ?? 0}</span> },
    { key: 'sectionCount', label: 'Sections',   sortable: true, render: val => <span className="font-mono">{val ?? 0}</span> },
    { key: 'startDate',    label: 'Start Date', render: val => formatDate(val) },
    { key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-lab-500 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex justify-end"><Button icon={Plus} onClick={openCreate}>New Batch</Button></div>
      <Card>
        {loading ? <div className="p-4 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          : <DataTable columns={columns} data={batches} emptyIcon={Layers} emptyTitle="No batches yet" />
        }
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', item: null })}
        title={modal.mode === 'create' ? 'Create Batch' : 'Edit Batch'}
        footer={<>
          <Button variant="outline" onClick={() => setModal({ open: false, mode: 'create', item: null })}>Cancel</Button>
          <Button loading={creating || updating} onClick={handleSubmit}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Batch Name" placeholder="2025-A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Year" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          {modal.mode === 'create' && <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />}
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Batch" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={() => handleDelete(deleteId)}>Delete</Button>
        </>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">Delete this batch? This will fail if students are still enrolled.</p>
      </Modal>
    </div>
  )
}

// ─── Sections Page ────────────────────────────────────────────────────────────
export function SectionsPage() {
  const toast = useToast()
  const [modal, setModal]   = useState({ open: false, mode: 'create', item: null })
  const [form, setForm]     = useState({ name: '', batchId: '', teacherId: '' })
  const [deleteId, setDeleteId] = useState(null)

  // GET /sections → Page<SectionDTO> { id, name, batchId, teacherId, studentCount, students[] }
  const { data: sectionsPage, loading, refetch } = useFetch(() => sectionService.getAll({ page: 0, size: 50 }))
  const sections = sectionsPage?.content ?? []

  // GET /batches for the batch selector
  const { data: batches = [] } = useFetch(() => batchService.getAll().then(r => r.data))
  // GET /users?role=TEACHER for the teacher selector
  const { data: teachersPage } = useFetch(() => userService.getAll({ role: 'TEACHER', size: 100 }))
  const teachers = teachersPage?.content ?? []

  const { mutate: createSection, loading: creating } = useMutation(sectionService.create)
  const { mutate: updateSection, loading: updating } = useMutation((data) => sectionService.update(modal.item?.id, data))
  const { mutate: deleteSection, loading: deleting } = useMutation((id) => sectionService.delete(id))

  const openCreate = () => { setForm({ name: '', batchId: batches[0]?.id ?? '', teacherId: '' }); setModal({ open: true, mode: 'create', item: null }) }
  const openEdit   = (item) => { setForm({ name: item.name, batchId: item.batchId, teacherId: item.teacherId }); setModal({ open: true, mode: 'edit', item }) }

  const handleSubmit = async () => {
    try {
      if (modal.mode === 'create') {
        // POST /sections { name, batchId, teacherId } → SectionDTO
        await createSection({ name: form.name, batchId: Number(form.batchId), teacherId: Number(form.teacherId) })
        toast('Section created', 'success')
      } else {
        // PUT /sections/:id { name?, teacherId? } → SectionDTO
        await updateSection({ name: form.name, teacherId: Number(form.teacherId) })
        toast('Section updated', 'success')
      }
      setModal({ open: false, mode: 'create', item: null })
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const handleDelete = async (id) => {
    try {
      // DELETE /sections/:id → 204
      await deleteSection(id)
      toast('Section deleted', 'info')
      setDeleteId(null)
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const columns = [
    { key: 'name',         label: 'Section',     sortable: true, render: val => <span className="font-semibold font-mono text-lab-600 dark:text-lab-400">{val}</span> },
    { key: 'batchId',      label: 'Batch ID',    render: val => <span className="font-mono text-sm">{val}</span> },
    { key: 'teacherId',    label: 'Teacher ID',  render: val => <span className="font-mono text-sm">{val}</span> },
    { key: 'studentCount', label: 'Students',    render: val => <span className="font-mono">{val ?? 0}</span> },
    { key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-lab-500 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex justify-end"><Button icon={Plus} onClick={openCreate}>New Section</Button></div>
      <Card>
        {loading ? <div className="p-4 space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          : <DataTable columns={columns} data={sections} emptyIcon={UsersRound} emptyTitle="No sections yet" />
        }
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', item: null })}
        title={modal.mode === 'create' ? 'Create Section' : 'Edit Section'}
        footer={<>
          <Button variant="outline" onClick={() => setModal({ open: false, mode: 'create', item: null })}>Cancel</Button>
          <Button loading={creating || updating} onClick={handleSubmit}>{modal.mode === 'create' ? 'Create' : 'Save'}</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Section Name" placeholder="CS301-A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Select label="Batch" value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))}>
            <option value="">— Select batch —</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
          <Select label="Assign Teacher" value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
            <option value="">— Select teacher —</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Section" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={() => handleDelete(deleteId)}>Delete</Button>
        </>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">Delete this section? Students will be unenrolled but their accounts are kept.</p>
      </Modal>
    </div>
  )
}
