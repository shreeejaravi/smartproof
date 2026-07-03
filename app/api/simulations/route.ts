import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const simulations = await prisma.simulation.findMany({
    include: { classroom: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    simulations: simulations.map((s) => ({
      id: s.id,
      name: s.name ?? s.classroom.name,
      status: s.status,
      classroomId: s.classroomId,
      createdAt: s.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.classroomId) {
    return NextResponse.json({ error: "Missing classroomId" }, { status: 400 })
  }

  const simulation = await prisma.simulation.create({
    data: {
      name: body.name ?? null,
      classroomId: body.classroomId,
      status: body.status ?? "created",
    },
  })

  return NextResponse.json({ id: simulation.id })
}
