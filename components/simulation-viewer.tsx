"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { Seat, SeatStatus, SeatEvent, Alert, TimelineEvent } from "@/lib/types"
import { processEvent, applyDrift } from "@/lib/simulation-engine"
import { Play, Pause, RotateCcw, Clock, AlertTriangle, XCircle, Info } from "lucide-react"

const statusStyles: Record<SeatStatus, string> = {
  normal: "bg-accent/20 border-accent/30",
  warning: "bg-warning/15 border-warning/30",
  alert: "bg-destructive/15 border-destructive/30",
  empty: "bg-secondary/30 border-border/30 opacity-40",
  restricted: "bg-secondary/30 border-border/30 opacity-40",
}

const statusDotColor: Record<SeatStatus, string> = {
  normal: "bg-accent",
  warning: "bg-warning",
  alert: "bg-destructive",
  empty: "bg-muted-foreground/30",
  restricted: "bg-muted-foreground/30",
}

const severityConfig = {
  high: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  medium: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  low: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
}

export function SimulationViewer({
  initialSeats,
  events,
  cols,
  title = "Simulation",
}: {
  initialSeats: Seat[]
  events: SeatEvent[]
  cols: number
  title?: string
}) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const triggeredRef = useRef<Set<number>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const reset = useCallback(() => {
    setSeats(initialSeats.map((s) => ({ ...s })))
    setAlerts([])
    setTimeline([
      { id: "start", time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }), message: "Monitoring session initialized", type: "success" as const },
    ])
    setElapsed(0)
    setIsRunning(false)
    setSelectedSeat(null)
    triggeredRef.current = new Set()
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [initialSeats])

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1

        // Check for events to trigger
        events.forEach((event, idx) => {
          if (event.triggerTime === next && !triggeredRef.current.has(idx)) {
            triggeredRef.current.add(idx)
            setSeats((currentSeats) => {
              const { updatedSeats, alert, timelineEvent } = processEvent(currentSeats, event)
              setAlerts((a) => [alert, ...a])
              setTimeline((t) => [timelineEvent, ...t])
              return updatedSeats
            })
          }
        })

        // Apply drift every 4 seconds
        if (next % 4 === 0) {
          setSeats((currentSeats) => applyDrift(currentSeats))
        }

        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, events])

  const integrityScore =
    seats.filter((s) => s.status !== "empty" && s.status !== "restricted").length > 0
      ? (
          seats
            .filter((s) => s.status !== "empty" && s.status !== "restricted")
            .reduce((acc, s) => acc + s.score, 0) /
          seats.filter((s) => s.status !== "empty" && s.status !== "restricted").length
        ).toFixed(1)
      : "0.0"

  const alertCount = alerts.filter((a) => a.severity === "high").length
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-mono text-foreground">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          {isRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-destructive animate-ping" />
              </div>
              <span className="text-xs font-semibold text-destructive">LIVE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "gap-2 rounded-xl",
              isRunning
                ? "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            variant={isRunning ? "outline" : "default"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={reset} className="gap-2 rounded-xl border-border/50 bg-transparent text-foreground">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Integrity Score</p>
            <p className="text-2xl font-bold text-foreground">{integrityScore}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Alerts</p>
            <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-foreground">{alertCount}</p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Classroom Heatmap</p>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time seat integrity visualization</p>
            </div>
            <div className="flex items-center gap-4">
              {(["normal", "warning", "alert"] as const).map((status) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={cn("w-2.5 h-2.5 rounded-full", statusDotColor[status])} />
                  <span className="text-[11px] text-muted-foreground capitalize">{status === "normal" ? "Safe" : status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 px-2">
            <div className="h-1.5 rounded-full bg-primary/20 w-full" />
            <p className="text-[10px] text-muted-foreground text-center mt-1 uppercase tracking-widest">Front of Room</p>
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {seats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => seat.status !== "empty" && seat.status !== "restricted" && setSelectedSeat(seat)}
                disabled={seat.status === "empty" || seat.status === "restricted"}
                className={cn(
                  "relative aspect-square rounded-xl border transition-all duration-500 flex flex-col items-center justify-center gap-0.5",
                  statusStyles[seat.status],
                  seat.status === "alert" && "animate-pulse-glow",
                  selectedSeat?.id === seat.id && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  seat.status !== "empty" && seat.status !== "restricted" && "cursor-pointer hover:scale-105"
                )}
                aria-label={seat.status === "empty" ? "Empty seat" : `Seat ${seat.studentId}, score ${seat.score}`}
              >
                {seat.status !== "empty" && seat.status !== "restricted" && (
                  <>
                    <span className="text-[10px] font-mono font-bold text-foreground/90">{seat.score}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full transition-colors duration-500", statusDotColor[seat.status])} />
                  </>
                )}
              </button>
            ))}
          </div>

          {selectedSeat && (
            <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">{selectedSeat.studentId}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Row {selectedSeat.row + 1}, Seat {selectedSeat.col + 1}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", statusDotColor[selectedSeat.status])} />
                  <span className={cn(
                    "text-xs font-semibold capitalize",
                    selectedSeat.status === "normal" && "text-accent",
                    selectedSeat.status === "warning" && "text-warning",
                    selectedSeat.status === "alert" && "text-destructive",
                  )}>
                    {selectedSeat.status === "normal" ? "Safe" : selectedSeat.status}
                  </span>
                  <span className="text-sm font-bold text-foreground ml-2">{selectedSeat.score}/100</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alerts + Timeline */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Alerts */}
          <div className="rounded-2xl border border-border/50 bg-card p-4 flex-1 max-h-[350px] flex flex-col">
            <p className="text-sm font-semibold text-foreground mb-3">Live Alerts</p>
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">No alerts yet. Start the simulation.</p>
                </div>
              ) : (
                alerts.slice(0, 10).map((alert, idx) => {
                  const config = severityConfig[alert.severity]
                  const Icon = config.icon
                  return (
                    <div
                      key={alert.id}
                      className={cn("flex gap-2.5 p-2.5 rounded-xl border animate-fade-in-up", config.border, config.bg)}
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <Icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", config.color)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-foreground truncate">{alert.type}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{alert.message}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-background/50 text-[9px] font-mono text-muted-foreground">
                          {alert.studentId}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-border/50 bg-card p-4 max-h-[250px] flex flex-col">
            <p className="text-sm font-semibold text-foreground mb-3">Activity Log</p>
            <div className="flex-1 flex flex-col gap-0 overflow-y-auto">
              {timeline.slice(0, 8).map((event, idx) => {
                const dotColor = event.type === "alert" ? "bg-destructive" : event.type === "warning" ? "bg-warning" : event.type === "success" ? "bg-accent" : "bg-primary"
                return (
                  <div key={event.id} className="flex gap-2.5 group">
                    <div className="flex flex-col items-center">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", dotColor)} />
                      {idx < timeline.slice(0, 8).length - 1 && <div className="w-px flex-1 bg-border/50 my-0.5" />}
                    </div>
                    <div className="pb-2.5 min-w-0">
                      <span className="text-[9px] font-mono text-muted-foreground">{event.time}</span>
                      <p className="text-[10px] text-foreground/80 leading-relaxed">{event.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
