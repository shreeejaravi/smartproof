import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import type { User } from "@/lib/types"

export const COOKIE_NAME = "sp_token"

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not set")
  return new TextEncoder().encode(secret)
}

export async function signAuthToken(payload: { id: string; email: string; name: string; role: string }) {
  const secret = getSecret()
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyAuthToken(token: string) {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret)
  return payload as { id: string; email: string; name: string; role: string }
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { expires: new Date(0), path: "/" })
}

export async function getAuthUser(): Promise<User | null> {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const payload = await verifyAuthToken(token)
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role as User["role"] }
  } catch {
    return null
  }
}
