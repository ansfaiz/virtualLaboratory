import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useLocalStorage } from '../../hooks'

// Map routes to human-readable page titles
const titleMap = {
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/batches': 'Batch Management',
  '/admin/sections': 'Section Management',
  '/admin/languages': 'Programming Languages',
  '/teacher': 'Dashboard',
  '/teacher/assignments': 'Assignments',
  '/teacher/assignments/new': 'Create Assignment',
  '/teacher/submissions': 'Submissions',
  '/teacher/performance': 'Student Performance',
  '/student': 'Dashboard',
  '/student/assignments': 'Assignments',
  '/student/submissions': 'My Submissions',
  '/student/results': 'Results',
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useLocalStorage('vlab_sidebar', false)
  const location = useLocation()
  const title = titleMap[location.pathname] || 'Virtual Laboratory'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
          <div className="p-6 max-w-screen-2xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
