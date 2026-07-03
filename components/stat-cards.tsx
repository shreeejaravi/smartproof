"use client"

import { Users, ShieldCheck, AlertTriangle, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Total Students",
    value: 48,
    suffix: "",
    change: "Full capacity",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Integrity Score",
    value: 94.2,
    suffix: "%",
    change: "+0.3% from start",
    icon: ShieldCheck,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Active Alerts",
    value: 3,
    suffix: "",
    change: "2 low, 1 medium",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    label: "Monitoring",
    value: 84,
    suffix: "m",
    change: "Exam in progress",
    icon: Eye,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

function AnimatedCounter({ target, suffix, duration = 1200 }: { target: number; suffix: string; duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const steps = 40
    const increment = target / steps
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step >= steps) {
        setCurrent(target)
        clearInterval(interval)
      } else {
        setCurrent(Math.min(step * increment, target))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [target, duration])

  const display = Number.isInteger(target) ? Math.round(current) : current.toFixed(1)

  return (
    <span>
      {display}{suffix}
    </span>
  )
}

export function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className="flex items-start gap-4 p-5 rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl shrink-0", stat.bgColor, stat.color)}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
