import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, FlaskConical,
  Code2, BarChart3, Settings, LogOut, ChevronRight,
  Layers, GraduationCap, FileCode, Trophy, BookMarked, UsersRound
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/index.jsx'
import { cn } from '../../utils'

const navConfig = {
  ADMIN: [
    { section: 'Overview', items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { section: 'Management', items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/batches', label: 'Batches', icon: Layers },
      { to: '/admin/sections', label: 'Sections', icon: UsersRound },
      { to: '/admin/languages', label: 'Languages', icon: Code2 },
    ]},
  ],
  TEACHER: [
    { section: 'Overview', items: [
      { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { section: 'Teaching', items: [
      { to: '/teacher/assignments', label: 'Assignments', icon: BookOpen },
      { to: '/teacher/submissions', label: 'Submissions', icon: ClipboardList },
      { to: '/teacher/performance', label: 'Performance', icon: BarChart3 },
    ]},
  ],
  STUDENT: [
    { section: 'Overview', items: [
      { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { section: 'Lab Work', items: [
      { to: '/student/assignments', label: 'Assignments', icon: BookMarked },
      { to: '/student/submissions', label: 'My Submissions', icon: FileCode },
      { to: '/student/results', label: 'Results', icon: Trophy },
    ]},
  ],
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const rawRole = user?.role || 'STUDENT'
  // Coordinator and Deen use admin nav
  const role = ['Coordinator', 'Deen'].includes(rawRole) ? 'ADMIN' : rawRole
  const nav = navConfig[role] || []

  return (
    <aside className={cn(
      'h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shrink-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-lab-500 to-lab-700 rounded-lg flex items-center justify-center shrink-0 shadow-glow-blue">
          <FlaskConical className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Virtual</p>
            <p className="text-xs font-medium text-lab-500 leading-none mt-0.5 font-mono">Laboratory</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {nav.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 mb-1.5">{section}</p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === `/${role.toLowerCase()}`}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-lab-500/10 dark:bg-lab-500/15 text-lab-600 dark:text-lab-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0 h-[18px] w-[18px]" />
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
