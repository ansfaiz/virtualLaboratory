import { Link } from 'react-router-dom'
import { FlaskConical, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_HOME = {
  ADMIN:       '/admin',
  TEACHER:     '/teacher',
  STUDENT:     '/student',
  Coordinator: '/admin',
  Deen:        '/admin',
}

export default function NotFoundPage() {
  const { user } = useAuth()
  const homeRoute = user ? (ROLE_HOME[user.role] ?? '/') : '/'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-lab-400 to-lab-600 rounded-xl flex items-center justify-center shadow-glow-blue">
            <FlaskConical className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-slate-700 dark:text-slate-300 font-bold">Virtual Laboratory</span>
        </div>

        {/* 404 Display */}
        <div className="relative mb-8">
          <p className="text-[8rem] font-black text-slate-100 dark:text-slate-900 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">🧪</div>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Experiment not found</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Check the URL and try again.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={homeRoute}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-lab-500 hover:bg-lab-600 text-white text-sm font-semibold transition-colors shadow-[0_0_20px_-4px_rgba(14,118,253,0.4)]"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-slate-400">
          Virtual Laboratory © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
