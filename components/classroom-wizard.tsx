"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useClassroomStore } from "@/lib/classroom-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SeatTemplate, SeatEvent, EventType, ClassroomConfig } from "@/lib/types"
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Grid3X3,
  MousePointerClick,
  Zap,
  Eye,
  Save,
  Minus,
  Plus,
  Mic,
} from "lucide-react"

const STEPS = [
  { label: "Details", icon: Grid3X3 },
  { label: "Seat Layout", icon: MousePointerClick },
  { label: "Events", icon: Zap },
  { label: "Preview", icon: Eye },
]

type SeatStatusType = "active" | "empty" | "restricted"

const seatStatusStyles: Record<SeatStatusType, string> = {
  active: "bg-accent/20 border-accent/30 text-accent",
  empty: "bg-secondary/30 border-border/30 text-muted-foreground opacity-50",
  restricted: "bg-warning/15 border-warning/30 text-warning",
}

export function ClassroomWizard() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [rows, setRows] = useState(6)
  const [cols, setCols] = useState(8)
  const [sectionRows, setSectionRows] = useState(2)
  const [sectionCols, setSectionCols] = useState(2)
  const [seats, setSeats] = useState<SeatTemplate[]>([])
  const [events, setEvents] = useState<SeatEvent[]>([])
  const [editMode, setEditMode] = useState<SeatStatusType>("active")
  const { user } = useAuth()
  const { addClassroom } = useClassroomStore()
  const router = useRouter()

  useEffect(() => {
    setSectionRows((sr) => Math.max(1, Math.min(rows, sr)))
    setSectionCols((sc) => Math.max(1, Math.min(cols, sc)))
  }, [rows, cols])

  // Generate seats when moving to step 2
  const generateSeats = useCallback(() => {
    const newSeats: SeatTemplate[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const existing = seats.find((s) => s.row === r && s.col === c)
        newSeats.push(
          existing || {
            id: `${r}-${c}`,
            row: r,
            col: c,
            status: "active",
          }
        )
      }
    }
    setSeats(newSeats)
  }, [rows, cols, seats])

  function getSectionBounds(index: number, total: number, size: number) {
    const start = Math.floor((size * index) / total)
    const end = Math.max(start, Math.floor((size * (index + 1)) / total) - 1)
    return { start, end }
  }

  function getSectionForSeat(row: number, col: number) {
    const sectionRow = Math.min(sectionRows - 1, Math.floor((row / rows) * sectionRows))
    const sectionCol = Math.min(sectionCols - 1, Math.floor((col / cols) * sectionCols))
    return { sectionRow, sectionCol }
  }

  function getSectionCenter(sectionRow: number, sectionCol: number) {
    const rowBounds = getSectionBounds(sectionRow, sectionRows, rows)
    const colBounds = getSectionBounds(sectionCol, sectionCols, cols)
    const row = Math.floor((rowBounds.start + rowBounds.end) / 2)
    const col = Math.floor((colBounds.start + colBounds.end) / 2)
    return { row, col }
  }

  function getSectionSeat(sectionRow: number, sectionCol: number) {
    const rowBounds = getSectionBounds(sectionRow, sectionRows, rows)
    const colBounds = getSectionBounds(sectionCol, sectionCols, cols)
    const activeSeat = seats.find(
      (seat) =>
        seat.status === "active" &&
        seat.row >= rowBounds.start &&
        seat.row <= rowBounds.end &&
        seat.col >= colBounds.start &&
        seat.col <= colBounds.end
    )
    if (activeSeat) return { row: activeSeat.row, col: activeSeat.col, seatId: activeSeat.id }
    const center = getSectionCenter(sectionRow, sectionCol)
    return { row: center.row, col: center.col, seatId: `${center.row}-${center.col}` }
  }

  function addEventForSection(sectionRow: number, sectionCol: number) {
    const sectionSeat = getSectionSeat(sectionRow, sectionCol)
    const hasEvent = events.some((e) => e.seatId === sectionSeat.seatId)
    if (hasEvent) return
    addEvent(sectionSeat.seatId, sectionSeat.row, sectionSeat.col)
  }

  function toggleSeat(seatId: string) {
    setSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, status: editMode } : s))
    )
  }

  function addEvent(seatId: string, row: number, col: number) {
    setEvents((prev) => [
      ...prev,
      { seatId, row, col, eventType: "whisper" as EventType, triggerTime: 30 },
    ])
  }

  function updateEvent(idx: number, field: "eventType" | "triggerTime", value: string | number) {
    setEvents((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    )
  }

  function removeEvent(idx: number) {
    setEvents((prev) => prev.filter((_, i) => i !== idx))
  }

  function nextStep() {
    if (step === 0) generateSeats()
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function saveClassroom() {
    const config: ClassroomConfig = {
      id: crypto.randomUUID(),
      name: name || "Untitled Classroom",
      rows,
      cols,
      sectionRows,
      sectionCols,
      seats,
      events,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || "unknown",
    }
    addClassroom(config)
    router.push("/dashboard/classrooms")
  }

  const activeSeats = seats.filter((s) => s.status === "active")
  const restrictedSeats = seats.filter((s) => s.status === "restricted")
  const totalSections = sectionRows * sectionCols

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  i === step
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : i < step
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-secondary/50 text-muted-foreground border border-border/30"
                )}
              >
                {i < step ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        {/* Step 1: Details */}
        {step === 0 && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Classroom Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure the basic classroom parameters</p>
            </div>

            <div className="flex flex-col gap-3 max-w-md">
              <div className="flex flex-col gap-2">
                <Label htmlFor="classname" className="text-xs font-medium text-muted-foreground">
                  Classroom Name
                </Label>
                <Input
                  id="classname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Room 204-A — Final Exam"
                  className="h-11 rounded-xl bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Rows</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setRows((r) => Math.max(2, r - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-bold text-foreground w-10 text-center">{rows}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setRows((r) => Math.min(12, r + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Columns</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setCols((c) => Math.max(2, c - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-bold text-foreground w-10 text-center">{cols}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setCols((c) => Math.min(16, c + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Section Rows</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setSectionRows((r) => Math.max(1, r - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-bold text-foreground w-10 text-center">{sectionRows}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setSectionRows((r) => Math.min(rows, r + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Section Columns</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setSectionCols((c) => Math.max(1, c - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-bold text-foreground w-10 text-center">{sectionCols}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border-border/50 bg-transparent"
                      onClick={() => setSectionCols((c) => Math.min(cols, c + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 mt-2">
                <p className="text-xs text-muted-foreground">
                  Grid size: <span className="font-semibold text-foreground">{rows} x {cols}</span> = {rows * cols} total seats
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Sections: <span className="font-semibold text-foreground">{sectionRows} x {sectionCols}</span> = {totalSections} microphone zones
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Seat Layout */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Seat Layout</h2>
                <p className="text-sm text-muted-foreground mt-1">Click seats to assign their status</p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50">
                {(["active", "empty", "restricted"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setEditMode(mode)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200",
                      editMode === mode
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 px-2">
              <div className="h-1.5 rounded-full bg-primary/20 w-full" />
              <p className="text-[10px] text-muted-foreground text-center mt-1 uppercase tracking-widest">Front of Room</p>
            </div>

            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => toggleSeat(seat.id)}
                  className={cn(
                    "aspect-square rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-[10px] font-mono",
                    seatStatusStyles[seat.status]
                  )}
                >
                  <span>{seat.row + 1},{seat.col + 1}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border/40 bg-secondary/20 p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">Section Layout (Microphone Zones)</p>
                <span className="text-[10px] text-muted-foreground">Events target sections, not individual seats</span>
              </div>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${sectionCols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: totalSections }).map((_, idx) => {
                  const sr = Math.floor(idx / sectionCols)
                  const sc = idx % sectionCols
                  return (
                    <div
                      key={`section-${sr}-${sc}`}
                      className="h-12 rounded-xl border border-border/40 bg-card/60 flex items-center justify-center gap-2 text-xs text-muted-foreground"
                    >
                      <Mic className="h-4 w-4 text-accent" />
                      S{sr + 1}C{sc + 1}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent/30 border border-accent/40" />
                <span className="text-[11px] text-muted-foreground">Active ({activeSeats.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-secondary/50 border border-border/40" />
                <span className="text-[11px] text-muted-foreground">Empty ({seats.filter((s) => s.status === "empty").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-warning/20 border border-warning/40" />
                <span className="text-[11px] text-muted-foreground">Restricted ({restrictedSeats.length})</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Events */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Simulation Events</h2>
              <p className="text-sm text-muted-foreground mt-1">Assign events to sections (microphone zones)</p>
            </div>

            {/* Section picker for events */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">Click a section to add an event</p>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${sectionCols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: totalSections }).map((_, idx) => {
                  const sectionRow = Math.floor(idx / sectionCols)
                  const sectionCol = idx % sectionCols
                  const sectionSeat = getSectionSeat(sectionRow, sectionCol)
                  const hasEvent = events.some((e) => e.seatId === sectionSeat.seatId)
                  return (
                    <button
                      key={`event-section-${sectionRow}-${sectionCol}`}
                      onClick={() => addEventForSection(sectionRow, sectionCol)}
                      className={cn(
                        "h-16 rounded-xl border transition-all duration-200 flex items-center justify-center text-[10px] font-mono",
                        hasEvent
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-accent/10 border-accent/20 text-accent/70 hover:border-accent/40"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        S{sectionRow + 1}C{sectionCol + 1}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Event list */}
            {events.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">Configured Events ({events.length})</p>
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                  {events.map((event, idx) => (
                    <div
                      key={`${event.seatId}-${idx}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/30"
                    >
                      {(() => {
                        const section = getSectionForSeat(event.row, event.col)
                        return (
                          <span className="text-xs font-mono text-muted-foreground shrink-0">
                            S{section.sectionRow + 1}C{section.sectionCol + 1}
                          </span>
                        )
                      })()}
                      <select
                        value={event.eventType}
                        onChange={(e) => updateEvent(idx, "eventType", e.target.value)}
                        className="flex-1 h-8 rounded-lg bg-secondary/50 border border-border/50 text-xs text-foreground px-2"
                      >
                        <option value="whisper">Whisper</option>
                        <option value="repeated_whisper">Repeated Whisper</option>
                        <option value="paper_rustle">Paper Rustle</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={event.triggerTime}
                          onChange={(e) => updateEvent(idx, "triggerTime", parseInt(e.target.value) || 0)}
                          className="w-16 h-8 rounded-lg bg-secondary/50 border-border/50 text-xs text-center text-foreground"
                          min={0}
                          max={600}
                        />
                        <span className="text-[10px] text-muted-foreground">sec</span>
                      </div>
                      <button
                        onClick={() => removeEvent(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        aria-label="Remove event"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div className="text-center py-8">
                <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No events configured yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Click an active seat above to add an event</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 3 && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Preview</h2>
              <p className="text-sm text-muted-foreground mt-1">Review your classroom configuration</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-semibold text-foreground">{name || "Untitled"}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Grid</p>
                <p className="text-sm font-semibold text-foreground">{rows} x {cols} ({activeSeats.length} active)</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/30">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Sections</p>
                <p className="text-sm font-semibold text-foreground">{sectionRows} x {sectionCols} ({totalSections} zones)</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/5 border border-warning/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Events</p>
                <p className="text-sm font-semibold text-foreground">{events.length} configured</p>
              </div>
            </div>

            {/* Mini heatmap preview */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Seat Layout Preview</p>
              <div className="mb-2 px-2">
                <div className="h-1 rounded-full bg-primary/20 w-full" />
                <p className="text-[9px] text-muted-foreground text-center mt-0.5 uppercase tracking-widest">Front</p>
              </div>
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {seats.map((seat) => {
                  const hasEvent = events.some((e) => e.seatId === seat.id)
                  return (
                    <div
                      key={seat.id}
                      className={cn(
                        "aspect-square rounded-lg border flex items-center justify-center text-[8px] font-mono transition-all duration-300",
                        seat.status === "active" && !hasEvent && "bg-accent/15 border-accent/25 text-accent/60",
                        seat.status === "active" && hasEvent && "bg-primary/20 border-primary/40 text-primary",
                        seat.status === "empty" && "bg-secondary/20 border-border/20 opacity-30",
                        seat.status === "restricted" && "bg-warning/15 border-warning/25 text-warning/60"
                      )}
                    >
                      {hasEvent ? "E" : seat.status === "active" ? "A" : seat.status === "restricted" ? "R" : ""}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Events summary */}
            {events.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Events Timeline</p>
                <div className="flex flex-col gap-1.5">
                  {events
                    .sort((a, b) => a.triggerTime - b.triggerTime)
                    .map((event, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-muted-foreground w-12">{event.triggerTime}s</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-foreground/80 capitalize">{event.eventType.replace("_", " ")}</span>
                        {(() => {
                          const section = getSectionForSeat(event.row, event.col)
                          return (
                            <span className="text-muted-foreground">
                              at S{section.sectionRow + 1}C{section.sectionCol + 1}
                            </span>
                          )
                        })()}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 0}
          className="gap-2 rounded-xl border-border/50 text-foreground bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {step === STEPS.length - 1 ? (
            <Button onClick={saveClassroom} className="gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="h-4 w-4" />
              Save Classroom
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={step === 0 && !name.trim()}
              className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
