import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const alerts = await prisma.alert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    alerts: alerts.map((a) => ({
      id: a.id,
      message: a.message,
      studentId: a.studentId,
      severity: a.severity,
      timestamp: a.createdAt.toISOString(),
      type: a.type,
      seatRow: a.seatRow,
      seatCol: a.seatCol,
    })),
  })
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.message || !body?.studentId || !body?.severity || !body?.type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const alert = await prisma.alert.create({
    data: {
      message: body.message,
      studentId: body.studentId,
      severity: body.severity,
      type: body.type,
      seatRow: body.seatRow ?? 0,
      seatCol: body.seatCol ?? 0,
      userId: user.id,
    },
  })

  return NextResponse.json({ id: alert.id })
}
