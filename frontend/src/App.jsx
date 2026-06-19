import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import ErrorBoundary from './components/layout/ErrorBoundary'
import NotFoundPage from './pages/NotFoundPage'

// Auth
import LoginPage  from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagementPage from './pages/admin/UserManagementPage'
import { BatchesPage, SectionsPage } from './pages/admin/BatchSectionPages'
import LanguagesPage from './pages/admin/LanguagesPage'

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import AssignmentsListPage from './pages/teacher/AssignmentsListPage'
import CreateAssignmentPage from './pages/teacher/CreateAssignmentPage'
import SubmissionsPage from './pages/teacher/SubmissionsPage'
import PerformancePage from './pages/teacher/PerformancePage'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import StudentAssignmentsPage from './pages/student/AssignmentsPage'
import CodingEnvironmentPage from './pages/student/CodingEnvironmentPage'
import StudentSubmissionsPage from './pages/student/SubmissionsPage'
import ResultsPage from './pages/student/ResultsPage'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public */}
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* ─── Admin ─────────────────────────────────────────────────── */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ErrorBoundary>
                    <AppShell />
                  </ErrorBoundary>
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users"     element={<UserManagementPage />} />
                <Route path="batches"   element={<BatchesPage />} />
                <Route path="sections"  element={<SectionsPage />} />
                <Route path="languages" element={<LanguagesPage />} />
              </Route>

              {/* ─── Teacher ───────────────────────────────────────────────── */}
              <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <ErrorBoundary>
                    <AppShell />
                  </ErrorBoundary>
                </ProtectedRoute>
              }>
                <Route index element={<TeacherDashboard />} />
                <Route path="assignments"          element={<AssignmentsListPage />} />
                <Route path="assignments/new"      element={<CreateAssignmentPage />} />
                <Route path="assignments/:id/edit" element={<CreateAssignmentPage />} />
                <Route path="submissions"          element={<SubmissionsPage />} />
                <Route path="performance"          element={<PerformancePage />} />
              </Route>

              {/* ─── Student ───────────────────────────────────────────────── */}
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                  <ErrorBoundary>
                    <AppShell />
                  </ErrorBoundary>
                </ProtectedRoute>
              }>
                <Route index element={<StudentDashboard />} />
                <Route path="assignments"          element={<StudentAssignmentsPage />} />
                <Route path="assignments/:id"      element={<StudentAssignmentsPage />} />
                <Route path="assignments/:id/code" element={<CodingEnvironmentPage />} />
                <Route path="submissions"          element={<StudentSubmissionsPage />} />
                <Route path="results"              element={<ResultsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
