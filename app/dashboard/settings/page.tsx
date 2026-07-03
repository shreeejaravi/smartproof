"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, Bell, Sliders, Monitor, User } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(false)
  const [autoResolve, setAutoResolve] = useState(true)
  const [driftRate, setDriftRate] = useState("4")
  const [alertThreshold, setAlertThreshold] = useState("30")

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Configure your monitoring preferences" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-8 max-w-2xl">
          {/* Profile */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {user?.role === "admin" ? <Shield className="h-3 w-3 text-primary" /> : <Eye className="h-3 w-3 text-accent" />}
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="flex flex-col gap-4">
              <ToggleRow
                label="Alert Notifications"
                description="Receive notifications for new alerts"
                enabled={notifications}
                onToggle={() => setNotifications(!notifications)}
              />
              <ToggleRow
                label="Sound Alerts"
                description="Play audio for high-severity alerts"
                enabled={soundAlerts}
                onToggle={() => setSoundAlerts(!soundAlerts)}
              />
              <ToggleRow
                label="Auto-Resolve Low Alerts"
                description="Automatically resolve low-severity alerts after 5 minutes"
                enabled={autoResolve}
                onToggle={() => setAutoResolve(!autoResolve)}
              />
            </div>
          </div>

          {/* Simulation */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Sliders className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Simulation Engine</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Score Drift Interval (seconds)</Label>
                <Input
                  type="number"
                  value={driftRate}
                  onChange={(e) => setDriftRate(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/50 border-border/50 text-foreground max-w-xs"
                  min="1"
                  max="30"
                />
                <p className="text-[10px] text-muted-foreground">How often random score drift is applied during simulation</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Alert Threshold Score</Label>
                <Input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/50 border-border/50 text-foreground max-w-xs"
                  min="10"
                  max="50"
                />
                <p className="text-[10px] text-muted-foreground">Scores below this value trigger an alert status</p>
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Monitor className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Display</h2>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                SilentProof uses a dark enterprise theme optimized for monitoring environments. Theme customization coming soon.
              </p>
            </div>
          </div>

          <div className="pb-6">
            <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200",
          enabled ? "bg-primary" : "bg-secondary"
        )}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground transition-transform duration-200",
            enabled && "translate-x-5",
            !enabled && "bg-muted-foreground"
          )}
        />
      </button>
    </div>
  )
}
