import { useState } from 'react'
import { Plus, Pencil, Trash2, Code2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/index.jsx'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { Input } from '../../components/forms'
import { useToast } from '../../components/ui/Toast'
import { useFetch, useMutation } from '../../hooks'
import { languageService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'

const EMPTY = { name: '', version: '', extension: '', icon: '' }

export default function LanguagesPage() {
  const toast = useToast()
  const [modal, setModal] = useState({ open: false, mode: 'create', item: null })
  const [form, setForm]   = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  // GET /languages → List<LanguageDTO> { id, name, version, extension, icon, active }
  const { data: languages = [], loading, refetch } = useFetch(() => languageService.getAll().then(r => r.data))

  const { mutate: createLang, loading: creating } = useMutation(languageService.create)
  const { mutate: updateLang, loading: updating } = useMutation((data) => languageService.update(modal.item?.id, data))
  const { mutate: deleteLang, loading: deleting } = useMutation((id) => languageService.delete(id))
  const { mutate: toggleLang } = useMutation(({ id, active }) => languageService.update(id, { active }))

  const openCreate = () => { setForm(EMPTY); setModal({ open: true, mode: 'create', item: null }) }
  const openEdit   = (item) => { setForm({ name: item.name, version: item.version, extension: item.extension, icon: item.icon ?? '' }); setModal({ open: true, mode: 'edit', item }) }

  const handleSubmit = async () => {
    try {
      if (modal.mode === 'create') {
        // POST /languages { name, version, extension, active, icon } → LanguageDTO
        await createLang({ ...form, active: true })
        toast('Language added', 'success')
      } else {
        // PUT /languages/:id { version?, active?, icon? } → LanguageDTO
        await updateLang({ version: form.version, icon: form.icon })
        toast('Language updated', 'success')
      }
      setModal({ open: false, mode: 'create', item: null })
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const handleToggle = async (lang) => {
    try {
      // PUT /languages/:id { active: !current } → LanguageDTO
      await toggleLang({ id: lang.id, active: !lang.active })
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const handleDelete = async (id) => {
    try {
      // DELETE /languages/:id → 204 (409 if referenced by assignments)
      await deleteLang(id)
      toast('Language removed', 'info')
      setDeleteId(null)
      refetch()
    } catch (e) { toast(e.message || 'Cannot delete: assignments reference this language', 'error') }
  }

  const columns = [
    { key: 'name', label: 'Language',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <span className="text-xl">{row.icon}</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
        </div>
      )
    },
    { key: 'version',   label: 'Runtime / Version', render: val => <span className="code-chip">{val}</span> },
    { key: 'extension', label: 'Extension',          render: val => <span className="code-chip font-mono">{val}</span> },
    { key: 'active', label: 'Status',
      render: (val, row) => (
        <button onClick={() => handleToggle(row)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${val ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${val ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
        </button>
      )
    },
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
      <div className="flex justify-end"><Button icon={Plus} onClick={openCreate}>Add Language</Button></div>
      <Card>
        {loading ? <div className="p-4 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          : <DataTable columns={columns} data={languages} emptyIcon={Code2} emptyTitle="No languages configured" />
        }
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', item: null })}
        title={modal.mode === 'create' ? 'Add Programming Language' : 'Edit Language'}
        footer={<>
          <Button variant="outline" onClick={() => setModal({ open: false, mode: 'create', item: null })}>Cancel</Button>
          <Button loading={creating || updating} onClick={handleSubmit}>{modal.mode === 'create' ? 'Add Language' : 'Save Changes'}</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Input label="Icon" placeholder="🐍" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            <div className="col-span-3">
              <Input label="Language Name" placeholder="Python" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={modal.mode === 'edit'} />
            </div>
          </div>
          <Input label="Runtime / Version" placeholder="3.12.0" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
          {modal.mode === 'create' && <Input label="File Extension" placeholder=".py" value={form.extension} onChange={e => setForm(f => ({ ...f, extension: e.target.value }))} />}
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Language" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={() => handleDelete(deleteId)}>Delete</Button>
        </>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">Delete this language? This will fail if existing assignments use it.</p>
      </Modal>
    </div>
  )
}
