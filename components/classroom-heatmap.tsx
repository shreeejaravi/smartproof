"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"

type SeatStatus = "normal" | "warning" | "alert" | "empty"

interface Seat {
  id: string
  row: number
  col: number
  status: SeatStatus
  score: number
  studentId: string
  prevScore?: number
}

function generateSeats(): Seat[] {
  const seats: Seat[] = []
  const rows = 6
  const cols = 8

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isEmpty = Math.random() < 0.06
      const score = isEmpty ? 0 : Math.floor(Math.random() * 40) + 60
      let status: SeatStatus = "normal"
      if (isEmpty) {
        status = "empty"
      } else if (score < 30) {
        status = "alert"
      } else if (score < 60) {
        status = "warning"
      }

      seats.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        status,
        score,
        studentId: isEmpty ? "" : `STU-${String(r * cols + c + 1).padStart(3, "0")}`,
      })
    }
  }
  return seats
}

const statusStyles: Record<SeatStatus, string> = {
  normal: "bg-accent/20 border-accent/30 hover:border-accent/60",
  warning: "bg-warning/15 border-warning/30 hover:border-warning/60",
  alert: "bg-destructive/15 border-destructive/30 hover:border-destructive/60 animate-heatmap-pulse",
  empty: "bg-secondary/30 border-border/30 opacity-40",
}

const statusDotColor: Record<SeatStatus, string> = {
  normal: "bg-accent",
  warning: "bg-warning",
  alert: "bg-destructive",
  empty: "bg-muted-foreground/30",
}

export function ClassroomHeatmap() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [changedSeats, setChangedSeats] = useState<Set<string>>(new Set())
  const prevScoresRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    setSeats(generateSeats())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSeats((prev) => {
        const changed = new Set<string>()
        const updated = prev.map((seat) => {
          if (seat.status === "empty") return seat
          const drift = Math.floor(Math.random() * 9) - 4
          const newScore = Math.max(0, Math.min(100, seat.score + drift))
          let newStatus: SeatStatus = "normal"
          if (newScore < 30) newStatus = "alert"
          else if (newScore < 60) newStatus = "warning"

          if (newStatus !== seat.status) changed.add(seat.id)

          return { ...seat, score: newScore, status: newStatus, prevScore: seat.score }
        })
        setChangedSeats(changed)
        setTimeout(() => setChangedSeats(new Set()), 600)
        return updated
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Update selected seat if it changed
  useEffect(() => {
    if (selectedSeat) {
      const updated = seats.find((s) => s.id === selectedSeat.id)
      if (updated) setSelectedSeat(updated)
    }
  }, [seats, selectedSeat])

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Classroom Heatmap</h2>
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

      <div className="grid grid-cols-8 gap-2">
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => seat.status !== "empty" && setSelectedSeat(seat)}
            disabled={seat.status === "empty"}
            className={cn(
              "relative aspect-square rounded-xl border transition-all duration-500 flex flex-col items-center justify-center gap-0.5",
              statusStyles[seat.status],
              changedSeats.has(seat.id) && "animate-score-pop",
              selectedSeat?.id === seat.id && "ring-2 ring-primary ring-offset-1 ring-offset-background",
              seat.status !== "empty" && "cursor-pointer hover:scale-105"
            )}
            aria-label={seat.status === "empty" ? "Empty seat" : `Seat ${seat.studentId}, score ${seat.score}`}
          >
            {seat.status !== "empty" && (
              <>
                <span className={cn(
                  "text-[10px] font-mono font-bold transition-colors duration-500",
                  seat.status === "alert" ? "text-destructive" : seat.status === "warning" ? "text-warning" : "text-foreground/90"
                )}>
                  {seat.score}
                </span>
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
            <div className="flex items-center gap-3">
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
              </div>
              {/* Animated score bar */}
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      selectedSeat.status === "normal" && "bg-accent",
                      selectedSeat.status === "warning" && "bg-warning",
                      selectedSeat.status === "alert" && "bg-destructive",
                    )}
                    style={{ width: `${selectedSeat.score}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground">{selectedSeat.score}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
