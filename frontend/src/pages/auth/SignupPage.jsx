import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FlaskConical, Eye, EyeOff, Lock, Mail, User,
  ArrowRight, CheckCircle2, ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../services/apiClient'

// POST /users { name, email, password, role, batchId? } → UserDTO
// Then auto-login via POST /auth/login

// Valid role values per backend: ADMIN | STUDENT | TEACHER | Deen | Coordinator
const ROLE_OPTIONS = [
  {
    value: 'STUDENT',
    label: 'Student',
    description: 'Code & submit assignments',
    dot: 'bg-emerald-400',
    bg: 'hover:bg-emerald-500/8',
    border: 'hover:border-emerald-500/40',
  },
  {
    value: 'TEACHER',
    label: 'Teacher',
    description: 'Create & grade assignments',
    dot: 'bg-amber-400',
    bg: 'hover:bg-amber-500/8',
    border: 'hover:border-amber-500/40',
  },
  {
    value: 'Coordinator',
    label: 'Coordinator',
    description: 'Manage sections & students',
    dot: 'bg-lab-400',
    bg: 'hover:bg-lab-500/8',
    border: 'hover:border-lab-500/40',
  },
  {
    value: 'Deen',
    label: 'Deen',
    description: 'Academic administration',
    dot: 'bg-violet-400',
    bg: 'hover:bg-violet-500/8',
    border: 'hover:border-violet-500/40',
  },
]

const ROLE_ROUTES = {
  ADMIN:       '/admin',
  TEACHER:     '/teacher',
  STUDENT:     '/student',
  Coordinator: '/admin',   // redirect coordinators to admin dashboard
  Deen:        '/admin',   // redirect deen to admin dashboard
}

const FEATURES = [
  { icon: '🚀', label: 'Start in seconds',    sub: 'No setup required' },
  { icon: '💡', label: 'AI-powered hints',    sub: 'Learn as you code' },
  { icon: '📈', label: 'Track your progress', sub: 'Scores, streaks & ranks' },
]

