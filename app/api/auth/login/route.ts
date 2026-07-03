import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signAuthToken, setAuthCookie } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const ok = await bcrypt.compare(body.password, user.password)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const token = await signAuthToken({ id: user.id, email: user.email, name: user.name, role: user.role })
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
    setAuthCookie(res, token)
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Login failed" }, { status: 500 })
  }
}
