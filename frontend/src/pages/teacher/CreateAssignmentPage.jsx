import { useState, useEffect } from 'react'
import { Eye, Send, ChevronLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import { Card, CardHeader, CardBody } from '../../components/ui/index.jsx'
import { Input, Textarea, Select } from '../../components/forms'
import { useToast } from '../../components/ui/Toast'
import { useFetch, useMutation } from '../../hooks'
import { languageService, sectionService, assignmentService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'
import { useNavigate, useParams, Link } from 'react-router-dom'

const EMPTY_FORM = {
  title: '', description: '', languageId: '', maxScore: 100,
  dueDate: '', sectionIds: [], starterCode: '',
}

export default function CreateAssignmentPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const toast      = useToast()
  const isEdit     = !!id

  const [form, setForm]           = useState(EMPTY_FORM)
  const [activeTab, setActiveTab] = useState('details')

  // GET /api/languages — Auth Required
  const { data: languages = [], error: langError } = useFetch(
    () => languageService.getAll().then(r => r.data)
  )

  // GET /api/sections?page=0&size=100 — Auth Required
  const { data: sectionsPage, error: sectError } = useFetch(
    () => sectionService.getAll({ page: 0, size: 100 }).then(r => r.data)
  )
  const sections = sectionsPage?.content ?? []

  // Edit mode: GET /api/assignments/:id
  const { data: existing, loading: loadingExisting } = useFetch(
    () => isEdit ? assignmentService.getById(id).then(r => r.data) : Promise.resolve(null),
    [id]
  )

  useEffect(() => {
    if (existing) {
      setForm({
        title:       existing.title       ?? '',
        description: existing.description ?? '',
        languageId:  existing.languageId  ?? '',
        maxScore:    existing.maxScore    ?? 100,
        dueDate:     existing.dueDate?.slice(0, 16) ?? '',
        sectionIds:  existing.sectionIds  ?? [],
        starterCode: existing.starterCode ?? '',
      })
    }
  }, [existing])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleSection = (sId) => {
    const n = Number(sId)
    set('sectionIds', form.sectionIds.includes(n)
      ? form.sectionIds.filter(x => x !== n)
      : [...form.sectionIds, n]
    )
  }

  const buildPayload = () => ({
    title:       form.title,
    description: form.description,
    starterCode: form.starterCode || undefined,
    languageId:  Number(form.languageId),
    sectionIds:  form.sectionIds,
    dueDate:     form.dueDate,
    maxScore:    Number(form.maxScore),
  })

  // POST /api/assignments
  const { mutate: createAssignment, loading: creating } = useMutation(assignmentService.create)
  // PUT  /api/assignments/:id
  const { mutate: updateAssignment, loading: updating } = useMutation(
    (data) => assignmentService.update(id, data)
  )
  // PUT  /api/assignments/:id/publish
  const { mutate: publishAssignment, loading: publishing } = useMutation(
    () => assignmentService.publish(id)
  )

  const handleSaveDraft = async () => {
    if (!form.title || !form.description) {
      toast('Title and description are required', 'error'); return
    }
    try {
      if (isEdit) {
        await updateAssignment(buildPayload())
        toast('Draft saved', 'success')
      } else {
        const created = await createAssignment(buildPayload())
        toast('Assignment saved as draft', 'success')
        navigate(`/teacher/assignments/${created.id}/edit`, { replace: true })
      }
    } catch (e) { toast(e.message || 'Failed to save', 'error') }
  }

  const handlePublish = async () => {
    if (!form.title || !form.description) {
      toast('Title and description are required', 'error'); return
    }
    try {
      if (!isEdit) {
        const created = await createAssignment(buildPayload())
        await assignmentService.publish(created.id)
      } else {
        await updateAssignment(buildPayload())
        await publishAssignment()
      }
      toast('Assignment published!', 'success')
      navigate('/teacher/assignments')
    } catch (e) { toast(e.message || 'Failed to publish', 'error') }
  }

  const tabs = ['details', 'code', 'sections']

  if (isEdit && loadingExisting) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 pt-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/teacher/assignments"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? `Editing assignment #${id}` : 'Create a new coding assignment'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} icon={Eye}
            loading={creating || updating} disabled={publishing}>
            Save Draft
          </Button>
          <Button onClick={handlePublish} loading={publishing}
            icon={Send} disabled={creating || updating}
            title={isEdit && existing?.status === 'PUBLISHED' ? 'Already published' : ''}>
            {isEdit && existing?.status === 'PUBLISHED' ? 'Re-publish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === t
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {t === 'code' ? 'Starter Code' : t === 'sections' ? `Sections (${form.sectionIds.length})` : t}
          </button>
        ))}
      </div>

      {/* ── Details Tab ── */}
      {activeTab === 'details' && (
        <Card>
          <CardBody className="space-y-5">
            <Input label="Assignment Title *"
              placeholder="e.g. Implement a Binary Search Tree"
              value={form.title}
              onChange={e => set('title', e.target.value)} />
            <Textarea label="Problem Description *"
              placeholder="Describe the problem, constraints, and examples..."
              rows={6} value={form.description}
              onChange={e => set('description', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Programming Language" value={form.languageId}
                onChange={e => set('languageId', e.target.value)}>
                <option value="">— Select language —</option>
                {langError && <option disabled>Failed to load languages</option>}
                {languages.filter(l => l.active !== false).map(l => (
                  <option key={l.id} value={l.id}>
                    {l.icon ? `${l.icon} ` : ''}{l.name} {l.version ? `(${l.version})` : ''}
                  </option>
                ))}
              </Select>
              <Input label="Max Score" type="number" min="1" max="1000"
                value={form.maxScore}
                onChange={e => set('maxScore', e.target.value)} />
            </div>
            <Input label="Due Date & Time" type="datetime-local"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)} />
          </CardBody>
        </Card>
      )}

      {/* ── Starter Code Tab ── */}
      {activeTab === 'code' && (
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Starter Code</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This code will be pre-filled in the student's editor
            </p>
          </CardHeader>
          <CardBody>
            <Textarea
              placeholder={`# Write starter code for students\ndef solution():\n    pass`}
              rows={16} value={form.starterCode}
              onChange={e => set('starterCode', e.target.value)}
              className="font-mono text-sm" />
          </CardBody>
        </Card>
      )}

      {/* ── Sections Tab ── */}
      {activeTab === 'sections' && (
        <Card>
          <CardHeader>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Assign to Sections</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Students in selected sections will see this assignment
            </p>
          </CardHeader>
          <CardBody>
            {sectError ? (
              <p className="text-sm text-rose-500 text-center py-4">
                Failed to load sections. Make sure you're logged in.
              </p>
            ) : sections.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No sections available yet
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sections.map(s => {
                  const selected = form.sectionIds.includes(s.id)
                  return (
                    <button key={s.id} onClick={() => toggleSection(s.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? 'border-lab-500 bg-lab-500/5 dark:bg-lab-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        selected ? 'border-lab-500 bg-lab-500' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${selected ? 'text-lab-600 dark:text-lab-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {s.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {s.studentCount ?? 0} students
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
