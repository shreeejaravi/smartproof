import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { ClassroomStoreProvider } from "@/lib/classroom-store"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

export const metadata: Metadata = {
  title: "SilentProof - AI-Based Exam Hall Integrity System",
  description:
    "Privacy-First Intelligent Exam Monitoring. AI-powered system for maintaining academic integrity with real-time classroom monitoring.",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ClassroomStoreProvider>{children}</ClassroomStoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
