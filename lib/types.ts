export type UserRole = "admin" | "invigilator"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export type SeatStatus = "normal" | "warning" | "alert" | "empty" | "restricted"

export interface Seat {
  id: string
  row: number
  col: number
  status: SeatStatus
  score: number
  studentId: string
}

export type EventType = "whisper" | "repeated_whisper" | "paper_rustle" | "none"

export interface SeatEvent {
  seatId: string
  row: number
  col: number
  eventType: EventType
  triggerTime: number // seconds from start
}

export interface ClassroomConfig {
  id: string
  name: string
  rows: number
  cols: number
  sectionRows?: number
  sectionCols?: number
  seats: SeatTemplate[]
  events: SeatEvent[]
  createdAt: string
  createdBy: string
}

export interface SeatTemplate {
  id: string
  row: number
  col: number
  status: "active" | "empty" | "restricted"
}

export type Severity = "low" | "medium" | "high"

export interface Alert {
  id: string
  message: string
  studentId: string
  severity: Severity
  timestamp: string
  type: string
  seatRow: number
  seatCol: number
}

export interface TimelineEvent {
  id: string
  time: string
  message: string
  type: "info" | "warning" | "success" | "alert"
}
