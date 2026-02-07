import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const classrooms = await prisma.classroom.findMany({
    where: { createdBy: user.id },
    include: { seats: true, events: true },
    orderBy: { createdAt: "desc" },
  })

  const payload = classrooms.map((c) => ({
    id: c.id,
    name: c.name,
    rows: c.rows,
    cols: c.cols,
    sectionRows: c.sectionRows ?? undefined,
    sectionCols: c.sectionCols ?? undefined,
    createdAt: c.createdAt.toISOString(),
    createdBy: c.createdBy,
    seats: c.seats.map((s) => ({
      id: `${s.row}-${s.col}`,
      row: s.row,
      col: s.col,
      status: s.status as "active" | "empty" | "restricted",
    })),
    events: c.events.map((e) => ({
      seatId: `${e.seatRow}-${e.seatCol}`,
      row: e.seatRow,
      col: e.seatCol,
      eventType: e.eventType as "whisper" | "repeated_whisper" | "paper_rustle" | "none",
      triggerTime: e.triggerTime,
    })),
  }))

  return NextResponse.json({ classrooms: payload })
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.name || !body?.rows || !body?.cols) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const classroom = await prisma.classroom.create({
    data: {
      name: body.name,
      rows: body.rows,
      cols: body.cols,
      sectionRows: body.sectionRows ?? null,
      sectionCols: body.sectionCols ?? null,
      createdBy: user.id,
    },
  })

  if (Array.isArray(body.seats) && body.seats.length > 0) {
    await prisma.seatTemplate.createMany({
      data: body.seats.map((s: any) => ({
        classroomId: classroom.id,
        row: s.row,
        col: s.col,
        status: s.status,
      })),
    })
  }

  if (Array.isArray(body.events) && body.events.length > 0) {
    await prisma.seatEvent.createMany({
      data: body.events.map((e: any) => ({
        classroomId: classroom.id,
        seatRow: e.row,
        seatCol: e.col,
        eventType: e.eventType,
        triggerTime: e.triggerTime,
      })),
    })
  }

  return NextResponse.json({ id: classroom.id })
}
