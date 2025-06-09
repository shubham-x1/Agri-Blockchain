"use client"
import React, { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { API_ENDPOINTS, apiRequest } from "../config/api"

interface User {
  id: string
  name: string
  email: string
  role: 'farmer' | 'trader' | 'transporter'
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (email: string, password: string, role: 'farmer' | 'trader' | 'transporter') => Promise<void>
  register: (name: string, email: string, password: string, role: 'farmer' | 'trader' | 'transporter') => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("auth_user")

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }

      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, role: 'farmer' | 'trader' | 'transporter') => {
    try {
      const endpoint = role === 'farmer'
        ? API_ENDPOINTS.FARMER.LOGIN
        : role === 'trader'
          ? API_ENDPOINTS.TRADER.LOGIN
          : API_ENDPOINTS.TRANSPORTER.LOGIN

      const data = await apiRequest(endpoint, 'POST', { email, password } as any)

      const safeToken: string | null = data.token ?? null
      const safeUser: User = {
        id: data.user?.id ?? '',
        name: data.user?.name ?? '',
        email: data.user?.email ?? '',
        role,
      }

      setToken(safeToken)
      setUser(safeUser)
      setIsAuthenticated(true)

      if (safeToken) {
        localStorage.setItem("auth_token", safeToken)
      }
      localStorage.setItem("auth_user", JSON.stringify(safeUser))
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, role: 'farmer' | 'trader' | 'transporter') => {
    try {
      const endpoint = role === 'farmer'
        ? API_ENDPOINTS.FARMER.REGISTER
        : role === 'trader'
          ? API_ENDPOINTS.TRADER.REGISTER
          : API_ENDPOINTS.TRANSPORTER.REGISTER

      const data = await apiRequest(endpoint, 'POST', { name, email, password } as any)

      const safeToken: string | null = data.token ?? null
      const safeUser: User = {
        id: data.user?.id ?? '',
        name: data.user?.name ?? '',
        email: data.user?.email ?? '',
        role,
      }

      setToken(safeToken)
      setUser(safeUser)
      setIsAuthenticated(true)

      if (safeToken) {
        localStorage.setItem("auth_token", safeToken)
      }
      localStorage.setItem("auth_user", JSON.stringify(safeUser))
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
