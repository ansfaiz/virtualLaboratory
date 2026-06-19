import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { FlaskConical, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_ROUTES = {
  ADMIN:       '/admin',
  TEACHER:     '/teacher',
  STUDENT:     '/student',
  Coordinator: '/admin',
  Deen:        '/admin',
}

const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    role: 'ADMIN',
    email: 'admin@vlab.edu',
    password: 'Admin@123',
    color: 'from-violet-500 to-violet-600',
    bg: 'hover:bg-violet-500/8',
    border: 'hover:border-violet-500/40',
    dot: 'bg-violet-400',
    description: 'Manage users & platform',
  },
  {
    label: 'Teacher',
    role: 'TEACHER',
    email: 'priya@cs.edu',
    password: 'Teacher@123',
    color: 'from-amber-500 to-amber-600',
    bg: 'hover:bg-amber-500/8',
    border: 'hover:border-amber-500/40',
    dot: 'bg-amber-400',
    description: 'Create & grade assignments',
  },
  {
    label: 'Student',
    role: 'STUDENT',
    email: 'student@vlab.edu',
    password: 'Student@123',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'hover:bg-emerald-500/8',
    border: 'hover:border-emerald-500/40',
    dot: 'bg-emerald-400',
    description: 'Code & submit solutions',
  },
]

const FEATURES = [
  { icon: '⚡', label: 'Real-time execution', sub: '8+ programming languages' },
  { icon: '📊', label: 'Analytics dashboard', sub: 'Live student performance' },
  { icon: '🔒', label: 'Secure sandboxes',    sub: 'Isolated code environments' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]               = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [activeDemo, setActiveDemo]   = useState(null)
  const [registered, setRegistered]  = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (new URLSearchParams(location.search).get('registered') === '1') {
      setRegistered(true)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form)
      navigate(ROLE_ROUTES[user.role] || '/student')
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc) => {
    setForm({ email: acc.email, password: acc.password })
    setActiveDemo(acc.role)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#080d18] flex overflow-hidden">

      {/* ── Left branding panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden p-14">

        {/* Layered backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080d18] via-[#0a1428] to-[#080d18]" />
        <div className="absolute inset-0 bg-grid-slate opacity-30" />

        {/* Blue glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-lab-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-lab-500/8 rounded-full blur-[80px] pointer-events-none" />

        {/* Top edge accent line */}
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
              <span className="text-xs font-medium text-lab-400 tracking-wide">Now with AI-powered hints</span>
            </div>

            <h2 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight">
              Code smarter.<br />
              Learn faster.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lab-300 to-lab-500">
                Ship better.
              </span>
            </h2>

            <p className="text-slate-400 text-[15px] leading-relaxed mt-5 max-w-sm">
              The online coding lab trusted by universities — where students write, run, and submit real code.
            </p>

            {/* Feature pills */}
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

          {/* Bottom stat bar */}
          <div className="flex items-center gap-6 pt-6 border-t border-white/6">
            {[
              { value: '12k+', label: 'Students' },
              { value: '340+', label: 'Assignments' },
              { value: '98%',  label: 'Uptime' },
            ].map(s => (
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

        {/* Subtle right panel background */}
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
          <div className="mb-8">
            <h1 className="text-[1.65rem] font-bold text-white tracking-tight leading-snug">
              Sign in
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Access your dashboard and coding environment
            </p>
          </div>

          {/* ── Demo account selector ── */}
          <div className="mb-7">
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-[0.08em] mb-2.5">
              Quick access — demo accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={[
                    'relative flex flex-col items-start px-3 py-2.5 rounded-xl text-left',
                    'border transition-all duration-200 group overflow-hidden',
                    activeDemo === acc.role
                      ? 'border-lab-500/50 bg-lab-500/8'
                      : `border-white/6 bg-white/3 ${acc.bg} ${acc.border}`,
                  ].join(' ')}
                >
                  {/* Active checkmark */}
                  {activeDemo === acc.role && (
                    <CheckCircle2 className="absolute top-2 right-2 h-3 w-3 text-lab-400" />
                  )}

                  <span className={`w-1.5 h-1.5 rounded-full mb-2 ${acc.dot}`} />
                  <span className="text-xs font-semibold text-slate-200 leading-none">{acc.label}</span>
                  <span className="text-[10px] text-slate-600 mt-1 leading-tight">{acc.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-[11px] text-slate-600 font-medium">or enter credentials</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Registration success banner */}
            {registered && !error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 animate-slide-up">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-400 leading-snug">Account created! Sign in below to continue.</p>
              </div>
            )}

          {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/20 animate-slide-up">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <p className="text-sm text-rose-400 leading-snug">{error}</p>
              </div>
            )}

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
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@university.edu"
                  className={[
                    'w-full pl-10 pr-4 py-3 rounded-xl text-sm',
                    'bg-white/4 border border-white/8',
                    'text-slate-100 placeholder-slate-600',
                    'transition-all duration-150',
                    'focus:outline-none focus:bg-white/6 focus:border-lab-500/60',
                    'focus:ring-2 focus:ring-lab-500/15',
                    'hover:border-white/14 hover:bg-white/5',
                  ].join(' ')}
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
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className={[
                    'w-full pl-10 pr-11 py-3 rounded-xl text-sm',
                    'bg-white/4 border border-white/8',
                    'text-slate-100 placeholder-slate-600',
                    'transition-all duration-150',
                    'focus:outline-none focus:bg-white/6 focus:border-lab-500/60',
                    'focus:ring-2 focus:ring-lab-500/15',
                    'hover:border-white/14 hover:bg-white/5',
                  ].join(' ')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/6 transition-all duration-150"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className={[
                  'relative w-full flex items-center justify-center gap-2.5',
                  'px-5 py-3 rounded-xl text-sm font-semibold',
                  'bg-gradient-to-r from-lab-500 to-lab-600',
                  'text-white overflow-hidden',
                  'shadow-[0_0_24px_-4px_rgba(14,118,253,0.5)]',
                  'hover:shadow-[0_0_32px_-2px_rgba(14,118,253,0.65)]',
                  'hover:from-lab-400 hover:to-lab-500',
                  'active:scale-[0.98]',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-lab-500/40',
                  'disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100',
                ].join(' ')}
              >
                {/* Button shimmer on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/6 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />

                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to your account</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup"
              className="text-lab-400 hover:text-lab-300 font-medium transition-colors duration-150 inline-flex items-center gap-1">
              Create one
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-8 text-center text-[11px] text-slate-700 leading-relaxed">
            Virtual Laboratory &copy; {new Date().getFullYear()}
            <span className="mx-1.5 text-slate-800">·</span>
            Secure academic platform
          </p>

        </div>
      </div>

    </div>
  )
}
