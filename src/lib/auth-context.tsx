import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface AuthUser {
  name: string
  email: string
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  ready: boolean
  dummyUser: AuthUser & { password: string }
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AUTH_SESSION_KEY = 'franchise-crm-auth-session'
const AUTH_USERS_KEY = 'franchise-crm-auth-users'
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '')

export const DUMMY_AUTH_USER = {
  name: 'Demo Admin',
  email: 'demo@franchisecrm.local',
  password: 'demo123',
  role: 'Admin',
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUsers() {
  const stored = window.localStorage.getItem(AUTH_USERS_KEY)
  const users = stored ? (JSON.parse(stored) as typeof DUMMY_AUTH_USER[]) : []
  const hasDummyUser = users.some((user) => user.email.toLowerCase() === DUMMY_AUTH_USER.email)
  return hasDummyUser ? users : [DUMMY_AUTH_USER, ...users]
}

function saveStoredUsers(users: typeof DUMMY_AUTH_USER[]) {
  window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

function publicUser(user: { name: string; email: string; role: string }) {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

async function fetchJson(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const response = await fetch(url, { credentials: 'include', ...options })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error || payload?.message || 'Auth API error')
  return payload
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    saveStoredUsers(readStoredUsers())

    const storedSession = window.localStorage.getItem(AUTH_SESSION_KEY)
    if (storedSession) {
      setUser(JSON.parse(storedSession) as AuthUser)
    }

    fetchJson('/api/method/franchise_crm.api.auth_api.get_current_user')
      .then((payload) => {
        if (payload.is_authenticated && payload.user) {
          const sessionUser = publicUser({
            name: payload.user.full_name || payload.user.email,
            email: payload.user.email,
            role: payload.user.user_type || 'User',
          })
          window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser))
          setUser(sessionUser)
        } else {
          window.localStorage.removeItem(AUTH_SESSION_KEY)
          setUser(null)
        }
      })
      .catch(() => {
        window.localStorage.removeItem(AUTH_SESSION_KEY)
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    dummyUser: DUMMY_AUTH_USER,
    signIn: async (email, password) => {
      const payload = await fetchJson('/api/method/franchise_crm.api.auth_api.login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const sessionUser = publicUser({
        name: payload.user?.name || payload.user?.email,
        email: payload.user?.email,
        role: payload.user?.role || 'User',
      })
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser))
      setUser(sessionUser)
    },
    signUp: async (name, email, password) => {
      const payload = await fetchJson('/api/method/franchise_crm.api.auth_api.signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const sessionUser = publicUser({
        name: payload.user?.name || payload.user?.email,
        email: payload.user?.email,
        role: payload.user?.role || 'User',
      })
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser))
      setUser(sessionUser)
    },
    signOut: async () => {
      await fetchJson('/api/method/franchise_crm.api.auth_api.logout', {
        method: 'POST',
      }).catch(() => {})
      window.localStorage.removeItem(AUTH_SESSION_KEY)
      setUser(null)
    },
  }), [user, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
