import axios from 'axios'

// Requests go to /api which Vite proxies to http://localhost:8080/api
// This avoids CORS — browser sees same-origin requests only
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vlab_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Endpoints that are Permit All — a 401 here should NOT trigger a session
// logout redirect (e.g. wrong password on login, or unauthenticated signup)
// Per API spec: /api/users/**, POST /api/auth/login, POST /api/auth/logout
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/logout',
  '/users',           // all /api/users/** are permit all per SecurityConfig
]

// Response interceptor — redirect to /login on 401 for protected routes only
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url              = error.config?.url ?? ''
    const isPublic         = PUBLIC_PATHS.some(p => url.includes(p))

    if (error.response?.status === 401 && !isPublic) {
      localStorage.removeItem('vlab_token')
      localStorage.removeItem('vlab_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
