import { Component } from 'react'
import { FlaskConical, RefreshCw, AlertTriangle } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="w-full max-w-md text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              An unexpected error occurred in this part of the app. Your other pages should still work fine.
            </p>

            {/* Error details (dev mode) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 text-left p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-auto max-h-32">
                <p className="text-xs font-mono text-rose-400">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-lab-500 hover:bg-lab-600 text-white text-sm font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <FlaskConical className="h-4 w-4" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
