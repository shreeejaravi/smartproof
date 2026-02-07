"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function DashboardHeader({
  title,
  subtitle,
  alertCount = 3,
}: {
  title: string
  subtitle?: string
  alertCount?: number
}) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
              {alertCount}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-destructive animate-ping" />
          </div>
          <span className="text-xs font-semibold text-destructive">LIVE</span>
        </div>

        {user && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
        )}
      </div>
    </header>
  )
}
