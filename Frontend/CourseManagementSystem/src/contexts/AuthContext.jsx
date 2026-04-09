import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

import { configureApiAuth } from '../services/api'
import { loginUser, logoutUser, registerUser } from '../services/auth'
import { AuthContext } from './authContextObject'

const AUTH_STORAGE_KEY = 'cms_auth'

const readPersistedAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const persistAuth = (authState) => {
  if (!authState?.access || !authState?.refresh || !authState?.user) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readPersistedAuth())
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const setSession = useCallback(({ access, refresh, user }) => {
    const next = { access, refresh, user }
    setAuthState(next)
    persistAuth(next)
  }, [])

  const clearSession = useCallback(() => {
    setAuthState(null)
    persistAuth(null)
  }, [])

  useEffect(() => {
    configureApiAuth({
      getTokens: () => ({
        access: authState?.access || null,
        refresh: authState?.refresh || null,
      }),
      onTokensUpdate: ({ access, refresh }) => {
        setAuthState((prev) => {
          if (!prev) {
            return prev
          }
          const next = {
            ...prev,
            access,
            refresh,
          }
          persistAuth(next)
          return next
        })
      },
      onLogout: clearSession,
    })
  }, [authState?.access, authState?.refresh, clearSession])

  useEffect(() => {
    setIsBootstrapping(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials)
    setSession({
      access: data.access,
      refresh: data.refresh,
      user: data.user,
    })
    return data.user
  }, [setSession])

  const register = useCallback(async (payload) => {
    const data = await registerUser(payload)
    return data
  }, [])

  const logout = useCallback(async () => {
    const refresh = authState?.refresh
    try {
      if (refresh) {
        await logoutUser(refresh)
      }
    } catch {
      toast.error('Session ended locally. Server logout failed.')
    } finally {
      clearSession()
    }
  }, [authState?.refresh, clearSession])

  const value = useMemo(
    () => ({
      user: authState?.user || null,
      accessToken: authState?.access || null,
      refreshToken: authState?.refresh || null,
      isAuthenticated: Boolean(authState?.access),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [authState, isBootstrapping, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
