"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TimelineEvent {
  id: string
  time: string
  message: string
  type: "info" | "warning" | "success"
  isNew?: boolean
}

const initialEvents: TimelineEvent[] = [
  { id: "1", time: "14:24", message: "Integrity score recalculated for all seats", type: "info" },
  { id: "2", time: "14:21", message: "Alert resolved: STU-034 returned to normal behavior", type: "success" },
  { id: "3", time: "14:18", message: "New alert triggered for seat Row 1, Col 4", type: "warning" },
  { id: "4", time: "14:15", message: "System health check passed - all sensors active", type: "success" },
  { id: "5", time: "14:10", message: "Monitoring session started for Room 204-A", type: "info" },
]

const liveMessages = [
  { message: "Score drift applied across all active seats", type: "info" as const },
  { message: "Proximity check completed for flagged zone", type: "success" as const },
  { message: "Minor anomaly detected in Row 3 cluster", type: "warning" as const },
  { message: "Behavioral pattern update for 48 students", type: "info" as const },
  { message: "Alert threshold calibration check passed", type: "success" as const },
]

const dotColor: Record<string, string> = {
  info: "bg-primary",
  warning: "bg-warning",
  success: "bg-accent",
}

export function ActivityTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    setEvents(initialEvents)
  }, [])

  // Add live events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = liveMessages[Math.floor(Math.random() * liveMessages.length)]
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      setEvents((prev) => [
        { id: crypto.randomUUID(), time, message: msg.message, type: msg.type, isNew: true },
        ...prev.slice(0, 7),
      ])
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Activity Log</h2>
          <p className="text-xs text-muted-foreground">Recent system events</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-medium text-accent">Live</span>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {events.map((event, idx) => (
          <div
            key={event.id}
            className={cn("flex gap-3 group", event.isNew && "animate-slide-in-right")}
          >
            <div className="flex flex-col items-center">
              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0 transition-all duration-500", dotColor[event.type])} />
              {idx < events.length - 1 && <div className="w-px flex-1 bg-border/50 my-1" />}
            </div>
            <div className="pb-4 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">{event.time}</span>
                {event.isNew && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-primary/10 text-primary border border-primary/20">NEW</span>
                )}
              </div>
              <p className="text-[11px] text-foreground/80 mt-0.5 leading-relaxed">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
