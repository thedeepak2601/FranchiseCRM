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
const AUTH_TOKEN_KEY = 'franchise-crm-auth-token'
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
  const users = stored ? (JSON.parse(stored) as Array<typeof DUMMY_AUTH_USER>) : []
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

function findStoredUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  return readStoredUsers().find(
    (storedUser) => storedUser.email.toLowerCase() === normalizedEmail && storedUser.password === password
  )
}

function saveSession(user: AuthUser, token?: string) {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user))
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

function clearSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY)
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}

async function fetchJson(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY)
  const headers = new Headers(options.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, { credentials: 'include', ...options, headers })
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
        if ((payload.is_authenticated || payload.user) && payload.user) {
          const sessionUser = publicUser({
            name: payload.user.full_name || payload.user.name || payload.user.email,
            email: payload.user.email,
            role: payload.user.user_type || payload.user.role || 'User',
          })
          saveSession(sessionUser)
          setUser(sessionUser)
        } else {
          clearSession()
          setUser(null)
        }
      })
      .catch(() => {
        if (!storedSession) {
          clearSession()
          setUser(null)
        }
      })
      .finally(() => setReady(true))
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    dummyUser: DUMMY_AUTH_USER,
    signIn: async (email, password) => {
      const storedUser = findStoredUser(email, password)
      if (storedUser) {
        const sessionUser = publicUser(storedUser)
        saveSession(sessionUser)
        setUser(sessionUser)
        return
      }

      let sessionUser: AuthUser | null = null
      let token: string | undefined

      try {
        const payload = await fetchJson('/api/method/franchise_crm.api.auth_api.login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        sessionUser = publicUser({
          name: payload.user?.name || payload.user?.email,
          email: payload.user?.email,
          role: payload.user?.role || 'User',
        })
        token = payload.token
      } catch {
        throw new Error('Invalid email or password.')
      }

      saveSession(sessionUser, token)
      setUser(sessionUser)
    },
    signUp: async (name, email, password) => {
      let sessionUser: AuthUser | null = null
      let token: string | undefined

      try {
        const payload = await fetchJson('/api/method/franchise_crm.api.auth_api.signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        })

        sessionUser = publicUser({
          name: payload.user?.name || payload.user?.email,
          email: payload.user?.email,
          role: payload.user?.role || 'User',
        })
        token = payload.token
      } catch {
        const normalizedEmail = email.trim().toLowerCase()
        const storedUsers = readStoredUsers()
        if (storedUsers.some((storedUser) => storedUser.email.toLowerCase() === normalizedEmail)) {
          throw new Error('An account with this email already exists.')
        }

        const newUser = {
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: 'Admin',
        }
        saveStoredUsers([...storedUsers, newUser])
        sessionUser = publicUser(newUser)
      }

      saveSession(sessionUser, token)
      setUser(sessionUser)
    },
    signOut: async () => {
      await fetchJson('/api/method/franchise_crm.api.auth_api.logout', {
        method: 'POST',
      }).catch(() => {})
      clearSession()
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
