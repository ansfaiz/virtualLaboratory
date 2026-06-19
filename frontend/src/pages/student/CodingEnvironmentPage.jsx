import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play, Send, ChevronLeft, ChevronDown, ChevronRight,
  Terminal, BookOpen, CheckCircle2, AlertCircle, Loader2, RefreshCw
} from 'lucide-react'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { useTheme } from '../../context/ThemeContext'
import { useFetch, useMutation } from '../../hooks'
import { assignmentService, submissionService, languageService } from '../../services'
import Skeleton from '../../components/ui/Skeleton'
import { monacoLanguageMap } from '../../utils'

const CONSOLE_PLACEHOLDER = `// Console output will appear here after running your code.\n// Click "Run Code" to execute against sample input.`

const difficultyColor = {
  EASY:   'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  MEDIUM: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  HARD:   'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
}

export default function CodingEnvironmentPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const toast      = useToast()
  const { theme }  = useTheme()
  const editorRef  = useRef(null)

  const [code, setCode]               = useState('')
  const [selectedLangId, setSelectedLangId] = useState(null)
  const [output, setOutput]           = useState('')
  const [stderr, setStderr]           = useState('')
  const [consoleState, setConsoleState] = useState('idle') // idle | running | success | error
  const [consoleOpen, setConsoleOpen] = useState(true)
  const [descOpen, setDescOpen]       = useState(true)
  const [customInput, setCustomInput] = useState('')
  const [activeConsoleTab, setActiveConsoleTab] = useState('output')

  // GET /assignments/:id → AssignmentDTO
  // { id, title, description, starterCode, languageId, sectionIds[], dueDate, maxScore, status, teacherId }
  const { data: assignment, loading: loadingAssignment } = useFetch(() =>
    assignmentService.getById(id).then(r => {
      const a = r.data
      // Initialise editor with starter code when assignment loads
      setCode(a.starterCode ?? '')
      setSelectedLangId(a.languageId)
      return a
    }),
    [id]
  )

  // GET /languages → List<LanguageDTO> { id, name, version, extension, icon, active }
  const { data: languages = [] } = useFetch(() =>
    languageService.getAll().then(r => r.data)
  )
  const activeLangs = languages.filter(l => l.active)
  const currentLang = languages.find(l => l.id === selectedLangId)

  const handleLangChange = (langId) => {
    setSelectedLangId(Number(langId))
    setOutput('')
    setStderr('')
    setConsoleState('idle')
  }

  const resetCode = () => {
    setCode(assignment?.starterCode ?? '')
    toast('Code reset to starter template', 'info')
  }

  // POST /submissions/run { code, languageId, stdin? }
  // Response: { stdout, stderr, exitCode, executionMs }
  const { mutate: runCode } = useMutation(submissionService.runCode)

  const handleRun = async () => {
    if (!code.trim()) { toast('Write some code first', 'error'); return }
    setConsoleState('running')
    setConsoleOpen(true)
    setActiveConsoleTab('output')
    setOutput('')
    setStderr('')
    try {
      const result = await runCode({
        code,
        languageId: selectedLangId,
        stdin: customInput || undefined,
      })
      // result: { stdout, stderr, exitCode, executionMs }
      setOutput(result.stdout ?? '')
      setStderr(result.stderr ?? '')
      setConsoleState(result.exitCode === 0 ? 'success' : 'error')
    } catch (e) {
      setStderr(e.message)
      setConsoleState('error')
    }
  }

  // POST /submissions { assignmentId, code, languageId } → SubmissionDTO
  const { mutate: submitCode, loading: submitting } = useMutation(submissionService.submit)

  const handleSubmit = async () => {
    if (!code.trim()) { toast('Write some code first', 'error'); return }
    try {
      await submitCode({ assignmentId: Number(id), code, languageId: selectedLangId })
      toast('Solution submitted! 🎉', 'success')
      navigate('/student/assignments')
    } catch (e) { toast(e.message, 'error') }
  }

  if (loadingAssignment) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col -m-6">
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-full rounded-lg" style={{ minHeight: 400 }} />
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-500 mb-3">Assignment not found</p>
          <Link to="/student/assignments"><Button variant="outline">Go Back</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -m-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link to="/student/assignments" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{assignment.title}</h2>
        </div>

        {/* Language Selector — driven by GET /languages */}
        <select value={selectedLangId ?? ''}
          onChange={e => handleLangChange(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lab-500/20 font-mono">
          {/* Show the assignment's primary language first, then all active languages */}
          {activeLangs.map(l => (
            <option key={l.id} value={l.id}>{l.icon} {l.name}</option>
          ))}
        </select>

        <button onClick={resetCode}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          title="Reset to starter code">
          <RefreshCw className="h-4 w-4" />
        </button>

        <Button variant="outline" icon={Play} size="sm" onClick={handleRun} loading={consoleState === 'running'}>
          Run Code
        </Button>
        <Button icon={Send} size="sm" loading={submitting} onClick={handleSubmit}>
          Submit
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Problem */}
        <div className={`flex flex-col border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${descOpen ? 'w-80 xl:w-96' : 'w-10'}`}>
          <button onClick={() => setDescOpen(!descOpen)}
            className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm text-slate-600 dark:text-slate-400 shrink-0">
            <BookOpen className="h-4 w-4 shrink-0" />
            {descOpen && <span className="font-medium">Problem</span>}
            <ChevronRight className={`h-3.5 w-3.5 ml-auto shrink-0 transition-transform ${descOpen ? 'rotate-180' : ''}`} />
          </button>
          {descOpen && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs text-slate-500">Max:</span>
                <span className="code-chip font-semibold">{assignment.maxScore} pts</span>
                {currentLang && <span className="code-chip">{currentLang.icon} {currentLang.name}</span>}
              </div>
              <div className="prose-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </div>
            </div>
          )}
        </div>

        {/* Center — Editor + Console */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1" style={{ minHeight: 0 }}>
            <Editor
              height="100%"
              // Map language name to Monaco language identifier
              language={monacoLanguageMap[currentLang?.name?.toLowerCase()] || 'plaintext'}
              value={code}
              onChange={val => setCode(val || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                tabSize: 4,
                automaticLayout: true,
                scrollbar: { verticalScrollbarSize: 6 },
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
              }}
              onMount={editor => { editorRef.current = editor }}
            />
          </div>

          {/* Console */}
          <div className={`border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 flex flex-col transition-all duration-200 ${consoleOpen ? 'h-52' : 'h-10'}`}>
            <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 shrink-0">
              <button onClick={() => setConsoleOpen(!consoleOpen)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
                <Terminal className="h-4 w-4" />
                <span className="text-xs font-medium font-mono">Console</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${consoleOpen ? '' : '-rotate-90'}`} />
              </button>

              {consoleOpen && (
                <>
                  <div className="flex gap-1 ml-2">
                    {['output', 'input'].map(t => (
                      <button key={t} onClick={() => setActiveConsoleTab(t)}
                        className={`px-3 py-0.5 rounded text-xs font-medium capitalize transition-colors ${
                          activeConsoleTab === t ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'
                        }`}>{t}</button>
                    ))}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {consoleState === 'running' && <div className="flex items-center gap-1.5 text-amber-400 text-xs"><Loader2 className="h-3 w-3 animate-spin" /><span>Running...</span></div>}
                    {consoleState === 'success' && <div className="flex items-center gap-1.5 text-emerald-400 text-xs"><CheckCircle2 className="h-3 w-3" /><span>Completed</span></div>}
                    {consoleState === 'error'   && <div className="flex items-center gap-1.5 text-rose-400 text-xs"><AlertCircle className="h-3 w-3" /><span>Error</span></div>}
                  </div>
                </>
              )}
            </div>

            {consoleOpen && (
              <div className="flex-1 overflow-auto p-4">
                {activeConsoleTab === 'output' ? (
                  <div>
                    {/* stdout from POST /submissions/run */}
                    {output && (
                      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-emerald-400 mb-2">{output}</pre>
                    )}
                    {/* stderr from POST /submissions/run */}
                    {stderr && (
                      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-rose-400">{stderr}</pre>
                    )}
                    {!output && !stderr && (
                      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-600">{CONSOLE_PLACEHOLDER}</pre>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-mono">Custom stdin (optional) — sent as POST /submissions/run stdin:</p>
                    <textarea value={customInput} onChange={e => setCustomInput(e.target.value)}
                      placeholder={"5 6\n0 1\n0 2\n..."}
                      className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-lab-500/50 resize-none" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
