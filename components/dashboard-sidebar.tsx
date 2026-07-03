"use client"

import { SilentProofLogo } from "@/components/silent-proof-logo"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutGrid,
  AlertTriangle,
  Play,
  Plus,
  Save,
  Sliders,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

interface NavItem {
  icon: typeof LayoutGrid
  label: string
  href: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: Play, label: "Demo Mode", href: "/dashboard/demo" },
  { icon: Plus, label: "Create Classroom", href: "/dashboard/create", adminOnly: true },
  { icon: Save, label: "Saved Classrooms", href: "/dashboard/classrooms" },
  { icon: Sliders, label: "Simulation Manager", href: "/dashboard/simulate" },
  { icon: AlertTriangle, label: "Alerts", href: "/dashboard/alerts" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const filteredNav = navItems.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") return false
    return true
  })

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-border/50 bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50 shrink-0">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <SilentProofLogo size={32} className="shrink-0" />
          {!collapsed && (
            <span className="text-sm font-bold text-foreground truncate">SilentProof</span>
          )}
        </Link>
      </div>

      {/* User info */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
              {user.role === "admin" ? <Shield className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto" aria-label="Dashboard navigation">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Navigation</p>
        )}
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Status indicator */}
      <div className="px-3 pb-2 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl bg-accent/10 border border-accent/20",
            collapsed && "justify-center"
          )}
        >
          <div className="relative shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent animate-ping opacity-75" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent truncate">System Active</p>
              <p className="text-[10px] text-muted-foreground truncate">Monitoring ready</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}
