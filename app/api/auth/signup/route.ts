import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signAuthToken, setAuthCookie } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) {
    const ok = await bcrypt.compare(body.password, existing.password)
    if (!ok) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }
    const token = await signAuthToken({ id: existing.id, email: existing.email, name: existing.name, role: existing.role })
    const res = NextResponse.json({ id: existing.id, name: existing.name, email: existing.email, role: existing.role })
    setAuthCookie(res, token)
    return res
  }

  const hashed = await bcrypt.hash(body.password, 10)
  const role = typeof body.role === "string" ? body.role : "invigilator"

  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, password: hashed, role },
  })

  const token = await signAuthToken({ id: user.id, email: user.email, name: user.name, role: user.role })
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  setAuthCookie(res, token)
  return res
}
