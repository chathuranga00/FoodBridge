import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/client'

const AuthContext = createContext(null)

export const ROLE_DASHBOARDS = {
  ADMIN: '/dashboard/admin',
  RESTAURANT: '/dashboard/business',
  GROCERY: '/dashboard/business',
  CHARITY: '/dashboard/charity',
  ANIMAL_ORG: '/dashboard/animal-welfare',
  USER: '/dashboard/user',
}

export function getDashboardForRole(role) {
  return ROLE_DASHBOARDS[role] || '/dashboard/user'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fb_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('fb_access_token'))
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('fb_access_token')
    localStorage.removeItem('fb_refresh_token')
    localStorage.removeItem('fb_user')
    setUser(null)
    setAccessToken(null)
  }, [])

  // Listen for auto-logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => logout()
    window.addEventListener('fb:auth-logout', handleLogout)
    return () => window.removeEventListener('fb:auth-logout', handleLogout)
  }, [logout])

  // Hydrate user profile on initial load if token exists
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('fb_access_token')
      if (token) {
        try {
          const res = await authApi.getMe()
          setUser(res.data)
          localStorage.setItem('fb_user', JSON.stringify(res.data))
        } catch {
          // Token expired or invalid
          logout()
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [logout])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData } = res.data

    localStorage.setItem('fb_access_token', newAccessToken)
    if (newRefreshToken) {
      localStorage.setItem('fb_refresh_token', newRefreshToken)
    }
    localStorage.setItem('fb_user', JSON.stringify(userData))

    setUser(userData)
    setAccessToken(newAccessToken)
    return userData
  }

  const register = async (registerData) => {
    const res = await authApi.register(registerData)
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData } = res.data

    localStorage.setItem('fb_access_token', newAccessToken)
    if (newRefreshToken) {
      localStorage.setItem('fb_refresh_token', newRefreshToken)
    }
    localStorage.setItem('fb_user', JSON.stringify(userData))

    setUser(userData)
    setAccessToken(newAccessToken)
    return userData
  }

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    dashboardPath: user ? getDashboardForRole(user.role) : '/login',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
