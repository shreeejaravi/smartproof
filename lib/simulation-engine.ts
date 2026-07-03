import type { Seat, SeatStatus, SeatEvent, SeatTemplate, Alert, TimelineEvent, ClassroomConfig } from "@/lib/types"

// Demo scenario: 6x8 with pre-scripted cinematic events
const DEMO_EVENTS: SeatEvent[] = [
  { seatId: "1-3", row: 1, col: 3, eventType: "whisper", triggerTime: 8 },
  { seatId: "0-6", row: 0, col: 6, eventType: "paper_rustle", triggerTime: 15 },
  { seatId: "2-1", row: 2, col: 1, eventType: "repeated_whisper", triggerTime: 22 },
  { seatId: "3-5", row: 3, col: 5, eventType: "whisper", triggerTime: 35 },
  { seatId: "4-2", row: 4, col: 2, eventType: "paper_rustle", triggerTime: 45 },
  { seatId: "1-7", row: 1, col: 7, eventType: "repeated_whisper", triggerTime: 55 },
  { seatId: "5-4", row: 5, col: 4, eventType: "whisper", triggerTime: 65 },
  { seatId: "3-0", row: 3, col: 0, eventType: "paper_rustle", triggerTime: 78 },
  { seatId: "0-2", row: 0, col: 2, eventType: "repeated_whisper", triggerTime: 90 },
  { seatId: "4-6", row: 4, col: 6, eventType: "whisper", triggerTime: 100 },
]

const EVENT_IMPACT: Record<string, number> = {
  whisper: -15,
  repeated_whisper: -30,
  paper_rustle: -10,
}

const ALERT_MESSAGES: Record<string, string[]> = {
  whisper: ["Whisper detected in proximity zone", "Low-volume verbal activity detected"],
  repeated_whisper: ["Repeated whispering pattern detected", "Sustained verbal exchange flagged"],
  paper_rustle: ["Paper rustling anomaly detected", "Unusual paper movement near seat"],
}

export function generateDemoSeats(): Seat[] {
  const seats: Seat[] = []
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      seats.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        status: "normal",
        score: 85 + Math.floor(Math.random() * 15),
        studentId: `STU-${String(r * 8 + c + 1).padStart(3, "0")}`,
      })
    }
  }
  return seats
}

export function generateCustomSeats(config: ClassroomConfig): Seat[] {
  return config.seats.map((template) => {
    if (template.status === "empty") {
      return {
        id: template.id,
        row: template.row,
        col: template.col,
        status: "empty" as SeatStatus,
        score: 0,
        studentId: "",
      }
    }
    if (template.status === "restricted") {
      return {
        id: template.id,
        row: template.row,
        col: template.col,
        status: "empty" as SeatStatus,
        score: 0,
        studentId: "",
      }
    }
    return {
      id: template.id,
      row: template.row,
      col: template.col,
      status: "normal" as SeatStatus,
      score: 85 + Math.floor(Math.random() * 15),
      studentId: `STU-${String(template.row * config.cols + template.col + 1).padStart(3, "0")}`,
    }
  })
}

export function getDemoEvents(): SeatEvent[] {
  return DEMO_EVENTS
}

export function processEvent(
  seats: Seat[],
  event: SeatEvent
): {
  updatedSeats: Seat[]
  alert: Alert
  timelineEvent: TimelineEvent
} {
  const impact = EVENT_IMPACT[event.eventType] || -10
  const messages = ALERT_MESSAGES[event.eventType] || ["Anomaly detected"]
  const message = messages[Math.floor(Math.random() * messages.length)]

  const severity = event.eventType === "repeated_whisper" ? "high" : event.eventType === "whisper" ? "medium" : "low"

  const updatedSeats = seats.map((seat) => {
    if (seat.id === event.seatId) {
      const newScore = Math.max(0, seat.score + impact)
      let newStatus: SeatStatus = "normal"
      if (newScore < 30) newStatus = "alert"
      else if (newScore < 60) newStatus = "warning"
      return { ...seat, score: newScore, status: newStatus }
    }
    // Proximity impact: adjacent seats get minor hit
    if (
      seat.status !== "empty" &&
      Math.abs(seat.row - event.row) <= 1 &&
      Math.abs(seat.col - event.col) <= 1 &&
      seat.id !== event.seatId
    ) {
      const proximityImpact = Math.floor(impact * 0.3)
      const newScore = Math.max(0, seat.score + proximityImpact)
      let newStatus: SeatStatus = "normal"
      if (newScore < 30) newStatus = "alert"
      else if (newScore < 60) newStatus = "warning"
      return { ...seat, score: newScore, status: newStatus }
    }
    return seat
  })

  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  const targetSeat = seats.find((s) => s.id === event.seatId)
  const alert: Alert = {
    id: crypto.randomUUID(),
    message,
    studentId: targetSeat?.studentId || `R${event.row + 1}C${event.col + 1}`,
    severity,
    timestamp: "just now",
    type: event.eventType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    seatRow: event.row,
    seatCol: event.col,
  }

  const timelineEvent: TimelineEvent = {
    id: crypto.randomUUID(),
    time: timeStr,
    message: `${alert.type}: ${message} at Row ${event.row + 1}, Col ${event.col + 1}`,
    type: severity === "high" ? "alert" : severity === "medium" ? "warning" : "info",
  }

  return { updatedSeats, alert, timelineEvent }
}

// Natural score drift for realism
export function applyDrift(seats: Seat[]): Seat[] {
  return seats.map((seat) => {
    if (seat.status === "empty") return seat
    const drift = Math.floor(Math.random() * 5) - 2
    const recovery = seat.score < 70 ? 1 : 0
    const newScore = Math.max(0, Math.min(100, seat.score + drift + recovery))
    let newStatus: SeatStatus = "normal"
    if (newScore < 30) newStatus = "alert"
    else if (newScore < 60) newStatus = "warning"
    return { ...seat, score: newScore, status: newStatus }
  })
}
