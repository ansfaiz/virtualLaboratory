import { useState } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import Button from '../../components/ui/Button'
import { Badge, EmptyState, Avatar, Card } from '../../components/ui/index.jsx'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { Input, Select, SearchInput } from '../../components/forms'
import { useToast } from '../../components/ui/Toast'
import { roleColor, formatDate } from '../../utils'
import { useFetch, useMutation, useDebounce } from '../../hooks'
import { userService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'STUDENT', batchId: '' }

export default function UserManagementPage() {
  const toast = useToast()
  const [search, setSearch]       = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [page, setPage]           = useState(0)
  const [modal, setModal]         = useState({ open: false, mode: 'create', user: null })
  const [form, setForm]           = useState(EMPTY_FORM)
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
  const debouncedSearch = useDebounce(search, 400)

  // GET /users?role=&page=&size=20&sort=id,desc
  const params = { page, size: 20, sort: 'id,desc', ...(filterRole !== 'ALL' && { role: filterRole }) }
  const { data: usersPage, loading, refetch } = useFetch(
    () => userService.getAll(params).then(r => r.data),
    [page, filterRole]
  )
  const users = usersPage?.content ?? []
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const { mutate: createUser, loading: creating } = useMutation(userService.create)
  const { mutate: updateUser, loading: updating } = useMutation((data) => userService.update(modal.user?.id, data))
  const { mutate: deleteUser, loading: deleting } = useMutation((id) => userService.delete(id))

  const openCreate = () => { setForm(EMPTY_FORM); setModal({ open: true, mode: 'create', user: null }) }
  const openEdit   = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role, batchId: user.batchId ?? '' })
    setModal({ open: true, mode: 'edit', user })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email) return
    try {
      if (modal.mode === 'create') {
        // POST /users → UserDTO
        await createUser({ name: form.name, email: form.email, password: form.password, role: form.role, ...(form.batchId && { batchId: Number(form.batchId) }) })
        toast('User created successfully', 'success')
      } else {
        // PUT /users/:id → UserDTO
        await updateUser({ name: form.name, email: form.email, role: form.role, ...(form.batchId && { batchId: Number(form.batchId) }) })
        toast('User updated successfully', 'success')
      }
      setModal({ open: false, mode: 'create', user: null })
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const handleDelete = async () => {
    try {
      // DELETE /users/:id → 204
      await deleteUser(deleteModal.user.id)
      toast('User deleted', 'info')
      setDeleteModal({ open: false, user: null })
      refetch()
    } catch (e) { toast(e.message, 'error') }
  }

  const columns = [
    { key: 'name', label: 'User', sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Role', sortable: true,
      render: (val) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor[val]}`}>{val}</span>
    },
    { key: 'batchId', label: 'Batch', render: (val) => <span className="text-sm text-slate-500">{val ?? '—'}</span> },
    { key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row) }}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-lab-500 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, user: row }) }}
            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{usersPage?.totalElements ?? 0} total users</p>
        <Button icon={Plus} onClick={openCreate}>Add User</Button>
      </div>

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." className="flex-1" />
          <div className="flex gap-2">
            {['ALL', 'ADMIN', 'TEACHER', 'STUDENT', 'Coordinator', 'Deen'].map(r => (
              <button key={r} onClick={() => { setFilterRole(r); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterRole === r ? 'bg-lab-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>{r}</button>
            ))}
          </div>
        </div>
        {loading
          ? <div className="p-4 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          : <DataTable columns={columns} data={filtered} emptyIcon={Users} emptyTitle="No users found" emptyDescription="Try adjusting your search or filters" />
        }
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: 'create', user: null })}
        title={modal.mode === 'create' ? 'Add New User' : 'Edit User'}
        footer={<>
          <Button variant="outline" onClick={() => setModal({ open: false, mode: 'create', user: null })}>Cancel</Button>
          <Button loading={creating || updating} onClick={handleSubmit}>
            {modal.mode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email Address" type="email" placeholder="user@university.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          {modal.mode === 'create' && (
            <Input label="Initial Password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          )}
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Deen">Deen</option>
          </Select>
          {form.role === 'STUDENT' && (
            <Input label="Batch ID (optional)" type="number" placeholder="e.g. 1" value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))} />
          )}
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete User" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, user: null })}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to delete <strong className="text-slate-900 dark:text-slate-100">{deleteModal.user?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
