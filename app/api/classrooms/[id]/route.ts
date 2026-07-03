import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(_: Request, context: any) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const params = (context as any).params
  const resolvedParams = typeof params?.then === 'function' ? await params : params

  const classroom = await prisma.classroom.findFirst({
    where: { id: resolvedParams.id, createdBy: user.id },
    include: { seats: true, events: true },
  })
  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    id: classroom.id,
    name: classroom.name,
    rows: classroom.rows,
    cols: classroom.cols,
    sectionRows: classroom.sectionRows ?? undefined,
    sectionCols: classroom.sectionCols ?? undefined,
    createdAt: classroom.createdAt.toISOString(),
    createdBy: classroom.createdBy,
    seats: classroom.seats.map((s) => ({
      id: `${s.row}-${s.col}`,
      row: s.row,
      col: s.col,
      status: s.status as "active" | "empty" | "restricted",
    })),
    events: classroom.events.map((e) => ({
      seatId: `${e.seatRow}-${e.seatCol}`,
      row: e.seatRow,
      col: e.seatCol,
      eventType: e.eventType as "whisper" | "repeated_whisper" | "paper_rustle" | "none",
      triggerTime: e.triggerTime,
    })),
  })
}

export async function DELETE(_: Request, context: any) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const params = (context as any).params
  const resolvedParams = typeof params?.then === 'function' ? await params : params

  await prisma.classroom.deleteMany({ where: { id: resolvedParams.id, createdBy: user.id } })
  return NextResponse.json({ ok: true })
}
