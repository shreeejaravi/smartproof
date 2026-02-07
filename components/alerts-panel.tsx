"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Info, XCircle, Clock } from "lucide-react"
import { useState } from "react"

type Severity = "low" | "medium" | "high"

interface Alert {
  id: string
  message: string
  studentId: string
  severity: Severity
  timestamp: string
  type: string
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    message: "Unusual movement pattern detected",
    studentId: "STU-012",
    severity: "high",
    timestamp: "2 min ago",
    type: "Movement Anomaly",
  },
  {
    id: "2",
    message: "Frequent head turning towards neighbor",
    studentId: "STU-034",
    severity: "medium",
    timestamp: "5 min ago",
    type: "Behavioral Flag",
  },
  {
    id: "3",
    message: "Extended period looking away from exam",
    studentId: "STU-007",
    severity: "medium",
    timestamp: "8 min ago",
    type: "Attention Drift",
  },
  {
    id: "4",
    message: "Minor posture change pattern",
    studentId: "STU-041",
    severity: "low",
    timestamp: "12 min ago",
    type: "Posture Analysis",
  },
  {
    id: "5",
    message: "Brief interaction with adjacent seat",
    studentId: "STU-019",
    severity: "low",
    timestamp: "15 min ago",
    type: "Proximity Alert",
  },
]

const severityConfig: Record<Severity, { icon: typeof AlertTriangle; color: string; bgColor: string; borderColor: string }> = {
  high: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
  },
  low: {
    icon: Info,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
}

export function AlertsPanel() {
  const [filter, setFilter] = useState<"all" | Severity>("all")

  const filtered = filter === "all" ? mockAlerts : mockAlerts.filter((a) => a.severity === filter)

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Alert Feed</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{mockAlerts.length} events detected</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-secondary/50">
        {(["all", "high", "medium", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all duration-200",
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {filtered.map((alert, idx) => {
          const config = severityConfig[alert.severity]
          const Icon = config.icon
          return (
            <div
              key={alert.id}
              className={cn(
                "flex gap-3 p-3 rounded-xl border transition-all duration-300",
                config.borderColor,
                config.bgColor,
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={cn("shrink-0 mt-0.5", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-foreground truncate">{alert.type}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-background/50 text-[10px] font-mono text-muted-foreground">
                  {alert.studentId}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
