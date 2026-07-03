"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { AlertTriangle, XCircle, Info, Clock, CheckCircle, Filter } from "lucide-react"
import type { Severity } from "@/lib/types"

interface AlertItem {
  id: string
  message: string
  studentId: string
  severity: Severity
  timestamp: string
  type: string
  room: string
  resolved: boolean
}

const mockAlerts: AlertItem[] = [
  { id: "1", message: "Repeated whispering pattern detected between adjacent seats", studentId: "STU-012", severity: "high", timestamp: "2 min ago", type: "Repeated Whisper", room: "Room 204-A", resolved: false },
  { id: "2", message: "Unusual paper rustling near seat area", studentId: "STU-034", severity: "medium", timestamp: "5 min ago", type: "Paper Rustle", room: "Room 204-A", resolved: false },
  { id: "3", message: "Extended period of low-volume verbal activity", studentId: "STU-007", severity: "high", timestamp: "8 min ago", type: "Whisper", room: "Room 108-B", resolved: false },
  { id: "4", message: "Brief interaction detected with adjacent seat", studentId: "STU-041", severity: "low", timestamp: "12 min ago", type: "Proximity Alert", room: "Room 204-A", resolved: true },
  { id: "5", message: "Minor paper movement anomaly", studentId: "STU-019", severity: "low", timestamp: "15 min ago", type: "Paper Rustle", room: "Room 108-B", resolved: true },
  { id: "6", message: "Verbal exchange detected in quiet zone", studentId: "STU-025", severity: "medium", timestamp: "20 min ago", type: "Whisper", room: "Room 204-A", resolved: true },
  { id: "7", message: "Sustained whispering with neighbor", studentId: "STU-003", severity: "high", timestamp: "25 min ago", type: "Repeated Whisper", room: "Room 108-B", resolved: false },
  { id: "8", message: "Paper shuffle near restricted zone", studentId: "STU-048", severity: "low", timestamp: "30 min ago", type: "Paper Rustle", room: "Room 204-A", resolved: true },
]

const severityConfig: Record<Severity, { icon: typeof XCircle; color: string; bg: string; border: string; badge: string }> = {
  high: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", badge: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", badge: "bg-warning/10 text-warning border-warning/20" },
  low: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", badge: "bg-primary/10 text-primary border-primary/20" },
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | Severity>("all")
  const [showResolved, setShowResolved] = useState(true)
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  useEffect(() => {
    setAlerts(mockAlerts)
  }, [])

  const filtered = alerts.filter((a) => {
    if (filter !== "all" && a.severity !== filter) return false
    if (!showResolved && a.resolved) return false
    return true
  })

  function toggleResolve(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: !a.resolved } : a)))
  }

  const highCount = alerts.filter((a) => a.severity === "high" && !a.resolved).length
  const medCount = alerts.filter((a) => a.severity === "medium" && !a.resolved).length
  const unresolvedCount = alerts.filter((a) => !a.resolved).length

  return (
    <>
      <DashboardHeader title="Alert Center" subtitle={`${unresolvedCount} unresolved alerts`} alertCount={highCount} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6 max-w-4xl">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-destructive/20 bg-destructive/5">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{highCount}</p>
                <p className="text-[11px] text-muted-foreground">Critical</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-warning/20 bg-warning/5">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-foreground">{medCount}</p>
                <p className="text-[11px] text-muted-foreground">Medium</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-accent/20 bg-accent/5">
              <CheckCircle className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">{alerts.filter((a) => a.resolved).length}</p>
                <p className="text-[11px] text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50">
              {(["all", "high", "medium", "low"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200",
                    filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                showResolved ? "bg-secondary/50 text-foreground border-border/50" : "bg-card text-muted-foreground border-border/30"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              {showResolved ? "Showing all" : "Hiding resolved"}
            </button>
          </div>

          {/* Alert list */}
          <div className="flex flex-col gap-3">
            {filtered.map((alert, idx) => {
              const config = severityConfig[alert.severity]
              const Icon = config.icon
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex gap-4 p-4 rounded-2xl border transition-all duration-300 animate-fade-in-up",
                    alert.resolved ? "opacity-60 bg-secondary/20 border-border/30" : cn(config.bg, config.border)
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={cn("shrink-0 mt-0.5", config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{alert.type}</span>
                      <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-medium uppercase border", config.badge)}>{alert.severity}</span>
                      {alert.resolved && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">Resolved</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-mono text-muted-foreground/70 px-1.5 py-0.5 rounded bg-background/50">{alert.studentId}</span>
                      <span className="text-[10px] text-muted-foreground/70">{alert.room}</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleResolve(alert.id)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                      alert.resolved
                        ? "border-border/30 text-muted-foreground hover:text-foreground hover:border-border"
                        : "border-accent/30 text-accent bg-accent/10 hover:bg-accent/20"
                    )}
                  >
                    {alert.resolved ? "Unresolve" : "Resolve"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