// Password strength helper
function getStrength(pw) {
  let score = 0
  if (pw.length >= 8)              score++
  if (/[A-Z]/.test(pw))           score++
  if (/[0-9]/.test(pw))           score++
  if (/[^A-Za-z0-9]/.test(pw))   score++
  return score   // 0–4
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', 'bg-rose-500', 'bg-amber-500', 'bg-lab-500', 'bg-emerald-500']
const STRENGTH_TEXT  = ['', 'text-rose-400', 'text-amber-400', 'text-lab-400', 'text-emerald-400']

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Clear any stale session on mount so signup goes out without a token
  useEffect(() => {
    localStorage.removeItem('vlab_token')
    localStorage.removeItem('vlab_user')
  }, [])

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', role: 'STUDENT', batchId: '',
  })
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm,  setShowConfirm]    = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState(false)

  const strength = getStrength(form.password)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    if (!form.name.trim())               return 'Full name is required'
    if (!form.email.trim())              return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address'
    if (form.password.length < 6)        return 'Password must be at least 6 characters'
    if (form.password !== form.confirm)  return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) { setError(msg); return }

    setLoading(true)
    try {
      // Step 1: POST /users — create the account
      const payload = {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
        ...(form.role === 'STUDENT' && form.batchId && { batchId: Number(form.batchId) }),
      }
      await apiClient.post('/users', payload)

      // Step 2: Brief success flash
      setSuccess(true)
      await new Promise(r => setTimeout(r, 600))

      // Step 3: POST /auth/login — sign in with the same credentials
      let user
      try {
        user = await login({ email: form.email.trim(), password: form.password })
      } catch (loginErr) {
        // Account was created but auto-login failed — redirect to login page
        // so user can sign in manually (handles cases like admin-approval workflows)
        navigate('/login?registered=1')
        return
      }

      navigate(ROLE_ROUTES[user.role] || '/student')
    } catch (err) {
      setSuccess(false)
      const status = err?.response?.status
      // Debug: log full error so we can see exactly what the backend returns
      console.error('[Signup Error]', {
        status,
        data:    err?.response?.data,
        message: err?.message,
        url:     err?.config?.url,
      })
      setError(
        status === 401 || status === 403
          ? `Registration blocked (${status}). Check browser console for details.`
          : status === 409
            ? 'An account with this email already exists.'
            : err?.response?.data?.message ||
              err?.response?.data?.error   ||
              `Error ${status ?? 'unknown'}: ${err?.message ?? 'Something went wrong.'}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080d18] flex overflow-hidden">

      {/* ── Left branding panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080d18] via-[#0a1428] to-[#080d18]" />
        <div className="absolute inset-0 bg-grid-slate opacity-30" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-lab-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-lab-500/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lab-500/40 to-transparent" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-lab-500/30 rounded-xl blur-md" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-lab-400 to-lab-600 rounded-xl flex items-center justify-center shadow-glow-blue">
                <FlaskConical className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">Virtual Laboratory</p>
              <p className="text-lab-400 text-[11px] font-mono mt-0.5 tracking-widest uppercase">University Platform</p>
            </div>
          </div>

          {/* Hero copy */}
          <div className="mt-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lab-500/10 border border-lab-500/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lab-400 animate-pulse-soft" />
              <span className="text-xs font-medium text-lab-400 tracking-wide">Free to join — no credit card</span>
            </div>

            <h2 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
              Join thousands<br />
              of coders.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lab-300 to-lab-500">
                Start today.
              </span>
            </h2>

            <p className="text-slate-400 text-[15px] leading-relaxed mt-5 max-w-sm">
              Create your account and get instant access to a full coding environment, assignments, and feedback.
            </p>

            <div className="mt-10 space-y-3">
              {FEATURES.map(f => (
                <div key={f.label} className="flex items-center gap-3.5 group">
                  <div className="w-9 h-9 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center text-base shrink-0 group-hover:bg-lab-500/10 group-hover:border-lab-500/20 transition-colors">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{f.label}</p>
                    <p className="text-xs text-slate-500">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-6 border-t border-white/6">
            {[{ value: '12k+', label: 'Students' }, { value: '340+', label: 'Assignments' }, { value: '98%', label: 'Uptime' }].map(s => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white font-mono">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080d18] via-[#090e1a] to-[#080d18]" />
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/6 to-transparent" />

        <div className="relative w-full max-w-[400px] animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-lab-400 to-lab-600 rounded-lg flex items-center justify-center">
              <FlaskConical className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Virtual Laboratory</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[1.65rem] font-bold text-white tracking-tight leading-snug">
              Create account
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Fill in the details below to get started
            </p>
          </div>

          {/* ── Role selector ── */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em] mb-2.5">
              I am joining as
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('role', r.value)}
                  className={[
                    'relative flex flex-col items-start px-3 py-2.5 rounded-xl text-left',
                    'border transition-all duration-200 overflow-hidden',
                    form.role === r.value
                      ? 'border-lab-500/50 bg-lab-500/8'
                      : `border-white/6 bg-white/3 ${r.bg} ${r.border}`,
                  ].join(' ')}
                >
                  {form.role === r.value && (
                    <CheckCircle2 className="absolute top-2 right-2 h-3 w-3 text-lab-400" />
                  )}
                  <span className={`w-1.5 h-1.5 rounded-full mb-2 ${r.dot}`} />
                  <span className="text-xs font-semibold text-slate-200 leading-none">{r.label}</span>
                  <span className="text-[10px] text-slate-600 mt-1 leading-tight">{r.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-[11px] text-slate-600 font-medium">account details</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/20 animate-slide-up">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <p className="text-sm text-rose-400 leading-snug">{error}</p>
              </div>
            )}

            {/* Success flash */}
            {success && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 animate-slide-up">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-400">Account created! Signing you in…</p>
              </div>
            )}

            {/* Full name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Full name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-lab-400 transition-colors duration-150" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="John Doe"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-lab-400 transition-colors duration-150" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@university.edu"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-lab-400 transition-colors duration-150" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`${INPUT_CLS} pr-11`}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/6 transition-all duration-150">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength ? STRENGTH_COLOR[strength] : 'bg-white/8'
                        }`}
                      />
                    ))}
                  </div>
                  {strength > 0 && (
                    <p className={`text-[11px] font-medium ${STRENGTH_TEXT[strength]}`}>
                      {STRENGTH_LABEL[strength]} password
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Confirm password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-lab-400 transition-colors duration-150" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  placeholder="Re-enter password"
                  className={[
                    INPUT_CLS,
                    'pr-11',
                    form.confirm && form.confirm !== form.password
                      ? 'border-rose-500/40 focus:border-rose-500/60'
                      : form.confirm && form.confirm === form.password
                        ? 'border-emerald-500/40 focus:border-emerald-500/60'
                        : '',
                  ].join(' ')}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/6 transition-all duration-150">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {/* Live match indicator */}
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Batch ID — only for students */}
            {form.role === 'STUDENT' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  Batch ID <span className="text-slate-700 normal-case font-normal">(optional — ask your instructor)</span>
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={form.batchId}
                    onChange={e => set('batchId', e.target.value)}
                    placeholder="e.g. 1"
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || success}
                className={[
                  'relative w-full flex items-center justify-center gap-2.5',
                  'px-5 py-3 rounded-xl text-sm font-semibold',
                  'bg-gradient-to-r from-lab-500 to-lab-600 text-white overflow-hidden',
                  'shadow-[0_0_24px_-4px_rgba(14,118,253,0.5)]',
                  'hover:shadow-[0_0_32px_-2px_rgba(14,118,253,0.65)]',
                  'hover:from-lab-400 hover:to-lab-500',
                  'active:scale-[0.98] transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-lab-500/40',
                  'disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100',
                ].join(' ')}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/6 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <span>Create my account</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login"
              className="text-lab-400 hover:text-lab-300 font-medium transition-colors duration-150 inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Sign in
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px] text-slate-700 leading-relaxed">
            Virtual Laboratory &copy; {new Date().getFullYear()}
            <span className="mx-1.5 text-slate-800">·</span>
            Secure academic platform
          </p>

        </div>
      </div>

    </div>
  )
}

// Shared input class
const INPUT_CLS = [
  'w-full pl-10 pr-4 py-3 rounded-xl text-sm',
  'bg-white/4 border border-white/8',
  'text-slate-100 placeholder-slate-600',
  'transition-all duration-150',
  'focus:outline-none focus:bg-white/6 focus:border-lab-500/60',
  'focus:ring-2 focus:ring-lab-500/15',
  'hover:border-white/14 hover:bg-white/5',
].join(' ')
