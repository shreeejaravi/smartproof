"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { ClassroomConfig } from "@/lib/types"

interface ClassroomStoreType {
  classrooms: ClassroomConfig[]
  isLoading: boolean
  addClassroom: (classroom: ClassroomConfig) => void
  removeClassroom: (id: string) => void
  getClassroom: (id: string) => ClassroomConfig | undefined
}

const ClassroomStoreContext = createContext<ClassroomStoreType | null>(null)

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || "Request failed")
  return data as T
}

export function ClassroomStoreProvider({ children }: { children: React.ReactNode }) {
  const [classrooms, setClassrooms] = useState<ClassroomConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api<{ classrooms: ClassroomConfig[] }>("/api/classrooms")
      .then((data) => {
        if (mounted) setClassrooms(data.classrooms)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const addClassroom = useCallback((classroom: ClassroomConfig) => {
    setClassrooms((prev) => {
      return [classroom, ...prev]
    })
    api("/api/classrooms", {
      method: "POST",
      body: JSON.stringify(classroom),
    }).catch(() => {})
  }, [])

  const removeClassroom = useCallback((id: string) => {
    setClassrooms((prev) => {
      return prev.filter((c) => c.id !== id)
    })
    api(`/api/classrooms/${id}`, { method: "DELETE" }).catch(() => {})
  }, [])

  const getClassroom = useCallback((id: string) => {
    return classrooms.find((c) => c.id === id)
  }, [classrooms])

  return (
    <ClassroomStoreContext.Provider value={{ classrooms, isLoading, addClassroom, removeClassroom, getClassroom }}>
      {children}
    </ClassroomStoreContext.Provider>
  )
}

export function useClassroomStore() {
  const ctx = useContext(ClassroomStoreContext)
  if (!ctx) throw new Error("useClassroomStore must be used within ClassroomStoreProvider")
  return ctx
}
