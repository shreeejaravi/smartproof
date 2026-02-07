"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { User, UserRole } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || "Request failed")
  return data as T
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api<{ user: User | null }>("/api/auth/me")
      .then((data) => {
        if (mounted) setUser(data.user)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      setUser(data)
      return true
    } catch {
      return false
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const data = await api<User>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      })
      setUser(data)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
