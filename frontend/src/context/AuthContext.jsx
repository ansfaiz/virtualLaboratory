import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, languageService } from '../services'
import { setLanguageCatalog } from '../utils/dataHelpers'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: rehydrate session from localStorage.
  useEffect(() => {
    const stored = localStorage.getItem('vlab_user')
    const token  = localStorage.getItem('vlab_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) }
      catch { localStorage.removeItem('vlab_user'); localStorage.removeItem('vlab_token') }
    }
    setLoading(false)
  }, [])

  // Once a user session is active, seed the live language catalog so
  // getLanguageName() uses real backend IDs (no-op in DEMO_MODE — mock catalog is used).
  useEffect(() => {
    if (!user) return
    languageService.getAll()
      .then(r => setLanguageCatalog(r.data ?? r))
      .catch(() => { /* non-fatal — falls back to mock catalog */ })
  }, [user?.id])

  // POST /auth/login → { user: UserDTO, token }
  const login = useCallback(async (credentials) => {
    const { user, token } = await authService.login(credentials)
    localStorage.setItem('vlab_token', token)
    localStorage.setItem('vlab_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  // POST /auth/logout → 204
  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* ignore */ }
    localStorage.removeItem('vlab_token')
    localStorage.removeItem('vlab_user')
    setUser(null)
  }, [])

  // Update user in state + localStorage (called after profile edits)
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('vlab_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = { user, loading, login, logout, updateUser, isAuthenticated: !!user }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
