import { useState, useRef, useEffect } from 'react'
import { Bell, Sun, Moon, User, LogOut, ChevronRight, Check, X, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Avatar, Badge } from '../ui/index.jsx'
import Modal from '../ui/Modal'
import { Input } from '../forms'
import { useToast } from '../ui/Toast'
import { userService } from '../../services'

// ─── Mock notifications (replace with real API when backend ready) ─────────────
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'submission', message: 'Aarav Patel submitted Binary Search Tree', time: '2 min ago', read: false },
  { id: 2, type: 'grade',      message: 'Your assignment was graded: 92/100',        time: '1 hr ago',  read: false },
  { id: 3, type: 'system',     message: 'Python runtime updated to 3.12.2',           time: '3 hr ago',  read: true  },
  { id: 4, type: 'submission', message: 'Sneha Gupta submitted Merge Sort',           time: 'Yesterday', read: true  },
  { id: 5, type: 'system',     message: 'New section CS401-B created',                time: '2 days ago',read: true  },
]

const NOTIF_ICON = {
  submission: '📝',
  grade:      '⭐',
  system:     '🔔',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ref, handler])
}

const ROLE_LABEL = {
  ADMIN: 'Administrator', TEACHER: 'Instructor', STUDENT: 'Student',
  Coordinator: 'Coordinator', Deen: 'Deen',
}
const ROLE_BADGE = {
  ADMIN: 'violet', TEACHER: 'amber', STUDENT: 'green',
  Coordinator: 'blue', Deen: 'rose',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Topbar({ title }) {
  const { user, logout, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate   = useNavigate()
  const toast      = useToast()

  // Dropdown states
  const [profileOpen, setProfileOpen]   = useState(false)
  const [notifOpen,   setNotifOpen]     = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  // Modals
  const [editModal,     setEditModal]     = useState(false)
  const [passwordModal, setPasswordModal] = useState(false)

  // Edit profile form
  const [editForm, setEditForm]   = useState({ name: '', email: '' })
  const [editLoading, setEditLoading] = useState(false)

  // Change password form
  const [pwForm, setPwForm]     = useState({ newPassword: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw, setShowPw]     = useState(false)

  // Refs for click-outside
  const profileRef = useRef(null)
  const notifRef   = useRef(null)
  useClickOutside(profileRef, () => setProfileOpen(false))
  useClickOutside(notifRef,   () => setNotifOpen(false))

  const unreadCount = notifications.filter(n => !n.read).length

  const openEditModal = () => {
    setEditForm({ name: user?.name ?? '', email: user?.email ?? '' })
    setProfileOpen(false)
    setEditModal(true)
  }

  const openPasswordModal = () => {
    setPwForm({ newPassword: '', confirm: '' })
    setProfileOpen(false)
    setPasswordModal(true)
  }

  // PUT /api/users/:id { name, email }
  const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.email) {
      toast('Name and email are required', 'error'); return
    }
    setEditLoading(true)
    try {
      await userService.update(user.id, { name: editForm.name, email: editForm.email })
      // Update AuthContext state + localStorage immediately — no re-login needed
      updateUser({ name: editForm.name, email: editForm.email })
      toast('Profile updated successfully!', 'success')
      setEditModal(false)
    } catch (e) {
      toast(e?.response?.data?.message || 'Update failed', 'error')
    } finally { setEditLoading(false) }
  }

  // PUT /api/users/:id/password { newPassword }
  const handlePasswordSubmit = async () => {
    if (!pwForm.newPassword) { toast('Enter a new password', 'error'); return }
    if (pwForm.newPassword !== pwForm.confirm) { toast('Passwords do not match', 'error'); return }
    if (pwForm.newPassword.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
    setPwLoading(true)
    try {
      await userService.resetPassword(user.id, { newPassword: pwForm.newPassword })
      toast('Password changed successfully', 'success')
      setPasswordModal(false)
    } catch (e) {
      toast(e?.response?.data?.message || 'Password change failed', 'error')
    } finally { setPwLoading(false) }
  }

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })))
  const markRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  const removeNotif = (id) => setNotifications(n => n.filter(x => x.id !== id))

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <>
      <header className="h-16 shrink-0 flex items-center gap-4 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 relative">

        {/* Page Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-1">

          {/* Theme Toggle */}
          <button onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            title="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* ── Notifications ── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-lab-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-lab-500/10 text-lab-600 dark:text-lab-400 text-xs font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="text-xs text-lab-500 hover:text-lab-600 font-medium transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-2xl mb-2">🔔</p>
                      <p className="text-sm text-slate-400">All caught up!</p>
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group ${!n.read ? 'bg-lab-500/3' : ''}`}>
                      <span className="text-lg shrink-0 mt-0.5">{NOTIF_ICON[n.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.read ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} title="Mark read"
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-500 transition-colors">
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button onClick={() => removeNotif(n.id)} title="Dismiss"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-lab-500 shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400 text-center">
                    {notifications.length === 0 ? 'No new notifications' : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* ── Profile Dropdown ── */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
              className={`flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl transition-all ${
                profileOpen
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>
              <Avatar name={user?.name} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">{user?.name}</p>
                <div className="mt-1">
                  <Badge variant={ROLE_BADGE[user?.role] || 'default'}>
                    {ROLE_LABEL[user?.role] || user?.role}
                  </Badge>
                </div>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 text-slate-400 transition-transform hidden md:block ${profileOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up z-50">

                {/* User card */}
                <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
                  <div className="flex items-center gap-3">
                    <Avatar name={user?.name} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5">
                        <Badge variant={ROLE_BADGE[user?.role] || 'default'}>
                          {ROLE_LABEL[user?.role] || user?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button onClick={openEditModal}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-lab-50 dark:bg-lab-900/30 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-lab-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Edit Profile</p>
                      <p className="text-xs text-slate-400">Update name & email</p>
                    </div>
                  </button>

                  <button onClick={openPasswordModal}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Change Password</p>
                      <p className="text-xs text-slate-400">Update your password</p>
                    </div>
                  </button>

                  <button onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                      {theme === 'dark'
                        ? <Sun className="h-3.5 w-3.5 text-violet-500" />
                        : <Moon className="h-3.5 w-3.5 text-violet-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
                      <p className="text-xs text-slate-400">Switch appearance</p>
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                      <LogOut className="h-3.5 w-3.5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sign Out</p>
                      <p className="text-xs text-rose-400/70">End your session</p>
                    </div>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Edit Profile Modal ── */}
      <Modal open={editModal} onClose={() => setEditModal(false)}
        title="Edit Profile"
        footer={<>
          <button onClick={() => setEditModal(false)}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleEditSubmit} disabled={editLoading}
            className="px-5 py-2 rounded-xl bg-lab-500 hover:bg-lab-600 text-white text-sm font-medium transition-colors disabled:opacity-60">
            {editLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </>}>
        <div className="space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Avatar name={editForm.name || user?.name} size="lg" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{editForm.name || user?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{editForm.email || user?.email}</p>
              <Badge variant={ROLE_BADGE[user?.role] || 'default'} className="mt-1.5">
                {ROLE_LABEL[user?.role] || user?.role}
              </Badge>
            </div>
          </div>
          <Input label="Full Name"
            value={editForm.name}
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your full name" />
          <Input label="Email Address" type="email"
            value={editForm.email}
            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
            placeholder="your@email.com" />
          <p className="text-xs text-slate-400">
            Note: Changing your email will require you to log in again with the new email.
          </p>
        </div>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal open={passwordModal} onClose={() => setPasswordModal(false)}
        title="Change Password"
        footer={<>
          <button onClick={() => setPasswordModal(false)}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handlePasswordSubmit} disabled={pwLoading}
            className="px-5 py-2 rounded-xl bg-lab-500 hover:bg-lab-600 text-white text-sm font-medium transition-colors disabled:opacity-60">
            {pwLoading ? 'Updating…' : 'Update Password'}
          </button>
        </>}>
        <div className="space-y-4">
          <div className="relative">
            <Input label="New Password" type={showPw ? 'text' : 'password'}
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Min. 6 characters" />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600 transition-colors text-xs">
              {showPw ? 'hide' : 'show'}
            </button>
          </div>
          <Input label="Confirm New Password" type={showPw ? 'text' : 'password'}
            value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="Re-enter new password" />
          {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
            <p className="text-xs text-rose-500">Passwords do not match</p>
          )}
          {pwForm.confirm && pwForm.newPassword === pwForm.confirm && pwForm.confirm.length > 0 && (
            <p className="text-xs text-emerald-500">✓ Passwords match</p>
          )}
        </div>
      </Modal>
    </>
  )
}
