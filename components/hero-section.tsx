"use client"

import { SilentProofLogo } from "@/components/silent-proof-logo"
import { Button } from "@/components/ui/button"
import { Shield, Play, LogIn } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(217 91% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217 91% 60%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl text-center">
        <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse-glow" />
            <SilentProofLogo size={80} className="relative" />
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary tracking-wide uppercase">AI-Powered Integrity System</span>
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance">
            Silent<span className="text-primary">Proof</span>
          </h1>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl text-pretty">
            Privacy-First Intelligent Exam Monitoring
          </p>
          <p className="mt-3 text-sm text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
            Real-time AI analysis of exam hall integrity with zero intrusion.
            Monitor, detect, and respond — silently and intelligently.
          </p>
        </div>

        <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 mt-4" style={{ animationDelay: "400ms" }}>
          <Button asChild size="lg" className="gap-2 px-8 h-12 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25">
            <Link href="/dashboard/demo">
              <Play className="h-4 w-4" />
              Demo Mode
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 px-8 h-12 text-sm font-semibold border-border/50 text-foreground hover:bg-secondary hover:text-foreground rounded-xl bg-transparent">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>

        <div className="animate-fade-in-up mt-12 grid grid-cols-3 gap-8 md:gap-16" style={{ animationDelay: "500ms" }}>
          {[
            { value: "99.7%", label: "Detection Accuracy" },
            { value: "<50ms", label: "Response Time" },
            { value: "Zero", label: "Privacy Intrusion" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
